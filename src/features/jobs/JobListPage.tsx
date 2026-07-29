import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Job, JobStatus } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';
import { jobApi } from './jobApi';

export function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<JobStatus | ''>('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try { setJobs(await jobApi.list({ status: status || undefined, search: search || undefined })); setError(''); }
    catch (caught) { setError((caught as Error).message); }
  }
  useEffect(() => {
    jobApi
      .list()
      .then((result) => {
        setJobs(result);
        setError('');
      })
      .catch((caught: Error) => setError(caught.message));
  }, []);
  const submit = (event: FormEvent) => { event.preventDefault(); void load(); };

  return (
    <>
      <PageHeader title="Jobs" description="Bookings across the complete service lifecycle." actions={<Link data-testid="job-create-button" className="button primary" to="/admin/jobs/new">Create job</Link>} />
      <FeedbackBanner message={error} />
      <section className="panel">
        <form className="toolbar" onSubmit={submit}>
          <label>Search<input data-testid="job-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Customer or phone" /></label>
          <label>Status<select data-testid="job-status-filter" value={status} onChange={(e) => setStatus(e.target.value as JobStatus | '')}><option value="">All statuses</option>{['Pending','Assigned','In Progress','Completed','Cancelled'].map((v) => <option key={v}>{v}</option>)}</select></label>
          <button className="button secondary">Apply</button>
        </form>
        <div className="table-wrap"><table data-testid="job-table"><thead><tr><th>Job</th><th>Schedule</th><th>Service</th><th>Technician</th><th>Status</th></tr></thead><tbody>
          {jobs.map((job) => <tr key={job.id} data-testid={`job-row-${job.id}`}><td><Link className="text-link" to={`/admin/jobs/${job.id}`}><strong>{job.customerName}</strong><br /><small>{job.id}</small></Link></td><td>{formatDate(job.preferredDate)}<br /><small>{job.timeSlot}</small></td><td>{job.serviceType} · {job.numberOfUnits} unit(s)</td><td>{job.technicianName || 'Unassigned'}</td><td><StatusBadge status={job.status} /></td></tr>)}
          {!jobs.length && <tr><td colSpan={5} className="empty-cell">No jobs found.</td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
