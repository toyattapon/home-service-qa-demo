import type { InvoiceStatus, JobStatus } from '../../shared/domain';

export function StatusBadge({
  status,
}: {
  status: JobStatus | InvoiceStatus;
}) {
  const slug = status.toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-${slug}`}>{status}</span>;
}
