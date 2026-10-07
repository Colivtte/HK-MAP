// 零依赖静态服务器：node serve.js [端口]（默认 8765）
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.argv[2]) || 8765;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json', '.svg': 'image/svg+xml', '.png': 'image/png',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(port, () => console.log(`香江图志 running at http://localhost:${port}`));
