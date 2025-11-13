// frontend/src/setupProxy.js (FINAL STATIC FILE FIX)

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  
  // This array defines the paths that SHOULD NOT be proxied to Django.
  const shouldNotProxy = [
    '/static', 
    '/sockjs-node', 
    '/hot-update.json', 
    '/favicon.ico',
    // ... any other paths the React dev server handles itself
  ];
  
  // The proxy is applied only to requests that DO NOT match the static file paths.
  app.use(
    (pathname) => !shouldNotProxy.some(path => pathname.startsWith(path)), // The filter function
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000', // The Django Backend URL
      changeOrigin: true,
      
      // We still need to explicitly preserve the /api prefix for Django
      pathRewrite: {
        '^/api': '/api', 
      },
    })
  );
};