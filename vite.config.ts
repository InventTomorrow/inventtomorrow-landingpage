import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {handleChat, webhookTarget} from './server/chat.ts';
import {handleAudit} from './server/audit.ts';

// Serves both APIs during dev/preview, mirroring the Vercel functions.
// The key is read from .env.local (never exposed to the browser bundle: no VITE_ prefix).
function chatApi(env: Record<string, string>): Plugin {
  const middleware = (req: any, res: any, next: () => void) => {
    const pathname = req.url?.split('?')[0];
    if (pathname !== '/api/chat' && pathname !== '/api/audit') return next();
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      return res.end();
    }
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk;
      if (raw.length > 400_000) req.destroy();
    });
    req.on('end', async () => {
      let body: unknown = null;
      try { body = JSON.parse(raw); } catch { /* handled as an invalid request */ }
      // Vite stays running between requests, so logging can finish after replying.
      const ip = req.socket?.remoteAddress ?? 'local';
      const result = pathname === '/api/audit'
        ? await handleAudit(body, ip, env)
        : await handleChat(body, ip, env, (task) => { void task; });
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Chat-Webhook', webhookTarget(env)); // production | test | off (dev only; helps debugging)
      res.end(JSON.stringify(result.body));
    });
  };
  return {
    name: 'chat-api',
    configureServer: (server) => {
      console.log(`[chat] n8n webhook target: ${webhookTarget(env)}`);
      server.middlewares.use(middleware);
    },
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), chatApi(env)],
    build: { manifest: true },
    resolve: {
      alias: {
        '@': import.meta.dirname,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
