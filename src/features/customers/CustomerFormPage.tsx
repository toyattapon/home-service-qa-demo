import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CustomerInput } from '../../../shared/domain';
import { ApiClientError } from '../../api/client';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { customerApi } from './customerApi';

const empty: CustomerInput = {
  name: '', phone: '', address: '', acBrand: '', btu: 12000,
  acType: 'Wall Type', note: '',
};

const customerFieldTestIds: Partial<Record<keyof CustomerInput, string>> = {
  name: 'customer-name-input',
  phone: 'customer-phone-input',
  address: 'customer-address-input',
  note: 'customer-note-input',
};

function focusFirstError(
  form: HTMLFormElement,
  fieldErrors: Record<string, string>,
) {
  const firstField = Object.keys(fieldErrors)[0] as keyof CustomerInput | undefined;
  const testId = firstField && customerFieldTestIds[firstField];
  if (testId) {
    form
      .querySelector<HTMLElement>(`[data-testid="${testId}"]`)
      ?.focus();
  }
}

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<CustomerInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    customerApi.get(id).then((customer) => setForm({
      name: customer.name, phone: customer.phone, address: customer.address,
      acBrand: customer.acBrand ?? '', btu: customer.btu, acType: customer.acType,
      note: customer.note ?? '',
    })).catch((caught: Error) => setError(caught.message));
  }, [id]);

  function set<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const formElement = event.currentTarget as HTMLFormElement;
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 50) {
      nextErrors.name = 'Name must be 2–50 characters';
    }
    if (!/^\d{10}$/.test(form.phone)) nextErrors.phone = 'Phone number must be 10 digits';
    if (form.address.trim().length < 5 || form.address.trim().length > 200) {
      nextErrors.address = 'Address must be 5–200 characters';
    }
    if ((form.note?.length ?? 0) > 300) {
      nextErrors.note = 'Note must be no more than 300 characters';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(formElement, nextErrors);
      return;
    }
    setBusy(true); setError('');
    try {
      const saved = id ? await customerApi.update(id, form) : await customerApi.create(form);
      navigate(`/admin/customers/${saved.id}`);
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        const fieldErrors = caught.fieldErrors ?? {};
        setErrors(fieldErrors);
        focusFirstError(formElement, fieldErrors);
      }
      setError((caught as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={id ? 'Edit customer' : 'New customer'} description="Required fields are validated by both the UI and API." />
      <section className="panel form-panel">
        <form className="form-grid" onSubmit={submit}>
          <FeedbackBanner message={error} />
          <label>Name<input data-testid="customer-name-input" maxLength={50} value={form.name} onChange={(e) => set('name', e.target.value)} />{errors.name && <span className="field-error">{errors.name}</span>}</label>
          <label>Phone<input data-testid="customer-phone-input" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set('phone', e.target.value)} />{errors.phone && <span className="field-error">{errors.phone}</span>}</label>
          <label className="full">Address<input data-testid="customer-address-input" maxLength={200} value={form.address} onChange={(e) => set('address', e.target.value)} />{errors.address && <span className="field-error">{errors.address}</span>}</label>
          <label>AC brand<input data-testid="customer-ac-brand-input" value={form.acBrand} onChange={(e) => set('acBrand', e.target.value)} /></label>
          <label>BTU<select data-testid="customer-btu-select" value={form.btu} onChange={(e) => set('btu', Number(e.target.value) as CustomerInput['btu'])}>{[9000,12000,18000,24000].map((v) => <option key={v} value={v}>{v.toLocaleString()}</option>)}</select></label>
          <label>AC type<select data-testid="customer-ac-type-select" value={form.acType} onChange={(e) => set('acType', e.target.value as CustomerInput['acType'])}>{['Wall Type','Cassette','Floor Standing','Portable'].map((v) => <option key={v}>{v}</option>)}</select></label>
          <label className="full">Note<textarea data-testid="customer-note-input" maxLength={300} value={form.note} onChange={(e) => set('note', e.target.value)} />{errors.note && <span className="field-error">{errors.note}</span>}</label>
          <div className="form-actions"><Link className="button secondary" to={id ? `/admin/customers/${id}` : '/admin/customers'}>Cancel</Link><button data-testid="customer-save-button" className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Save customer'}</button></div>
        </form>
      </section>
    </>
  );
}
