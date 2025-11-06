// Import necessary React hooks and navigation utility
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Status } from './enums';
import validator from 'validator';
// Base URL for API requests
const BASE_URL = 'https://localhost:3443';

// Main component for creating a payment
const CreatePayment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    paidFromAccount: '',
    recipientName: '',
    recipientAccountNumber: '',
    branchCode: '',
    amount: '',
    status: Status.Pending,
  });

  const [sessionId, setSessionId] = useState(null);

  // Validation helpers
  const isValidAccountNumber = (value) => validator.isNumeric(value);
  // SonarQube: replaceAll not suitable here due to regex use
  const isValidName = (value) => validator.isAlpha(value.replace(/\s/g, ''));
  const isValidBranchCode = (value) => validator.isLength(value, { min: 6, max: 6 }) && validator.isNumeric(value);
  const isValidAmount = (value) => validator.isFloat(value, { min: 0 });
  const isValidStatus = (value) => Object.values(Status).includes(value);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Apply validation
    switch (name) {
      case 'paidFromAccount':
        e.target.setCustomValidity(isValidAccountNumber(value) ? '' : 'Invalid account number');
        break;
      case 'recipientName':
        e.target.setCustomValidity(isValidName(value) ? '' : 'Invalid name');
        break;
      case 'recipientAccountNumber':
        e.target.setCustomValidity(isValidAccountNumber(value) ? '' : 'Invalid account number');
        break;
      case 'branchCode':
        e.target.setCustomValidity(isValidBranchCode(value) ? '' : 'Invalid branch code');
        break;
      case 'amount':
        e.target.setCustomValidity(isValidAmount(value) ? '' : 'Invalid amount');
        break;
      case 'status':
        e.target.setCustomValidity(isValidStatus(value) ? '' : 'Invalid status');
        break;
      default:
        e.target.setCustomValidity('');
    }
  };

  const checkSessionTimeout = useCallback(() => {
    if (sessionId) {
      const lastActivityTime = new Date(sessionId.split('-')[0]);
      const currentTime = new Date();
      const timeout = 10 * 60 * 1000;

      if (currentTime - lastActivityTime > timeout) {
        navigate('/login');
      }
    }
  }, [sessionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to create payment');

      const data = await response.json();
      setSessionId(`${data.timestamp}-${Date.now().toString()}`);
      navigate('/payments');
    } catch (error) {
      console.error(error);
      alert('Failed to create payment');
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkSessionTimeout();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [checkSessionTimeout]);


  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.heading}>Create Payment</h2>

        <label htmlFor="paidFromAccount" style={styles.label}>Paid From Account</label>
        <input
          id="paidFromAccount"
          type="text"
          name="paidFromAccount"
          value={formData.paidFromAccount}
          onChange={handleChange}
          style={styles.input}
        />

        <label htmlFor="recipientName" style={styles.label}>Recipient Name</label>
        <input
          id="recipientName"
          type="text"
          name="recipientName"
          value={formData.recipientName}
          onChange={handleChange}
          style={styles.input}
        />

        <label htmlFor="recipientAccountNumber" style={styles.label}>Recipient Account Number</label>
        <input
          id="recipientAccountNumber"
          type="text"
          name="recipientAccountNumber"
          value={formData.recipientAccountNumber}
          onChange={handleChange}
          style={styles.input}
        />

        <label htmlFor="branchCode" style={styles.label}>Branch Code</label>
        <input
          id="branchCode"
          type="text"
          name="branchCode"
          value={formData.branchCode}
          onChange={handleChange}
          style={styles.input}
        />

        <label htmlFor="amount" style={styles.label}>Amount</label>
        <input
          id="amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          id="status"
          type="hidden"
          name="status"
          value={formData.status}
          readOnly
        />

        <div style={styles.actions}>
          <button type="submit" style={styles.primary}>
            Create Payment
          </button>
          <button type="button" onClick={() => navigate('/payments')} style={styles.secondary}>
            Back to Payments
          </button>
        </div>

      </form>
    </div>
  );
};

// Inline styles for the component
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '1rem',
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
  },
  primary: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  secondary: {
    padding: '10px 20px',
    backgroundColor: '#ddd',
    color: '#333',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default CreatePayment;
