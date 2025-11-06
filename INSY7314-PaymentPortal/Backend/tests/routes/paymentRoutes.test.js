describe('POST /payments', () => {
  test('creates payment', async () => {
    Payment.prototype.save = jest.fn().mockResolvedValue({ amount: 100 });
    const res = await request(app).post('/payments').send({
      paidFromAccount: '123456',
      recipientName: 'Alice',
      recipientAccountNumber: '987654',
      branchCode: '0001',
      amount: 100,
      status: 'Pending'
    });
    expect(res.status).toBe(201);
  });
});

describe('GET /payments', () => {
  test('rejects if not logged in', async () => {
    const res = await request(app).get('/payments');
    expect(res.status).toBe(401);
  });

  test('returns payments for user', async () => {
    Payment.find.mockResolvedValue([{ amount: 100 }]);
    const agent = request.agent(app);
    agent.app.request.session.idNumber = '1234567890123';

    const res = await agent.get('/payments');
    expect(res.status).toBe(200);
  });
});

describe('GET /staffpayments', () => {
  test('rejects if not staff', async () => {
    const res = await request(app).get('/staffpayments');
    expect(res.status).toBe(401);
  });

  test('returns all payments for staff', async () => {
    Payment.find.mockResolvedValue([{ amount: 100 }]);
    const agent = request.agent(app);
    agent.app.request.session.staffId = 'staff@example.com';

    const res = await agent.get('/staffpayments');
    expect(res.status).toBe(200);
  });
});