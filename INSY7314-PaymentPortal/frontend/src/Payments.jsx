import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'https://localhost:3443';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  // Track last activity time
  let lastActivityTime = Date.now();

  const updateActivityTime = () => {
    lastActivityTime = Date.now();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/payments`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for user activity
  useEffect(() => {
    window.addEventListener('mousemove', updateActivityTime);
    window.addEventListener('keydown', updateActivityTime);
    window.addEventListener('click', updateActivityTime);

    return () => {
      window.removeEventListener('mousemove', updateActivityTime);
      window.removeEventListener('keydown', updateActivityTime);
      window.removeEventListener('click', updateActivityTime);
    };
  }, []);

  // Check for session timeout
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const timeout = 10 * 60 * 1000; // 10 minutes

      if (currentTime - lastActivityTime > timeout) {
        navigate('/login');
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  const handleCreatePayment = () => {
    navigate('/create-payment');
  };

  const backToMain = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Payments</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Paid From Account</th>
            <th style={styles.th}>Recipient Name</th>
            <th style={styles.th}>Recipient Account Number</th>
            <th style={styles.th}>Branch Code</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment._id} style={styles.tr}>
              <td style={styles.td}>{payment.paidFromAccount}</td>
              <td style={styles.td}>{payment.recipientName}</td>
              <td style={styles.td}>{payment.recipientAccountNumber}</td>
              <td style={styles.td}>{payment.branchCode}</td>
              <td style={styles.td}>{payment.amount}</td>
              <td style={styles.td}>
                {payment.status === 'Pending' ? (
                  <span style={{ color: 'red' }}>Pending</span>
                ) : payment.status === 'Completed' ? (
                  <span style={{ color: 'green' }}>Completed</span>
                ) : (
                  <span style={{ color: 'orange' }}>Failed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={styles.button} onClick={handleCreatePayment}>
        Create Payment
      </button>
      <button type="button" onClick={backToMain} style={styles.secondary}>
        Log out
      </button>
    </div>
  );
};

// Inline styles for layout and design
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '2rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  },
  tr: {
    backgroundColor: '#fff',
    transition: 'background-color 0.3s',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
  },
  button: {
    display: 'block',
    margin: '0 auto',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  }, secondary: {
    display: 'block',
    margin: '20px auto',
    padding: '10px 20px',
    backgroundColor: '#ddd',
    color: '#333',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default Payments;
