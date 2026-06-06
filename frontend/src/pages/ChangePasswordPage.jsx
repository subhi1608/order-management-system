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
      <div className="max-w-[400px]">
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-4">
          Password changed successfully.
        </div>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  return (
    <div className="max-w-[400px]">
      <button className="secondary mb-4" onClick={() => navigate('/orders')}>
        ← Back to Orders
      </button>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="mt-0 mb-5">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="cp-current">Current Password</label>
          <input
            id="cp-current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
          <label htmlFor="cp-new">New Password</label>
          <input
            id="cp-new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="cp-confirm">Confirm New Password</label>
          <input
            id="cp-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}
