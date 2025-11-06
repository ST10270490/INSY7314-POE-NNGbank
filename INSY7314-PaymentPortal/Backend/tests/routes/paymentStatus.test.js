describe('PATCH /payments/:id', () => {
  test('rejects if not staff', async () => {
    const res = await request(app).patch('/payments/123').send({ status: 'Completed' });
    expect(res.status).toBe(401);
  });

  test('rejects invalid status', async () => {
    const agent = request.agent(app);
    agent.app.request.session.staffId = 'staff@example.com';
    const res = await agent.patch('/payments/123').send({ status: 'Unknown' });
    expect(res.status).toBe(400);
  });

  test('updates payment if valid', async () => {
    Payment.findByIdAndUpdate.mockResolvedValue({ status: 'Completed' });
    const agent = request.agent(app);
    agent.app.request.session.staffId = 'staff@example.com';

    const res = await agent.patch('/payments/123').send({ status: 'Completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Completed');
  });
});