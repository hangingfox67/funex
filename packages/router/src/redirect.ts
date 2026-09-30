import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { EventWriter } from '@funex/telemetry';
import { ensureSession } from '@funex/telemetry';
import { routeExperience } from './router.js';
import type { db as Db } from '@funex/graph';
import postgres from 'postgres';

export interface RedirectPluginOptions {
  db: typeof Db;
  eventWriter: EventWriter;
}

const rawClient = postgres(process.env.DATABASE_URL ?? 'postgresql://funex:funex@localhost:5432/funex');

/**
 * Fastify plugin: click redirect service.
 *
 * GET /r/:token — opaque token resolves to session+experience server-side.
 * Also supports legacy GET /r/:sessionId/:experienceId for backward compat.
 */
export async function redirectPlugin(
  app: FastifyInstance,
  opts: RedirectPluginOptions,
): Promise<void> {
  const { db, eventWriter } = opts;

  // Opaque token route
  app.get(
    '/r/:token',
    async (
      request: FastifyRequest<{ Params: { token: string } }>,
      reply: FastifyReply,
    ) => {
      const { token } = request.params;

      // Skip if it looks like a legacy session ID (s_uuid format)
      if (token.startsWith('s_')) {
        reply.code(404).send({ error: 'Use /r/:token format' });
        return;
      }

      // Resolve token
      const rows = await rawClient`
        SELECT session_id, experience_id FROM booking_token WHERE token = ${token} LIMIT 1
      `;
      if (rows.length === 0) {
        reply.code(404).send({ error: 'Link expired or invalid' });
        return;
      }

      const { session_id: sessionId, experience_id: experienceId } = rows[0] as { session_id: string; experience_id: string };
      const result = await routeExperience(experienceId, sessionId, db);

      if (!result) {
        reply.code(404).send({ error: 'Activity not available' });
        return;
      }

      reply.redirect(result.url, 302);

      try {
        await ensureSession(db, sessionId);
        await eventWriter.log(sessionId, 'click', {
          experienceId,
          provider: result.provider,
        });
      } catch { /* logging failure must never block redirects */ }
    },
  );

  // Legacy route (backward compat for old links)
  app.get(
    '/r/:sessionId/:experienceId',
    async (
      request: FastifyRequest<{ Params: { sessionId: string; experienceId: string } }>,
      reply: FastifyReply,
    ) => {
      const { sessionId, experienceId } = request.params;
      const result = await routeExperience(experienceId, sessionId, db);

      if (!result) {
        reply.code(404).send({ error: 'Experience not routable' });
        return;
      }

      reply.redirect(result.url, 302);

      try {
        await ensureSession(db, sessionId);
        await eventWriter.log(sessionId, 'click', { experienceId, provider: result.provider });
      } catch { /* never block */ }
    },
  );
}
