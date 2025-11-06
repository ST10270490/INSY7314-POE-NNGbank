const { User } = require('../models');

describe('User model validation', () => {
  test('rejects invalid ID number', async () => {
    const user = new User({ idNumber: 'abc123', firstName: 'John', surname: 'Doe', password: 'pass' });
    await expect(user.validate()).rejects.toThrow(/ID number must be exactly 13 digits/);
  });

  test('rejects invalid first name', async () => {
    const user = new User({ idNumber: '1234567890123', firstName: 'John123', surname: 'Doe', password: 'pass' });
    await expect(user.validate()).rejects.toThrow(/First name must contain only letters and spaces/);
  });

  test('accepts valid user', async () => {
    const user = new User({ idNumber: '1234567890123', firstName: 'John', surname: 'Doe', password: 'pass' });
    await expect(user.validate()).resolves.toBeUndefined();
  });
});
