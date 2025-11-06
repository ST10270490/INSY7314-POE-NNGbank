import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';

const BASE_URL = 'https://localhost:3443';

export default function Register() {
  const navigate = useNavigate();

  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track last activity time
  let lastActivityTime = Date.now();

  const updateActivityTime = () => {
    lastActivityTime = Date.now();
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

  const isValidIdNumber = (value) => /^[0-9]{13}$/.test(value);
  const isValidName = (value) => validator.isAlpha(value.replace(/\s/g, ''));
  const isStrongPassword = (value) =>
    validator.isStrongPassword(value, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (
      !isValidIdNumber(idNumber.trim()) ||
      !isValidName(firstName.trim()) ||
      !isValidName(surname.trim()) ||
      !isStrongPassword(password)
    ) {
      setMessage({
        type: 'error',
        text:
          'Please fill in all fields with valid values. Passwords must contain at least 8 characters, including at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idNumber: idNumber.trim(),
          firstName: firstName.trim(),
          surname: surname.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Registration successful' });
        setTimeout(() => navigate('/', { replace: true }), 800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setMessage({ type: 'error', text: 'Network error. Could not reach server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegister} style={styles.card}>
        <h2 style={styles.heading}>Register</h2>

        <label htmlFor="idNumber" style={styles.label}>ID Number</label>
        <input
          id="idNumber"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          style={styles.input}
        />

        <label htmlFor="firstName" style={styles.label}>First Name</label>
        <input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
        />

        <label htmlFor="surname" style={styles.label}>Surname</label>
        <input
          id="surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          style={styles.input}
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {message && (
          <div
            style={{
              ...styles.message,
              backgroundColor: message.type === 'error' ? '#fff0f0' : '#e9fff2',
              color: message.type === 'error' ? '#900' : '#064',
            }}
          >
            {message.text}
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <button type="button" onClick={() => navigate('/')} style={styles.secondary}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles remain unchanged
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
    maxWidth: '400px',
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
  message: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
  },
  button: {
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
