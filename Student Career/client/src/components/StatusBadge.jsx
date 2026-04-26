export default function StatusBadge({ status }) {
  const config = {
    pending: { badge: 'badge-pending', dot: 'bg-warning' },
    approved: { badge: 'badge-approved', dot: 'bg-success' },
    rejected: { badge: 'badge-rejected', dot: 'bg-danger' },
  };
  const { badge, dot } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium capitalize ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shadow-sm`} style={{ boxShadow: `0 0 6px currentColor` }} />
      {status}
    </span>
  );
}
