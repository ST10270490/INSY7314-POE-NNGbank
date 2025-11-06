const { Staff } = require('../models');

describe('Staff model validation', () => {
  test('rejects invalid email', async () => {
    const staff = new Staff({ email: 'bad-email', firstName: 'Jane', surname: 'Smith', password: 'pass' });
    await expect(staff.validate()).rejects.toThrow(/Invalid email format/);
  });

  test('rejects invalid surname', async () => {
    const staff = new Staff({ email: 'staff@example.com', firstName: 'Jane', surname: 'Smith123', password: 'pass' });
    await expect(staff.validate()).rejects.toThrow(/Surname must contain only letters and spaces/);
  });

  test('accepts valid staff', async () => {
    const staff = new Staff({ email: 'staff@example.com', firstName: 'Jane', surname: 'Smith', password: 'pass' });
    await expect(staff.validate()).resolves.toBeUndefined();
  });
});
