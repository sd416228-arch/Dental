import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { initDatabase } from './src/server/db';
import { apiRouter } from './src/server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Initialize SQLite database and run migrations
  initDatabase();

  // Mount API endpoints
  app.use('/api', apiRouter);

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[Server] Running in DEVELOPMENT mode with Vite middlewares');
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Running in PRODUCTION mode serving /dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Denta Care Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
