const express = require('express');
const bcrypt = require('bcrypt');
const { User, Payment,Staff } = require('./models');

const router = express.Router();

// Hash password using bcrypt
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Register new user
router.post('/register', async (req, res) => {
  
  const { idNumber, firstName, surname, password } = req.body;
  if (!idNumber || !firstName || !surname || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    if (!req.session.staffId) {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' });
    }

    const existingUser = await User.findOne({ idNumber });
    if (existingUser) return res.status(409).json({ error: 'User with this ID number already exists' });

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ idNumber, firstName, surname, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new staff
router.post('/register-staff', async (req, res) => {
  const { email, firstName, surname, password } = req.body;
  if (!email || !firstName || !surname || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) return res.status(409).json({ error: 'User with this ID number already exists' });

    const hashedPassword = await hashPassword(password);
    const newStaff = new Staff({ email, firstName, surname, password: hashedPassword });
    await newStaff.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle POST request to login
router.post('/login', async (req, res) => {
  const { idNumber, password } = req.body;
  if (!idNumber || !password) return res.status(400).json({ error: 'Please fill in all fields' });

  try {
    const user = await User.findOne({ idNumber }).select('+password');
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid ID number or password' });
    }

    req.session.idNumber = user.idNumber;

    req.session.lastActivity = Date.now();
    

    req.session.save(() => {

  res.status(200).json({ message: 'Login successful' });
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle POST request to login staff
router.post('/staff-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    const staff = await Staff.findOne({ email }).select('+password');
    if (!staff || !await bcrypt.compare(password, staff.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.staffId = staff.email;
    req.session.lastActivity = Date.now();

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle GET request to fetch all user accounts
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password for safety
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Handle POST request to create a new payment
router.post('/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Handle GET request to fetch payments for logged-in user
router.get('/payments', async (req, res) => {
  try {
    const idNumber = req.session.idNumber;
    if (!idNumber) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const payments = await Payment.find({
      $or: [
        { paidFromAccount: idNumber },
        { recipientAccountNumber: idNumber }
      ]
    });

    res.json(payments);
  } catch (error) {
    console.error('Error in /payments route handler:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Handle GET request to fetch all payments for staff
router.get('/staffpayments', async (req, res) => {
  
  try {
    if (!req.session.staffId) {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' });
    }

    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    console.error('Error in /staffpayments route handler:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Handle PATCH request to update payment status
router.patch('/payments/:id', async (req, res) => {
  try {
    if (!req.session.staffId) {
      return res.status(401).json({ error: 'Unauthorized: Staff login required' });
    }

    const { status } = req.body;
    const validStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

module.exports = router;