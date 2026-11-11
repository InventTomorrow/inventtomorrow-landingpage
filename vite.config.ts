import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {handleChat, webhookTarget} from './api/_chat';

// Serves POST /api/chat during `npm run dev`/`preview`, mirroring the Vercel function in api/chat.ts.
// The key is read from .env.local (never exposed to the browser bundle: no VITE_ prefix).
function chatApi(env: Record<string, string>): Plugin {
  const middleware = (req: any, res: any, next: () => void) => {
    if (req.url?.split('?')[0] !== '/api/chat') return next();
    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.end();
    }
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk;
      if (raw.length > 100_000) req.destroy();
    });
    req.on('end', async () => {
      let body: unknown = null;
      try { body = JSON.parse(raw); } catch { /* handled as an invalid request */ }
      const result = await handleChat(body, req.socket?.remoteAddress ?? 'local', env);
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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
