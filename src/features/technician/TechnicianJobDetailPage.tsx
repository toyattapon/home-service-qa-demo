import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { InventoryItem, Invoice, Job, UsedPart } from '../../../shared/domain';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, formatMoney } from '../../utils/format';
import { inventoryApi } from '../inventory/inventoryApi';
import { technicianApi } from './technicianApi';

export function TechnicianJobDetailPage() {
  const { id = '' } = useParams();
  const [job, setJob] = useState<Job>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [invoice, setInvoice] = useState<Invoice>();
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<'start' | 'complete' | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [partsBusy, setPartsBusy] = useState(false);
  const actionInFlight = useRef(false);
  const partsInFlight = useRef(false);
  useEffect(() => {
    Promise.all([technicianApi.getJob(id), inventoryApi.list()])
      .then(([loadedJob, loadedInventory]) => {
        setJob(loadedJob);
        setInventory(loadedInventory);
      })
      .catch((caught: Error) => setError(caught.message));
  }, [id]);
  async function start() {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    setActionBusy(true);
    try {
      const result = await technicianApi.startJob(id);
      setJob(result.job);
      setConfirm(null);
      setError('');
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      actionInFlight.current = false;
      setActionBusy(false);
    }
  }
  async function saveParts(parts: UsedPart[]) {
    if (partsInFlight.current || actionInFlight.current) return;
    partsInFlight.current = true;
    setPartsBusy(true);
    try {
      setJob(await technicianApi.replaceUsedParts(id, parts));
      setError('');
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      partsInFlight.current = false;
      setPartsBusy(false);
    }
  }
  function addPart() { if (!job || !itemId) return; const others = job.usedParts.filter((p) => p.inventoryItemId !== itemId); void saveParts([...others, { inventoryItemId: itemId, quantity }]); }
  async function complete() {
    if (actionInFlight.current || partsInFlight.current) return;
    actionInFlight.current = true;
    setActionBusy(true);
    try {
      const result = await technicianApi.completeJob(id);
      setJob(result.job);
      setInvoice(result.invoice);
      setConfirm(null);
      setError('');
    } catch (caught) {
      setError((caught as Error).message);
      setConfirm(null);
    } finally {
      actionInFlight.current = false;
      setActionBusy(false);
    }
  }
  return (
    <>
      <PageHeader title={job ? `Service · ${job.customerName}` : 'Job detail'} description={job && `${formatDate(job.preferredDate)} · ${job.timeSlot}`} actions={<Link className="button secondary" to="/tech/jobs">Back</Link>} />
      <FeedbackBanner message={error} />
      {job && <div className="detail-grid">
        <article className="panel detail-card"><p className="eyebrow">Work status</p><div data-testid="tech-job-detail-status"><StatusBadge status={job.status} /></div><p>{job.serviceType} · {job.priority}<br />{job.numberOfUnits} unit(s)</p>{job.status === 'Assigned' && <button data-testid="tech-start-job-button" className="button primary" disabled={actionBusy} onClick={() => setConfirm('start')}>Start job</button>}{job.status === 'In Progress' && <button data-testid="tech-complete-job-button" className="button primary" disabled={actionBusy || partsBusy} onClick={() => setConfirm('complete')}>Complete job</button>}</article>
        <article className="panel detail-card"><p className="eyebrow">Customer</p><h2>{job.customerName}</h2><p>{job.customerPhone}<br />{job.customerAddress}</p><p>{job.problemDescription || 'No problem description.'}</p></article>
        <article className="panel detail-card full"><p className="eyebrow">Used parts</p>{job.status === 'In Progress' && <div className="inline-form"><select data-testid="tech-used-part-select" value={itemId} disabled={partsBusy || actionBusy} onChange={(e) => setItemId(e.target.value)}><option value="">Select part</option>{inventory.map((item) => <option key={item.id} value={item.id}>{item.name} · stock {item.stock}</option>)}</select><input data-testid="tech-used-part-quantity-input" type="number" min="1" value={quantity} disabled={partsBusy || actionBusy} onChange={(e) => setQuantity(Number(e.target.value))} /><button data-testid="tech-add-used-part-button" className="button secondary" disabled={partsBusy || actionBusy || !itemId} onClick={addPart}>{partsBusy ? 'Saving…' : 'Add / replace'}</button></div>}<ul className="parts-list">{job.usedParts.map((part) => <li key={part.inventoryItemId}>{inventory.find((i) => i.id === part.inventoryItemId)?.name || part.inventoryItemId}<strong>× {part.quantity}</strong>{job.status === 'In Progress' && <button disabled={partsBusy || actionBusy} onClick={() => void saveParts(job.usedParts.filter((p) => p.inventoryItemId !== part.inventoryItemId))}>Remove</button>}</li>)}</ul>{!job.usedParts.length && <p>No parts recorded.</p>}</article>
        {invoice && <article className="panel detail-card full" data-testid="tech-invoice-summary"><p className="eyebrow">Invoice generated</p><h2>{formatMoney(invoice.total)}</h2><p>Subtotal {formatMoney(invoice.subtotal)} · VAT {formatMoney(invoice.vat)}</p></article>}
      </div>}
      <ConfirmDialog open={confirm === 'start'} title="Start this job?" description="The status will change to In Progress." confirmLabel="Start job" busy={actionBusy} onCancel={() => setConfirm(null)} onConfirm={() => void start()} />
      <ConfirmDialog open={confirm === 'complete'} title="Complete this job?" description="Inventory will be deducted and an invoice generated in one transaction." confirmLabel="Complete job" busy={actionBusy || partsBusy} onCancel={() => setConfirm(null)} onConfirm={() => void complete()} />
    </>
  );
}
