// Backend/Server-https.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const app = require('./app');

const KEYS_DIR = path.resolve(__dirname, 'Keys');
const CERT_PATH = process.env.SSL_CERT_PATH || path.join(KEYS_DIR, 'certificate.pem');
const KEY_PATH = process.env.SSL_KEY_PATH || path.join(KEYS_DIR, 'privatekey.pem');

if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
  console.error('❌ SSL cert or key missing');
  process.exit(1);
}

const sslOptions = {
  key: fs.readFileSync(KEY_PATH, 'utf8'),
  cert: fs.readFileSync(CERT_PATH, 'utf8'),
};

const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '3443', 10);
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3000', 10);
const trustedHost = process.env.TRUSTED_HOST || 'localhost';
const targetPort = HTTPS_PORT === 443 ? '' : `:${HTTPS_PORT}`;

https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
  console.log(`✅ HTTPS server running on https://localhost:${HTTPS_PORT}`);
});

http.createServer((req, res) => {
  const safePath = encodeURI(req.url || '/');
  res.writeHead(301, {
    Location: `https://${trustedHost}${targetPort}${safePath}`
  });
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`🌐 Redirect server running on http://localhost:${HTTP_PORT}`);
});
