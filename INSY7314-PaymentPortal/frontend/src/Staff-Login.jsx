import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';

const BASE_URL = 'https://localhost:3443';

export default function StaffLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validator.isEmail(email.trim()) || !password.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email and password.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
      } else {
        setMessage({ type: 'success', text: data.message || 'Login successful' });
        setTimeout(() => navigate('/accounts'), 400);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Could not reach server.' });
    } finally {
      setLoading(false);
    }
  };

  const backToMain = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.heading}>Staff Login</h2>

        <label style={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="username"
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
          />
        </label>

        {message && (
          <div
            style={{
              ...styles.message,
              backgroundColor: message.type === 'error' ? '#ffe6e6' : '#e6ffef',
              color: message.type === 'error' ? '#900' : '#064',
            }}
          >
            {message.text}
          </div>
        )}

        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.primary}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button type="button" onClick={backToMain} style={styles.secondary}>
            Back
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
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
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
