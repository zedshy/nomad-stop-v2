const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Read NODE_ENV from environment (PM2 should set this)
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0'; // Bind to all interfaces
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`Starting Next.js server in ${dev ? 'development' : 'production'} mode...`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Hostname: ${hostname}, Port: ${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('Calling app.prepare()...');

// Add timeout to app.prepare() to catch hanging issues
const preparePromise = app.prepare();
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error('app.prepare() timed out after 60 seconds'));
  }, 60000);
});

Promise.race([preparePromise, timeoutPromise]).then(() => {
  console.log('Next.js app prepared successfully');
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Handle Next.js routes
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal server error');
      }
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err);
  process.exit(1);
});















