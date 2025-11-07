require('dotenv').config();
const mongoose = require('mongoose');
const { User, Staff, Payment } = require('../models');

describe('Model Validation Tests', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI in .env or CI environment');
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('User Model', () => {
    test('valid user passes schema validation', async () => {
      const user = new User({
        idNumber: '1234567890123',
        firstName: 'Alice',
        surname: 'Wonderland',
        password: 'hashedpass'
      });
      await expect(user.validate()).resolves.toBeUndefined();
    });

    test('invalid ID number fails validation', async () => {
      const user = new User({
        idNumber: 'abc123',
        firstName: 'Alice',
        surname: 'Wonderland',
        password: 'hashedpass'
      });
      await expect(user.validate()).rejects.toThrow(/ID number must be exactly 13 digits/);
    });

    test('invalid first name fails validation', async () => {
      const user = new User({
        idNumber: '1234567890123',
        firstName: 'Al1ce!',
        surname: 'Wonderland',
        password: 'hashedpass'
      });
      await expect(user.validate()).rejects.toThrow(/First name must contain only letters and spaces/);
    });
  });

  describe('Staff Model', () => {
    test('valid staff passes schema validation', async () => {
      const staff = new Staff({
        email: 'staff@example.com',
        firstName: 'Bob',
        surname: 'Builder',
        password: 'hashedpass'
      });
      await expect(staff.validate()).resolves.toBeUndefined();
    });

    test('invalid email fails validation', async () => {
      const staff = new Staff({
        email: 'not-an-email',
        firstName: 'Bob',
        surname: 'Builder',
        password: 'hashedpass'
      });
      await expect(staff.validate()).rejects.toThrow(/Invalid email format/);
    });

    test('invalid surname fails validation', async () => {
      const staff = new Staff({
        email: 'staff@example.com',
        firstName: 'Bob',
        surname: 'B1lder!',
        password: 'hashedpass'
      });
      await expect(staff.validate()).rejects.toThrow(/Surname must contain only letters and spaces/);
    });
  });

  describe('Payment Model', () => {
    test('valid payment passes schema validation', async () => {
      const payment = new Payment({
        paidFromAccount: '1234567890123',
        recipientName: 'Charlie',
        recipientAccountNumber: '9876543210',
        branchCode: '000123',
        amount: 500,
        status: 'Pending'
      });
      await expect(payment.validate()).resolves.toBeUndefined();
    });

    test('negative amount fails validation', async () => {
      const payment = new Payment({
        paidFromAccount: '1234567890123',
        recipientName: 'Charlie',
        recipientAccountNumber: '9876543210',
        branchCode: '000123',
        amount: -100,
        status: 'Pending'
      });
      await expect(payment.validate()).rejects.toThrow(/Path `amount`.*min.*0/);
    });

    test('invalid status fails validation', async () => {
      const payment = new Payment({
        paidFromAccount: '1234567890123',
        recipientName: 'Charlie',
        recipientAccountNumber: '9876543210',
        branchCode: '000123',
        amount: 100,
        status: 'Unknown'
      });
      await expect(payment.validate()).rejects.toThrow(/`Unknown` is not a valid enum value/);
    });
  });
});
