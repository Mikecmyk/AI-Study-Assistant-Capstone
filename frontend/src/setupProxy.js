// frontend/src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    // The path we are proxying (all API calls)
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      // CRITICAL: Ensure all necessary headers are forwarded.
      // In some environments, headers like Authorization are blocked by default.
      headers: {
        // Forward the Host header to the Django server
        'Host': '127.0.0.1:8000',
      },
      // Rewrite the path, if necessary (not usually needed here)
      pathRewrite: {
        '^/api': '/api', 
      },
    })
  );
};