import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CreateJobInput, Customer, Technician } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { todayBangkok } from '../../utils/format';
import { customerApi } from '../customers/customerApi';
import { jobApi } from './jobApi';

const initial: CreateJobInput = { customerId: '', serviceType: 'Cleaning', preferredDate: '', timeSlot: '08:00-10:00', numberOfUnits: 1, priority: 'Normal', problemDescription: '' };

export function JobFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { Promise.all([customerApi.list(), jobApi.technicians()]).then(([c,t]) => { setCustomers(c); setTechnicians(t); }).catch((caught: Error) => setError(caught.message)); }, []);
  const set = <K extends keyof CreateJobInput>(key: K, value: CreateJobInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { const job = await jobApi.create(form); navigate(`/admin/jobs/${job.id}`); }
    catch (caught) { setError((caught as Error).message); } finally { setBusy(false); }
  }
  return (
    <>
      <PageHeader title="Create job" description="A technician is optional; unassigned jobs begin as Pending." />
      <section className="panel form-panel"><form className="form-grid" onSubmit={submit}>
        <FeedbackBanner message={error} />
        <label>Customer<select required data-testid="job-customer-select" value={form.customerId} onChange={(e) => set('customerId', e.target.value)}><option value="">Select customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></label>
        <label>Service type<select data-testid="job-service-type-select" value={form.serviceType} onChange={(e) => set('serviceType', e.target.value as CreateJobInput['serviceType'])}>{['Cleaning','Repair','Installation'].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Preferred date<input required min={todayBangkok()} type="date" data-testid="job-date-input" value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)} /></label>
        <label>Time slot<select data-testid="job-time-slot-select" value={form.timeSlot} onChange={(e) => set('timeSlot', e.target.value as CreateJobInput['timeSlot'])}>{['08:00-10:00','10:00-12:00','13:00-15:00','15:00-17:00'].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Technician<select data-testid="job-technician-select" value={form.technicianId ?? ''} onChange={(e) => set('technicianId', e.target.value || undefined)}><option value="">Leave unassigned</option>{technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>Number of units<input data-testid="job-units-input" type="number" min="1" max="5" value={form.numberOfUnits} onChange={(e) => set('numberOfUnits', Number(e.target.value))} /></label>
        <label>Priority<select data-testid="job-priority-select" value={form.priority} onChange={(e) => set('priority', e.target.value as CreateJobInput['priority'])}><option>Normal</option><option>Urgent</option></select></label>
        <label className="full">Problem description<textarea data-testid="job-description-input" maxLength={500} value={form.problemDescription} onChange={(e) => set('problemDescription', e.target.value)} /></label>
        <div className="form-actions"><Link className="button secondary" to="/admin/jobs">Cancel</Link><button data-testid="job-save-button" className="button primary" disabled={busy}>{busy ? 'Creating…' : 'Create job'}</button></div>
      </form></section>
    </>
  );
}
