import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { EventWriter } from '@funex/telemetry';
import { ensureSession } from '@funex/telemetry';
import { routeExperience } from './router.js';
import type { db as Db } from '@funex/graph';

export interface RedirectPluginOptions {
  db: typeof Db;
  eventWriter: EventWriter;
}

/**
 * Fastify plugin: click redirect service.
 *
 * GET /r/:sessionId/:experienceId
 *
 * Resolves the experience's booking URL via routeExperience(),
 * logs a 'click' event, and 302-redirects to the Viator deep link.
 */
export async function redirectPlugin(
  app: FastifyInstance,
  opts: RedirectPluginOptions,
): Promise<void> {
  const { db, eventWriter } = opts;

  app.get(
    '/r/:sessionId/:experienceId',
    async (
      request: FastifyRequest<{
        Params: { sessionId: string; experienceId: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { sessionId, experienceId } = request.params;

      const result = await routeExperience(experienceId, sessionId, db);

      if (!result) {
        return reply.code(404).send({ error: 'Experience not routable' });
      }

      // Redirect first — never let logging failure block the user
      const redirectUrl = result.url;
      reply.redirect(redirectUrl, 302);

      // Best-effort logging (after redirect sent)
      try {
        await ensureSession(db, sessionId);
        await eventWriter.log(sessionId, 'click', {
          experienceId,
          provider: result.provider,
          url: redirectUrl,
        });
      } catch {
        // Logging failure must never block redirects
      }
    },
  );
}
