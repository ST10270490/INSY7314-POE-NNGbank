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
  const [sessionId, setSessionId] = useState(null);

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

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Registration failed' });
      } else {
        setMessage({ type: 'success', text: data.message || 'Registration successful' });
        setSessionId(data.sessionId);
        setTimeout(() => navigate('/', { replace: true }), 800);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Could not reach server.' });
    } finally {
      setLoading(false);
    }
  };

  const checkSessionTimeout = () => {
    if (sessionId) {
      const lastActivityTime = new Date(sessionId.split('-')[0]);
      const currentTime = new Date();
      const timeout = 10 * 60 * 1000;

      if (currentTime - lastActivityTime > timeout) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkSessionTimeout();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [sessionId]);

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegister} style={styles.card}>
        <h2 style={styles.heading}>Register</h2>

        <label style={styles.label}>
          ID Number
          <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          First Name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Surname
          <input value={surname} onChange={(e) => setSurname(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        </label>

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
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  card: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
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
    marginTop: '6px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  message: {
    padding: '10px',
    borderRadius: '4px',
    marginTop: '1rem',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '1.5rem',
    justifyContent: 'center',
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
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};