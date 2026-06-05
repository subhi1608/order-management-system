import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#1976d2',
      color: 'white',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 56,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }}>
      <span
        style={{ fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
        onClick={() => navigate('/orders')}
      >
        OMS
      </span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>{user?.username} · {user?.role}</span>
        <button
          style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '4px 12px' }}
          onClick={() => navigate('/change-password')}
        >
          Change Password
        </button>
        <button
          style={{ background: 'white', color: '#1976d2', fontWeight: 600 }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
