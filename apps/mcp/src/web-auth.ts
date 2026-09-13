/**
 * W1: Google OAuth flow for web channel.
 *
 * Flow: /auth/google → Google consent → /auth/google/callback → user created/found →
 * anonymous sessions claimed → httpOnly session cookie set → redirect to /
 *
 * No free-text health storage — profile stores structured flags only.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://thailandfunexperiences.com';
const CALLBACK_PATH = '/auth/google/callback';
const SESSION_COOKIE = 'funex_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// ── Session token management ──

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getUserIdFromCookie(request: FastifyRequest): string | null {
  const cookie = (request.headers.cookie ?? '').split(';').find((c) => c.trim().startsWith(SESSION_COOKIE + '='));
  if (!cookie) return null;
  return cookie.split('=')[1]?.trim() ?? null;
}

export async function getUserFromToken(token: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  profile: Record<string, unknown>;
} | null> {
  const rows = await client`
    SELECT id, email, name, profile FROM funex_user WHERE id = ${token} LIMIT 1
  `;
  // Token IS the user ID (stored in cookie). Simple for V1.
  if (rows.length === 0) return null;
  return rows[0] as any;
}

// ── OAuth routes ──

export function registerWebAuth(app: FastifyInstance): void {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('GOOGLE_CLIENT_ID not set — web auth disabled');
    app.get('/auth/google', async (_req, reply) => {
      reply.code(503).send({ error: 'Google OAuth not configured' });
    });
    return;
  }

  // Step 1: Redirect to Google
  app.get('/auth/google', async (request, reply) => {
    // Capture the anonymous session ID to claim after login
    const anonSession = (request.query as Record<string, string>).session ?? '';

    const state = Buffer.from(JSON.stringify({ anonSession })).toString('base64url');

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${SITE_ORIGIN}${CALLBACK_PATH}`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });

    reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  // Step 2: Google callback
  app.get(CALLBACK_PATH, async (request, reply) => {
    const query = request.query as Record<string, string>;
    const code = query.code;
    const stateRaw = query.state ?? '';

    if (!code) {
      reply.code(400).send({ error: 'Missing authorization code' });
      return;
    }

    let anonSession = '';
    try {
      const state = JSON.parse(Buffer.from(stateRaw, 'base64url').toString());
      anonSession = state.anonSession ?? '';
    } catch { /* no state */ }

    // Exchange code for tokens
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SITE_ORIGIN}${CALLBACK_PATH}`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResp.ok) {
      reply.code(502).send({ error: 'Token exchange failed' });
      return;
    }

    const tokens = await tokenResp.json() as { access_token: string; id_token: string };

    // Get user info
    const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResp.ok) {
      reply.code(502).send({ error: 'Failed to fetch user info' });
      return;
    }

    const googleUser = await userResp.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    // Upsert user
    const userId = `u_${crypto.randomUUID()}`;
    const rows = await client`
      INSERT INTO funex_user (id, email, name, picture, google_id)
      VALUES (${userId}, ${googleUser.email}, ${googleUser.name}, ${googleUser.picture}, ${googleUser.id})
      ON CONFLICT (google_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        updated_at = now()
      RETURNING id
    `;
    const finalUserId = rows[0].id as string;

    // Claim anonymous sessions
    if (anonSession) {
      await client`
        UPDATE session SET user_id = ${finalUserId}, claimed_by = ${finalUserId}
        WHERE id = ${anonSession} AND user_id IS NULL
      `;
    }

    // Also claim any other unclaimed sessions from this browser
    // (future: use a browser fingerprint cookie, for now just the passed session)

    // Set session cookie (userId as the token — simple for V1)
    reply
      .header('Set-Cookie', `${SESSION_COOKIE}=${finalUserId}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax; Secure`)
      .redirect('/');
  });

  // Logout
  app.get('/auth/logout', async (_request, reply) => {
    reply
      .header('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`)
      .redirect('/');
  });

  // Current user API (for the frontend to check login state)
  app.get('/auth/me', async (request, reply) => {
    const userId = getUserIdFromCookie(request);
    if (!userId) {
      reply.send({ authenticated: false });
      return;
    }

    const user = await getUserFromToken(userId);
    if (!user) {
      reply.send({ authenticated: false });
      return;
    }

    reply.send({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile,
      },
    });
  });

  // Update profile
  app.post('/auth/profile', async (request, reply) => {
    const userId = getUserIdFromCookie(request);
    if (!userId) {
      reply.code(401).send({ error: 'Not authenticated' });
      return;
    }

    const body = request.body as Record<string, unknown>;

    // Structured fields only — no free-text health storage
    const profile = {
      party: body.party,
      staying: body.staying,
      tripDates: body.tripDates,
      constraints: body.constraints,
      interests: body.interests,
      budgetThb: body.budgetThb,
    };

    await client`
      UPDATE funex_user SET profile = ${JSON.stringify(profile)}::jsonb, updated_at = now()
      WHERE id = ${userId}
    `;

    reply.send({ ok: true });
  });

  // Claim session (called from the web chat to link anonymous sessions)
  app.post('/auth/claim-session', async (request, reply) => {
    const userId = getUserIdFromCookie(request);
    if (!userId) {
      reply.code(401).send({ error: 'Not authenticated' });
      return;
    }

    const body = request.body as { sessionId?: string };
    if (!body.sessionId) {
      reply.code(400).send({ error: 'Missing sessionId' });
      return;
    }

    const result = await client`
      UPDATE session SET user_id = ${userId}, claimed_by = ${userId}, channel = 'web'
      WHERE id = ${body.sessionId} AND user_id IS NULL
      RETURNING id
    `;

    reply.send({ claimed: result.length > 0 });
  });
}
