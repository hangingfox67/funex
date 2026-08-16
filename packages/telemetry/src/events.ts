import { events } from '@funex/graph';
import type { db as Db } from '@funex/graph';

export interface EventWriter {
  log(
    sessionId: string,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<void>;
}

export function createEventWriter(db: typeof Db): EventWriter {
  return {
    async log(sessionId, type, payload) {
      await db.insert(events).values({ sessionId, type, payload });
    },
  };
}
