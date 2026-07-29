import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Invoice, InvoiceStatus } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatMoney } from '../../utils/format';
import { invoiceApi } from './invoiceApi';

export function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [error, setError] = useState('');
  useEffect(() => { invoiceApi.list(status || undefined).then(setInvoices).catch((caught: Error) => setError(caught.message)); }, [status]);
  return (
    <>
      <PageHeader title="Invoices" description="Service charges, VAT, and payment status." />
      <FeedbackBanner message={error} />
      <section className="panel"><div className="toolbar"><label>Status<select data-testid="invoice-status-filter" value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus | '')}><option value="">All statuses</option><option>Unpaid</option><option>Paid</option></select></label></div><div className="table-wrap"><table data-testid="invoice-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Service</th><th>Total</th><th>Status</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}><td><Link className="text-link" to={`/admin/invoices/${invoice.id}`}>{invoice.id}</Link></td><td>{invoice.customerName}</td><td>{invoice.serviceType}</td><td><strong>{formatMoney(invoice.total)}</strong></td><td><StatusBadge status={invoice.status} /></td></tr>)}</tbody></table></div></section>
    </>
  );
}
