import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderTable from '../components/OrderTable';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0">Orders</h2>
        {user.role === 'CREATOR' && (
          <button onClick={() => navigate('/orders/new')}>+ New Order</button>
        )}
      </div>
      <OrderTable role={user.role} onRowClick={id => navigate(`/orders/${id}`)} />
    </div>
  );
}
