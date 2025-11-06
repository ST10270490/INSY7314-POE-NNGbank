describe('GET /users', () => {
  test('returns user list', async () => {
    User.find.mockResolvedValue([{ idNumber: '1234567890123', firstName: 'John', surname: 'Doe' }]);
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});