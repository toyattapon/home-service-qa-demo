import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Invoice } from '../../../shared/domain';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatMoney } from '../../utils/format';
import { invoiceApi } from './invoiceApi';

export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const [invoice, setInvoice] = useState<Invoice>();
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { invoiceApi.get(id).then(setInvoice).catch((caught: Error) => setError(caught.message)); }, [id]);
  async function pay() { try { setInvoice(await invoiceApi.pay(id)); setConfirm(false); } catch (caught) { setError((caught as Error).message); } }
  return (
    <>
      <PageHeader title="Invoice detail" description={invoice?.id} actions={<Link className="button secondary" to="/admin/invoices">Back</Link>} />
      <FeedbackBanner message={error} />
      {invoice && <section className="invoice-layout panel"><div className="invoice-heading"><div><p className="eyebrow">Bill to</p><h2>{invoice.customerName}</h2><p>Job {invoice.jobId} · {invoice.serviceType}</p></div><div data-testid="invoice-status"><StatusBadge status={invoice.status} /></div></div><dl className="invoice-lines"><dt>Service fee</dt><dd data-testid="invoice-service-fee">{formatMoney(invoice.serviceFee)}</dd><dt>Urgent surcharge</dt><dd data-testid="invoice-urgent-surcharge">{formatMoney(invoice.urgentSurcharge)}</dd><dt>Parts cost</dt><dd data-testid="invoice-parts-cost">{formatMoney(invoice.partsCost)}</dd><dt>Subtotal</dt><dd data-testid="invoice-subtotal">{formatMoney(invoice.subtotal)}</dd><dt>VAT 7%</dt><dd data-testid="invoice-vat">{formatMoney(invoice.vat)}</dd><dt className="total">Total</dt><dd className="total" data-testid="invoice-total">{formatMoney(invoice.total)}</dd></dl>{invoice.receiptNo && <div className="receipt" data-testid="invoice-receipt-number"><span>Receipt number</span><strong>{invoice.receiptNo}</strong></div>}{invoice.status === 'Unpaid' && <div className="invoice-actions"><button data-testid="invoice-mark-paid-button" className="button primary" onClick={() => setConfirm(true)}>Mark as paid</button></div>}</section>}
      <ConfirmDialog open={confirm} title="Mark invoice as paid?" description="This mock payment cannot be reversed." confirmLabel="Mark paid" onCancel={() => setConfirm(false)} onConfirm={() => void pay()} />
    </>
  );
}
