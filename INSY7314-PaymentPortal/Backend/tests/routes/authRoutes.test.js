describe('POST /login', () => {
  test('rejects missing credentials', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });

  test('rejects invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post('/login').send({
      idNumber: '1234567890123',
      password: 'wrong'
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /staff-login', () => {
  test('rejects missing credentials', async () => {
    const res = await request(app).post('/staff-login').send({});
    expect(res.status).toBe(400);
  });

  test('rejects invalid email', async () => {
    const res = await request(app).post('/staff-login').send({
      email: 'bad-email',
      password: 'pass'
    });
    expect(res.status).toBe(400);
  });

  test('rejects invalid credentials', async () => {
    Staff.findOne.mockResolvedValue(null);
    const res = await request(app).post('/staff-login').send({
      email: 'staff@example.com',
      password: 'wrong'
    });
    expect(res.status).toBe(401);
  });
});
