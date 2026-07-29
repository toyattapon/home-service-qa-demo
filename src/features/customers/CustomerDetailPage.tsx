import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Customer } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { customerApi } from './customerApi';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const [customer, setCustomer] = useState<Customer>();
  const [error, setError] = useState('');

  useEffect(() => {
    customerApi.get(id).then(setCustomer).catch((caught: Error) => setError(caught.message));
  }, [id]);

  return (
    <>
      <PageHeader
        title={customer?.name ?? 'Customer detail'}
        description="Contact and equipment information."
        actions={<><Link className="button secondary" to="/admin/customers">Back</Link>{customer && <Link className="button primary" to={`/admin/customers/${id}/edit`}>Edit</Link>}</>}
      />
      <FeedbackBanner message={error} />
      {customer && (
        <section className="detail-grid">
          <article className="panel detail-card"><p className="eyebrow">Contact</p><dl><dt>Phone</dt><dd>{customer.phone}</dd><dt>Address</dt><dd>{customer.address}</dd></dl></article>
          <article className="panel detail-card"><p className="eyebrow">Air conditioner</p><dl><dt>Type</dt><dd>{customer.acType}</dd><dt>BTU</dt><dd>{customer.btu.toLocaleString()}</dd><dt>Brand</dt><dd>{customer.acBrand || 'Not specified'}</dd></dl></article>
          <article className="panel detail-card full"><p className="eyebrow">Note</p><p>{customer.note || 'No note added.'}</p></article>
        </section>
      )}
    </>
  );
}
