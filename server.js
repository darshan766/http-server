const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

let users = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // CORS for browser fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve frontend files
  const fileMap = {
    '/': 'index.html',
    '/style.css': 'style.css',
    '/script.js': 'script.js'
  };

  if (fileMap[pathname]) {
    const filePath = path.join(__dirname, fileMap[pathname]);
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(data);
      }
    });
    return;
  }

  // Handle /users API
  if (pathname === '/users') {
    if (method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          const { name, email } = JSON.parse(body);
          if (!name || !email) throw new Error('Missing name or email');

          const user = { id: Date.now(), name, email };
          users.push(user);

          // Append to log.txt
          const logEntry = `${new Date().toISOString()} - Name: ${name}, Email: ${email}\n`;
          fs.appendFile('log.txt', logEntry, (err) => {
            if (err) console.error('Error writing to log.txt:', err);
          });

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(user));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return;
  }

  // Unknown route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route Not Found' }));
});

server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
