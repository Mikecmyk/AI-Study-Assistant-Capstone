const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    // CRITICAL: Explicitly list ONLY the paths we want to proxy.
    // This ignores everything else (like /static, /sockjs-node, etc.)
    ['/api'],
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      
      // We keep the pathRewrite here to explicitly ensure the /api prefix is preserved
      // (which Django needs for authentication/routing)
      pathRewrite: {
        '^/api': '/api', 
      },
    })
  );
};