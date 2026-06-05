import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to change password');
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 400 }}>
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          Password changed successfully.
        </div>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <button className="secondary" onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px' }}>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <label>Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <label>Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}
