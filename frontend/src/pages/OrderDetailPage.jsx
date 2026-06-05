import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [note, setNote] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data))
      .catch(() => setError('Failed to load order'));
  }, [id]);

  const doAction = async (action, body = {}) => {
    try {
      setError('');
      const { data } = await api.post(`/orders/${id}/${action}`, body);
      setOrder(data);
      setNote('');
      setTxnRef('');
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Action failed');
    }
  };

  if (!order) return <p>Loading…</p>;

  const isOwner = order.createdBy === user.username;
  const isCreator = user.role === 'CREATOR';
  const isPurchaser = user.role === 'PURCHASER';
  const canEdit = isCreator && isOwner && (order.status === 'DRAFT' || order.status === 'RETURNED');
  const canSubmit = canEdit;
  const canApprove = isPurchaser && order.status === 'SUBMITTED';
  const canActOnSubmitted = isPurchaser && order.status === 'SUBMITTED';
  const canComplete = isPurchaser && order.status === 'APPROVED';

  return (
    <div>
      <button className="secondary" onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        ← Back to Orders
      </button>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0 }}>{order.title}</h2>
          <StatusBadge status={order.status} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 24, color: '#555', fontSize: 14 }}>
          <span>Created by: <strong>{order.createdBy}</strong></span>
          <span>Expires: <strong>{order.expiresAt}</strong></span>
          {order.createdAt && <span>Created: <strong>{new Date(order.createdAt).toLocaleString()}</strong></span>}
        </div>
      </div>

      {order.purchaserNote && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <strong>Note from Purchaser:</strong> {order.purchaserNote}
        </div>
      )}

      {order.txnReference && (
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <strong>Transaction Reference:</strong> {order.txnReference}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>Items</h3>
        <table>
          <thead>
            <tr><th>Item Name</th><th>Quantity</th></tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="error" style={{ fontSize: 14 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {canEdit && (
          <button className="secondary" onClick={() => navigate(`/orders/${id}/edit`)}>Edit</button>
        )}
        {canSubmit && (
          <button className="success" onClick={() => doAction('submit')}>Submit</button>
        )}
        {canApprove && (
          <button className="success" onClick={() => doAction('approve')}>Approve</button>
        )}
        {canActOnSubmitted && (
          <>
            <input
              placeholder="Add a note for creator..."
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: 260, marginBottom: 0 }}
            />
            <button className="warning" onClick={() => doAction('return', { note })}>Return</button>
            <button className="danger" onClick={() => doAction('reject', { note })}>Reject</button>
          </>
        )}
        {canComplete && (
          <>
            <input
              placeholder="Transaction reference..."
              value={txnRef}
              onChange={e => setTxnRef(e.target.value)}
              style={{ width: 220, marginBottom: 0 }}
            />
            <button className="success" onClick={() => doAction('complete', { txnReference: txnRef })}>
              Mark Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
