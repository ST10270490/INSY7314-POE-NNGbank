// Import React hooks and navigation utility
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Base URL for API requests
const BASE_URL = 'https://localhost:3443';

// Login component
export default function Login() {
  const navigate = useNavigate();

  // State for form inputs
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');

  // UI feedback and loading state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Validation pattern for ID number (13 digits)
  const isValidIdNumber = (value) => /^[0-9]{13}$/.test(value);
  
  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!isValidIdNumber(idNumber.trim()) || !password.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid 13-digit ID number and password.',
      });
      return;
    }

    setLoading(true); // Show loading state

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNumber, password }),
        
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
      } else {
        setMessage({ type: 'success', text: data.message || 'Login successful' });
        setTimeout(() => navigate('/payments'), 400);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Could not reach server.' });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to registration page
  const goToStaff = () => {
    navigate('/Staff-Login');
  };

  // Render login form
  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.heading}>Login</h2>

        <label style={styles.label}>
          ID Number
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
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

        {/* Action buttons */}
        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.primary}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button type="button" onClick={goToStaff} style={styles.secondary}>
            Staff Login
          </button>
        </div>
      </form>
    </div>
  );
}

// Inline styles for layout and design
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
