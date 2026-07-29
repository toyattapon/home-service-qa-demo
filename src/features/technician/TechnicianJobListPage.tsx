import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';
import { technicianApi } from './technicianApi';

export function TechnicianJobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { technicianApi.listJobs().then(setJobs).catch((caught: Error) => setError(caught.message)); }, []);
  return (
    <>
      <PageHeader title="My jobs" description="Only work assigned to the signed-in technician is shown." />
      <FeedbackBanner message={error} />
      <section className="card-list" data-testid="tech-job-list">
        {jobs.map((job) => <article className="job-card panel" key={job.id} data-testid={`tech-job-card-${job.id}`}><div><p className="eyebrow">{formatDate(job.preferredDate)} · {job.timeSlot}</p><h2>{job.customerName}</h2><p>{job.serviceType} · {job.numberOfUnits} unit(s)<br />{job.customerAddress}</p></div><div className="job-card-actions"><span data-testid={`tech-job-status-${job.id}`}><StatusBadge status={job.status} /></span><Link className="button primary" to={`/tech/jobs/${job.id}`}>View job</Link></div></article>)}
        {!jobs.length && <div className="panel empty-cell">No assigned jobs.</div>}
      </section>
    </>
  );
}
