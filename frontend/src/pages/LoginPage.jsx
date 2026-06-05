import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      login(data.token, data.role, data.username);
      navigate('/orders');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{
        background: 'white',
        padding: 40,
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        width: 360,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#1976d2' }}>Order Management System</h1>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: 14 }}>Sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" style={{ width: '100%', marginTop: 8, padding: '10px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
