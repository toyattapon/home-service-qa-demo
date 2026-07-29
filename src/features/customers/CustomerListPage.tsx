import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Customer } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { customerApi } from './customerApi';

export function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load(term = '') {
    try {
      setCustomers(await customerApi.list(term));
      setError('');
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  useEffect(() => {
    customerApi
      .list()
      .then((result) => {
        setCustomers(result);
        setError('');
      })
      .catch((caught: Error) => setError(caught.message));
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void load(search);
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customer profiles and air-conditioning details."
        actions={
          <Link className="button primary" to="/admin/customers/new" data-testid="customer-add-button">
            Add customer
          </Link>
        }
      />
      <FeedbackBanner message={error} />
      <section className="panel">
        <form className="toolbar" onSubmit={submit}>
          <label>
            Search by name or phone
            <input
              data-testid="customer-search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. Arun or 0812"
            />
          </label>
          <button className="button secondary" type="submit">Search</button>
        </form>
        <div className="table-wrap">
          <table data-testid="customer-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>AC profile</th><th /></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} data-testid={`customer-row-${customer.id}`}>
                  <td><strong>{customer.name}</strong><br /><small>{customer.address}</small></td>
                  <td>{customer.phone}</td>
                  <td>{customer.acType} · {customer.btu.toLocaleString()} BTU</td>
                  <td><Link className="text-link" to={`/admin/customers/${customer.id}`}>View</Link></td>
                </tr>
              ))}
              {!customers.length && <tr><td colSpan={4} className="empty-cell">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
