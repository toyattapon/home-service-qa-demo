import { useEffect, useState } from 'react';
import type { Job, Technician } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';
import { jobApi } from '../jobs/jobApi';

export function DispatchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [jobId, setJobId] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load() { const [allJobs, techs] = await Promise.all([jobApi.list(), jobApi.technicians()]); setJobs(allJobs); setTechnicians(techs); }
  useEffect(() => {
    Promise.all([jobApi.list(), jobApi.technicians()])
      .then(([loadedJobs, loadedTechnicians]) => {
        setJobs(loadedJobs);
        setTechnicians(loadedTechnicians);
      })
      .catch((caught: Error) => setError(caught.message));
  }, []);
  const eligible = jobs.filter((job) => ['Pending','Assigned'].includes(job.status) && (!date || job.preferredDate === date));
  const selectedJob = eligible.find((job) => job.id === jobId);
  async function assign() {
    if (!selectedJob) return;
    try {
      await jobApi.assign(selectedJob.id, technicianId);
      setMessage('Assignment saved successfully');
      setError('');
      await load();
    } catch (caught) {
      setError((caught as Error).message);
      setMessage('');
    }
  }
  return (
    <>
      <PageHeader title="Dispatch" description="Assign available technicians while enforcing date and slot conflicts." />
      <FeedbackBanner kind="success" message={message} /><FeedbackBanner message={error} />
      <section className="panel"><div className="toolbar">
        <label>Date filter<input data-testid="dispatch-date-input" type="date" value={date} onChange={(e) => { setDate(e.target.value); setJobId(''); }} /></label>
        <label>Pending / assigned job<select data-testid="dispatch-job-select" value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="">Select job</option>{eligible.map((job) => <option key={job.id} value={job.id}>{job.customerName} · {job.preferredDate} · {job.timeSlot}</option>)}</select></label>
        <label>Time slot<select data-testid="dispatch-time-slot-select" value={selectedJob?.timeSlot ?? ''} disabled><option value={selectedJob?.timeSlot ?? ''}>{selectedJob ? selectedJob.timeSlot : 'Select a job first'}</option></select></label>
        <label>Technician<select data-testid="dispatch-technician-select" value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}><option value="">Select technician</option>{technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <button data-testid="dispatch-assign-button" className="button primary" disabled={!selectedJob || !technicianId} onClick={() => void assign()}>Assign</button>
      </div><div className="table-wrap"><table data-testid="dispatch-assignment-table"><thead><tr><th>Date</th><th>Slot</th><th>Customer</th><th>Technician</th><th>Status</th></tr></thead><tbody>{jobs.filter((job) => job.technicianId).map((job) => <tr key={job.id}><td>{formatDate(job.preferredDate)}</td><td>{job.timeSlot}</td><td>{job.customerName}</td><td>{job.technicianName}</td><td><StatusBadge status={job.status} /></td></tr>)}</tbody></table></div></section>
    </>
  );
}
