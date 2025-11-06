import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'https://localhost:3443';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error(error);
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

  const handleCreateUser = () => {
    navigate('/register');
  };

    const backToMain = () => {
    navigate('/');
  };
      const toApprove = () => {
    navigate('/staffpayments');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>User Accounts</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID Number</th>
            <th style={styles.th}>First Name</th>
            <th style={styles.th}>Surname</th>
            <th style={styles.th}>Created At</th>
            <th style={styles.th}>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} style={styles.tr}>
              <td style={styles.td}>{user.idNumber}</td>
              <td style={styles.td}>{user.firstName}</td>
              <td style={styles.td}>{user.surname}</td>
              <td style={styles.td}>{new Date(user.createdAt).toLocaleString()}</td>
              <td style={styles.td}>{new Date(user.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={handleCreateUser}>
        Create User
        </button>
        <button type="button" onClick={toApprove} style={{ ...styles.button, marginTop: '10px' }}>
        Approve payments
        </button>
      </div>
      <button type="button" onClick={backToMain} style={styles.secondary}>
        Log out
      </button>
      
    </div>
  );
};

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
  },  secondary: {
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
  buttonGroup: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '20px',
},
};

export default Users;