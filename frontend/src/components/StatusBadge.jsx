const COLORS = {
  DRAFT: '#757575',
  SUBMITTED: '#1976d2',
  APPROVED: '#388e3c',
  COMPLETED: '#1b5e20',
  REJECTED: '#d32f2f',
  RETURNED: '#f57c00',
};

export default function StatusBadge({ status }) {
  return (
    <span style={{
      background: COLORS[status] || '#757575',
      color: 'white',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.5,
    }}>
      {status}
    </span>
  );
}
