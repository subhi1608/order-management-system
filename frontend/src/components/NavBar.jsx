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
    <nav className="bg-[#1976d2] text-white px-6 flex justify-between items-center h-14 shadow-md">
      <span
        className="font-bold text-lg cursor-pointer"
        onClick={() => navigate('/orders')}
      >
        OMS
      </span>
      <div className="flex gap-3 items-center">
        <span className="text-sm">{user?.username} · {user?.role}</span>
        <button className="nav-ghost" onClick={() => navigate('/change-password')}>
          Change Password
        </button>
        <button className="nav-action" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
