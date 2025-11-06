import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';

const BASE_URL = 'https://localhost:3443';

export default function StaffLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Login successful' });
        setTimeout(() => navigate('/accounts'), 400);
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
      }
    } catch (err) {
      console.error('Staff login error:', err);
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

        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          autoComplete="username"
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
        />

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
