/**
 * Admin auth: ADMIN_TOKEN in .env → entered once → httpOnly cookie.
 * Defense in depth: Caddy should also block /admin externally.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'funex-admin-dev';
const COOKIE_NAME = 'funex_admin';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const validHash = hashToken(ADMIN_TOKEN);

export function isAuthenticated(request: FastifyRequest): boolean {
  const cookie = (request.headers.cookie ?? '').split(';').find((c) => c.trim().startsWith(COOKIE_NAME + '='));
  if (!cookie) return false;
  const val = cookie.split('=')[1]?.trim();
  return val === validHash;
}

export function registerAdminAuth(app: FastifyInstance): void {
  // Login page
  app.get('/admin/login', async (_request, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Funex Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#111;color:#eee;display:flex;justify-content:center;align-items:center;min-height:100vh}
form{background:#1a1a1a;padding:2rem;border-radius:12px;width:min(90vw,360px)}
h1{font-size:1.1rem;margin-bottom:1rem;color:#888}
input{width:100%;padding:.8rem;border:1px solid #333;border-radius:8px;background:#222;color:#eee;font-size:1rem;margin-bottom:1rem}
button{width:100%;padding:.8rem;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:1rem;cursor:pointer}
button:active{background:#2563eb}
.err{color:#f87171;font-size:.85rem;margin-bottom:.5rem}
</style></head><body>
<form method="POST" action="/admin/login">
<h1>Funex Admin</h1>
<input type="password" name="token" placeholder="Admin token" autofocus>
<button type="submit">Enter</button>
</form></body></html>`);
  });

  // Login POST
  app.post('/admin/login', async (request, reply) => {
    const body = request.body as { token?: string };
    const token = body?.token ?? '';
    if (hashToken(token) === validHash) {
      reply
        .header('Set-Cookie', `${COOKIE_NAME}=${validHash}; HttpOnly; Path=/admin; Max-Age=${COOKIE_MAX_AGE}; SameSite=Strict`)
        .redirect('/admin');
    } else {
      reply.type('text/html').send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Funex Admin</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#111;color:#eee;display:flex;justify-content:center;align-items:center;min-height:100vh}form{background:#1a1a1a;padding:2rem;border-radius:12px;width:min(90vw,360px)}h1{font-size:1.1rem;margin-bottom:1rem;color:#888}input{width:100%;padding:.8rem;border:1px solid #333;border-radius:8px;background:#222;color:#eee;font-size:1rem;margin-bottom:1rem}button{width:100%;padding:.8rem;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:1rem;cursor:pointer}.err{color:#f87171;font-size:.85rem;margin-bottom:.5rem}</style></head><body>
<form method="POST" action="/admin/login"><h1>Funex Admin</h1><p class="err">Wrong token</p><input type="password" name="token" placeholder="Admin token" autofocus><button type="submit">Enter</button></form></body></html>`);
    }
  });
}
