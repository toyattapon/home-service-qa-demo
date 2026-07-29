import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Job, Technician } from '../../../shared/domain';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';
import { jobApi } from './jobApi';

export function JobDetailPage() {
  const { id = '' } = useParams();
  const [job, setJob] = useState<Job>();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    Promise.all([jobApi.get(id), jobApi.technicians()])
      .then(([loadedJob, loadedTechnicians]) => {
        setJob(loadedJob);
        setTechnicians(loadedTechnicians);
        setSelected(loadedJob.technicianId ?? '');
      })
      .catch((caught: Error) => setError(caught.message));
  }, [id]);
  async function assign() { try { setJob(await jobApi.assign(id, selected)); setError(''); } catch (caught) { setError((caught as Error).message); } }
  async function cancel() { try { const result = await jobApi.updateStatus(id, 'Cancelled'); setJob(result.job); setConfirm(false); } catch (caught) { setError((caught as Error).message); } }
  return (
    <>
      <PageHeader title={job ? `Job · ${job.customerName}` : 'Job detail'} description={job?.id} actions={<Link className="button secondary" to="/admin/jobs">Back to jobs</Link>} />
      <FeedbackBanner message={error} />
      {job && <div className="detail-grid">
        <article className="panel detail-card"><p className="eyebrow">Status</p><div data-testid="job-detail-status"><StatusBadge status={job.status} /></div><dl><dt>Schedule</dt><dd>{formatDate(job.preferredDate)} · {job.timeSlot}</dd><dt>Priority</dt><dd>{job.priority}</dd><dt>Service</dt><dd>{job.serviceType} · {job.numberOfUnits} unit(s)</dd></dl></article>
        <article className="panel detail-card" data-testid="job-detail-customer"><p className="eyebrow">Customer</p><h2>{job.customerName}</h2><p>{job.customerPhone}<br />{job.customerAddress}</p></article>
        <article className="panel detail-card" data-testid="job-detail-technician"><p className="eyebrow">Technician</p><h2>{job.technicianName || 'Unassigned'}</h2>{(job.status === 'Pending' || job.status === 'Assigned') && <div className="inline-form"><select value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Select technician</option>{technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select><button data-testid="job-assign-button" className="button primary" disabled={!selected} onClick={assign}>Assign</button></div>}</article>
        <article className="panel detail-card"><p className="eyebrow">Problem</p><p>{job.problemDescription || 'No problem description.'}</p></article>
        <article className="panel detail-card"><p className="eyebrow">Actions</p>{(job.status === 'Pending' || job.status === 'Assigned') && <button data-testid="job-cancel-button" className="button danger" onClick={() => setConfirm(true)}>Cancel job</button>}{job.invoiceId && <Link data-testid="job-invoice-link" className="button primary" to={`/admin/invoices/${job.invoiceId}`}>View invoice</Link>}{!job.invoiceId && job.status !== 'Pending' && job.status !== 'Assigned' && <p>No admin action is available.</p>}</article>
      </div>}
      <ConfirmDialog open={confirm} title="Cancel this job?" description="Cancelled jobs are terminal and cannot be assigned again." confirmLabel="Cancel job" onCancel={() => setConfirm(false)} onConfirm={() => void cancel()} />
    </>
  );
}
