import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [items, setItems] = useState([{ itemName: '', quantity: 1 }]);
  const [error, setError] = useState('');

  const addItem = () => setItems([...items, { itemName: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === 'quantity' ? Number(value) : value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/orders', { title, expiresAt, items });
      navigate(`/orders/${data.id}`);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to create order');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button className="secondary" onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px' }}>New Order</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Q3 Stationery Restock" />
          <label>Expiry Date</label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />

          <h3 style={{ margin: '16px 0 8px' }}>Items</h3>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                placeholder="Item name"
                value={item.itemName}
                onChange={e => updateItem(i, 'itemName', e.target.value)}
                required
                style={{ flex: 1, marginBottom: 0 }}
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                required
                style={{ width: 80, marginBottom: 0 }}
              />
              {items.length > 1 && (
                <button type="button" className="danger" onClick={() => removeItem(i)} style={{ padding: '6px 10px' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="secondary" onClick={addItem} style={{ marginBottom: 16 }}>
            + Add Item
          </button>

          {error && <p className="error">{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Save as Draft</button>
            <button type="button" className="secondary" onClick={() => navigate('/orders')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
