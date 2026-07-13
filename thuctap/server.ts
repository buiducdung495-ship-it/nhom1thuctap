import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/backend/routes/api';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Core Middlewares
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Mount MVC backend API routes
  app.use('/api', apiRouter);

  // Simple Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dev server vs static production server routing
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Running in development mode with Vite live preview...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Running in production mode, serving pre-built assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback for Single Page Application routing (React Router)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Fullstack Server successfully bound to http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to launch Express server:', err);
});
