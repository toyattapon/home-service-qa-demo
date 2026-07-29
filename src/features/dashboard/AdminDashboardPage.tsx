import { useEffect, useState } from 'react';
import type { DashboardSummary } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { getDashboardSummary } from './dashboardApi';

const cards: [keyof DashboardSummary, string][] = [
  ['totalJobsToday', 'Jobs today'],
  ['pendingJobs', 'Pending jobs'],
  ['assignedJobs', 'Assigned jobs'],
  ['completedJobs', 'Completed jobs'],
  ['unpaidInvoices', 'Unpaid invoices'],
  ['lowStockItems', 'Low-stock items'],
];

const testIds: Record<keyof DashboardSummary, string> = {
  totalJobsToday: 'dashboard-total-jobs',
  pendingJobs: 'dashboard-pending-jobs',
  assignedJobs: 'dashboard-assigned-jobs',
  completedJobs: 'dashboard-completed-jobs',
  unpaidInvoices: 'dashboard-unpaid-invoices',
  lowStockItems: 'dashboard-low-stock',
};

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>();
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch((caught: Error) => setError(caught.message));
  }, []);

  return (
    <>
      <PageHeader
        title="Operations overview"
        description="A live summary of the current PostgreSQL seed state."
      />
      <FeedbackBanner message={error} />
      <section className="metric-grid">
        {cards.map(([key, label]) => (
          <article className="metric-card" key={key} data-testid={testIds[key]}>
            <span>{label}</span>
            <strong>{summary ? summary[key] : '—'}</strong>
            <small>Current database</small>
          </article>
        ))}
      </section>
      <section className="panel callout-panel">
        <div>
          <p className="eyebrow">QA practice prompt</p>
          <h2>Trace a complete job across three layers.</h2>
          <p>
            Complete a technician job, verify the invoice in the UI, then query
            the job, inventory, and invoice tables directly.
          </p>
        </div>
      </section>
    </>
  );
}
