import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function EditOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setTitle(data.title);
      setExpiresAt(data.expiresAt);
      setItems(data.items.map(i => ({ itemName: i.itemName, quantity: i.quantity })));
      setLoading(false);
    }).catch(() => {
      setError('Failed to load order');
      setLoading(false);
    });
  }, [id]);

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
      await api.put(`/orders/${id}`, { title, expiresAt, items });
      navigate(`/orders/${id}`);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to update order');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <button className="secondary" onClick={() => navigate(`/orders/${id}`)} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px' }}>Edit Order</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
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
            <button type="submit">Save Changes</button>
            <button type="button" className="secondary" onClick={() => navigate(`/orders/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
