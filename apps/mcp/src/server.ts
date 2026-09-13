import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env'), override: true });

import http from 'node:http';
import Fastify from 'fastify';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { db } from '@funex/graph';
import { createEventWriter } from '@funex/telemetry';
import { redirectPlugin } from '@funex/router';
import { SEARCH_TOOL_DESCRIPTION } from '@funex/contracts';
import {
  SearchParamsSchema,
  GetExperienceParamsSchema,
  SEARCH_ANNOTATIONS,
  GET_EXPERIENCE_ANNOTATIONS,
  handleSearchExperiences,
  handleGetExperience,
} from './tools.js';

const PORT = parseInt(process.env.MCP_PORT ?? '3000', 10);
const HOST = process.env.MCP_HOST ?? '0.0.0.0';

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'thailand-fun-experiences',
    version: '0.1.0',
  });

  server.registerTool(
    'search_experiences',
    {
      description: SEARCH_TOOL_DESCRIPTION,
      inputSchema: SearchParamsSchema,
      annotations: SEARCH_ANNOTATIONS,
    },
    async (params) => {
      const result = await handleSearchExperiences(params as Record<string, unknown>);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  server.registerTool(
    'get_experience',
    {
      description: 'Get full details for a specific experience by ID. Returns all safety/suitability attributes, price per person in THB, and a direct booking link (book_now_url) with live availability. Include the booking link when presenting to the user.',
      inputSchema: GetExperienceParamsSchema,
      annotations: GET_EXPERIENCE_ANNOTATIONS,
    },
    async (params) => {
      const result = await handleGetExperience(params as Record<string, unknown>);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  return server;
}

async function main() {
  // ── Fastify for REST + redirect + health ──
  const app = Fastify({ logger: true });
  const eventWriter = createEventWriter(db);

  const formbody = await import('@fastify/formbody');
  await app.register(formbody.default);
  const multipart = await import('@fastify/multipart');
  await app.register(multipart.default);
  await app.register(redirectPlugin, { db, eventWriter });

  // Admin dashboard
  const { registerAdminPages } = await import('./admin-pages.js');
  registerAdminPages(app);

  // Web auth (Google OAuth)
  const { registerWebAuth } = await import('./web-auth.js');
  registerWebAuth(app);

  // Web onboarding (parse → form → results)
  const { registerOnboarding } = await import('./web-onboard.js');
  registerOnboarding(app);

  app.get('/health', async () => ({ status: 'ok', version: '0.1.0' }));
  app.post('/api/search', async (request) => handleSearchExperiences(request.body as Record<string, unknown>));
  app.post('/api/experience', async (request) => handleGetExperience(request.body as Record<string, unknown>));
  app.get('/.well-known/openai-apps-challenge', async () => process.env.OPENAI_APPS_CHALLENGE_TOKEN ?? '');

  await app.ready();

  // ── Combined HTTP server: MCP on /mcp (raw), Fastify for everything else ──
  const server = http.createServer(async (req, res) => {
    if (req.url === '/mcp' && req.method === 'POST') {
      try {
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        const mcpServer = createMcpServer();
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res);
      } catch (err) {
        console.error('MCP error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
    } else {
      // Delegate to Fastify
      app.routing(req, res);
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`MCP server listening on ${HOST}:${PORT}`);
    console.log(`  MCP endpoint: POST /mcp`);
    console.log(`  REST mirror:  POST /api/search, POST /api/experience`);
    console.log(`  Redirect:     GET /r/:sessionId/:experienceId`);
    console.log(`  Health:       GET /health`);
  });
}

main().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
