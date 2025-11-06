require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../Server-https');

const { User, Staff, Payment } = require('../models');

const agent = request.agent(app);

describe('Route Logic & Access Control', () => {
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


  describe('Staff Registration & Login', () => {
    test('registers new staff', async () => {
      const res = await agent.post('/register-staff').send({
        email: 'staff@example.com',
        firstName: 'Alice',
        surname: 'Admin',
        password: 'securepass123'
      });
      expect(res.status).toBe(201);
    });

    test('logs in staff', async () => {
      const res = await agent.post('/staff-login').send({
        email: 'staff@example.com',
        password: 'securepass123'
      });
      expect(res.status).toBe(200);
    });
  });

  describe('User Registration & Login', () => {
    test('fails to register user without staff session', async () => {
      const res = await request(app).post('/register').send({
        idNumber: 'user123',
        firstName: 'Bob',
        surname: 'User',
        password: 'userpass'
      });
      expect(res.status).toBe(401);
    });

    test('registers user with staff session', async () => {
      const res = await agent.post('/register').send({
        idNumber: 'user123',
        firstName: 'Bob',
        surname: 'User',
        password: 'userpass'
      });
      expect(res.status).toBe(201);
    });

    test('logs in user', async () => {
      const res = await agent.post('/login').send({
        idNumber: 'user123',
        password: 'userpass'
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Payments', () => {
    test('creates a payment', async () => {
      const res = await agent.post('/payments').send({
        paidFromAccount: 'user123',
        recipientAccountNumber: 'user456',
        amount: 100,
        status: 'Pending'
      });
      expect(res.status).toBe(201);
    });

    test('fetches user payments', async () => {
      const res = await agent.get('/payments');
      expect(res.status).toBe(200);
    });

    test('fetches staff payments', async () => {
      const res = await agent.get('/staffpayments');
      expect(res.status).toBe(200);
    });

    test('updates payment status', async () => {
      const payment = await Payment.findOne();
      const res = await agent.patch(`/payments/${payment._id}`).send({ status: 'Completed' });
      expect(res.status).toBe(200);
    });
  });

  describe('Validation', () => {
    test('rejects invalid email', async () => {
      const res = await agent.post('/register-staff').send({
        email: 'bad-email',
        firstName: 'X',
        surname: 'Y',
        password: 'pass'
      });
      expect(res.status).toBe(400);
    });

    test('rejects invalid ID number', async () => {
      const res = await agent.post('/register').send({
        idNumber: '$bad.id',
        firstName: 'X',
        surname: 'Y',
        password: 'pass'
      });
      expect(res.status).toBe(400);
    });
  });
});
