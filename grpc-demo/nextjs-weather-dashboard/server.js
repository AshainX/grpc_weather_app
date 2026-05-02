const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const { next } = require('express');

const app = express();

// Proxy API requests to Flask server
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
}));

// Serve Next.js app
const nextApp = require('next')({ dev: true });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});