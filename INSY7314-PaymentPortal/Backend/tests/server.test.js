// server.test.js
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { scrubObjectInPlace } = require('./path-to-your-scrub-function'); // adjust path
const app = express();

// Apply middleware manually for isolated testing
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({ windowMs: 1000, max: 2 }));
app.use((req, res, next) => {
  if (req.body) scrubObjectInPlace(req.body);
  next();
});
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// Dummy route for testing
app.post('/test', (req, res) => {
  res.status(200).json({ body: req.body });
});

describe('Middleware Tests', () => {
  test('Sanitization removes dangerous keys', async () => {
    const res = await request(app)
      .post('/test')
      .send({ normal: 'ok', $bad: 'remove', 'dot.key': 'remove' });

    expect(res.body.body).toEqual({ normal: 'ok' });
  });

  test('Helmet sets security headers', async () => {
    const res = await request(app).post('/test').send({});
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN'); // Helmet default
  });

  test('Rate limiting blocks excessive requests', async () => {
    await request(app).post('/test').send({});
    await request(app).post('/test').send({});
    const res = await request(app).post('/test').send({});
    expect(res.status).toBe(429);
  });

  test('Session is created and persists', async () => {
    const agent = request.agent(app);
    const res1 = await agent.post('/test').send({});
    const res2 = await agent.post('/test').send({});
    expect(res2.headers['set-cookie']).toBeDefined();
  });

  test('Session timeout destroys session', async () => {
    const now = Date.now();
    const req = { session: { lastActivity: now - 11 * 60 * 1000, destroy: jest.fn() } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Simulate middleware
    const middleware = require('./path-to-your-session-timeout-middleware'); // adjust path
    await middleware(req, res, next);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Session expired' });
  });
});
