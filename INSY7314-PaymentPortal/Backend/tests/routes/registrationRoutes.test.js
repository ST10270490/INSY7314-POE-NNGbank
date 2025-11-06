describe('POST /register', () => {
  test('rejects missing fields', async () => {
    const res = await request(app).post('/register').send({});
    expect(res.status).toBe(400);
  });

  test('rejects invalid ID format', async () => {
    const res = await request(app).post('/register').send({
      idNumber: 'abc',
      firstName: 'John',
      surname: 'Doe',
      password: 'pass'
    });
    expect(res.status).toBe(400);
  });

  test('rejects if not staff', async () => {
    const res = await request(app).post('/register').send({
      idNumber: '1234567890123',
      firstName: 'John',
      surname: 'Doe',
      password: 'pass'
    });
    expect(res.status).toBe(401);
  });

  test('registers user if valid and staff session exists', async () => {
    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue({});
    const agent = request.agent(app);
    agent.app.request.session.staffId = 'staff@example.com';

    const res = await agent.post('/register').send({
      idNumber: '1234567890123',
      firstName: 'John',
      surname: 'Doe',
      password: 'pass'
    });
    expect(res.status).toBe(201);
  });
});

describe('POST /register-staff', () => {
  test('rejects invalid email', async () => {
    const res = await request(app).post('/register-staff').send({
      email: 'bad-email',
      firstName: 'Jane',
      surname: 'Smith',
      password: 'pass'
    });
    expect(res.status).toBe(400);
  });

  test('registers staff if valid', async () => {
    Staff.findOne.mockResolvedValue(null);
    Staff.prototype.save = jest.fn().mockResolvedValue({});
    const res = await request(app).post('/register-staff').send({
      email: 'staff@example.com',
      firstName: 'Jane',
      surname: 'Smith',
      password: 'pass'
    });
    expect(res.status).toBe(201);
  });
});
