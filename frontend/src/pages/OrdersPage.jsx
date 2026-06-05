import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        {user.role === 'CREATOR' && (
          <button onClick={() => navigate('/orders/new')}>+ New Order</button>
        )}
      </div>

      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>No orders found.</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Items</th>
                <th>Expires</th>
                <th>Created</th>
                {user.role === 'PURCHASER' && <th>Created By</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{order.title}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.items.length}</td>
                  <td>{order.expiresAt}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  {user.role === 'PURCHASER' && <td>{order.createdBy}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
