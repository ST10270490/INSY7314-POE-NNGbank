require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../Server-https');

const { User, Staff } = require('../models');

const agent = request.agent(app);

describe('Route Logic & Access Control (Read-Only CI)', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI in .env');
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Staff Login', () => {
    test('fails login with invalid email format', async () => {
      const res = await agent.post('/staff-login').send({
        email: 'invalid-email',
        password: 'securepass123'
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid email format');
    });

    test('logs in staff (if exists)', async () => {
      const staff = await Staff.findOne({ email: 'staff@example.com' }).select('+password');
      if (!staff) return;

      const res = await agent.post('/staff-login').send({
        email: 'staff@example.com',
        password: 'securepass123'
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
    });
  });

  describe('User Login', () => {
    test('fails login with invalid ID format', async () => {
      const res = await agent.post('/login').send({
        idNumber: 'bad-id',
        password: 'userpass'
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid ID number format');
    });

    test('logs in user (if exists)', async () => {
      const user = await User.findOne({ idNumber: '1234567890123' }).select('+password');
      if (!user) return;

      const res = await agent.post('/login').send({
        idNumber: '1234567890123',
        password: 'userpass'
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
    });
  });

  describe('Payments (Read-Only)', () => {
    test('fetches user payments', async () => {
      const res = await agent.get('/payments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('fetches staff payments', async () => {
      const res = await agent.get('/staffpayments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
