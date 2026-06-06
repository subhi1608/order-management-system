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

  if (loading) return <p className="page-loading">Loading…</p>;

  return (
    <div className="max-w-[600px]">
      <button className="secondary mb-4" onClick={() => navigate(`/orders/${id}`)}>
        ← Back
      </button>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="mt-0 mb-5">Edit Order</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <label htmlFor="edit-expires">Expiry Date</label>
          <input
            id="edit-expires"
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            required
          />

          <h3 className="mt-4 mb-2">Items</h3>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                aria-label={`Item ${i + 1} name`}
                placeholder="Item name"
                value={item.itemName}
                onChange={e => updateItem(i, 'itemName', e.target.value)}
                required
                className="flex-1 !mb-0"
              />
              <input
                aria-label={`Item ${i + 1} quantity`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                required
                className="w-20 !mb-0"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  className="danger px-[10px] py-[6px]"
                  aria-label={`Remove item ${i + 1}`}
                  onClick={() => removeItem(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="secondary mb-4" onClick={addItem}>
            + Add Item
          </button>

          {error && <p className="error">{error}</p>}
          <div className="flex gap-2">
            <button type="submit">Save Changes</button>
            <button type="button" className="secondary" onClick={() => navigate(`/orders/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
