const { Payment } = require('../models');

describe('Payment model validation', () => {
  test('rejects negative amount', async () => {
    const payment = new Payment({
      paidFromAccount: '123456',
      recipientName: 'Alice',
      recipientAccountNumber: '987654',
      branchCode: '0001',
      amount: -100,
      status: 'Pending'
    });
    await expect(payment.validate()).rejects.toThrow(/Path `amount`.*min/);
  });

  test('rejects invalid status', async () => {
    const payment = new Payment({
      paidFromAccount: '123456',
      recipientName: 'Alice',
      recipientAccountNumber: '987654',
      branchCode: '0001',
      amount: 100,
      status: 'Unknown'
    });
    await expect(payment.validate()).rejects.toThrow(/`Unknown` is not a valid enum value/);
  });

  test('accepts valid payment', async () => {
    const payment = new Payment({
      paidFromAccount: '123456',
      recipientName: 'Alice',
      recipientAccountNumber: '987654',
      branchCode: '0001',
      amount: 100,
      status: 'Completed'
    });
    await expect(payment.validate()).resolves.toBeUndefined();
  });
});
