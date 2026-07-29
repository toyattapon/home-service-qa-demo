export function StatusBadge({ status }: { status: string }) {
  const slug = status.toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-${slug}`}>{status}</span>;
}
