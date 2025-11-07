require('dotenv').config();
const request = require('supertest');
const https = require('https');
const fs = require('fs');
const path = require('path');
process.env.NODE_ENV = 'test';
const app = require('../Server-https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const KEYS_DIR = path.resolve(__dirname, '../Keys');
const sslOptions = {
  key: fs.readFileSync(path.join(KEYS_DIR, 'privatekey.pem')),
  cert: fs.readFileSync(path.join(KEYS_DIR, 'certificate.pem')),
};

const agent = request.agent(https.createServer(sslOptions, app));

describe('Server Middleware & Security', () => {
  test('should redirect HTTP to HTTPS', async () => {
    const res = await request('http://localhost:3000').get('/');
    expect(res.status).toBe(301);
  });

  test('should respond to GET / with 200 OK', async () => {
    const res = await agent.get('/');
    expect(res.status).toBe(200);
  });

  test('should enforce security headers', async () => {
    const res = await agent.get('/');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  test('should enforce rate limiting', async () => {
    const requests = Array.from({ length: 210 }, () => agent.get('/'));
    const responses = await Promise.all(requests);
    const limited = responses.filter(r => r.status === 429);
    expect(limited.length).toBeGreaterThan(0);
  });
});
