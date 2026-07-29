import { useEffect, useState } from 'react';
import type { InventoryItem } from '../../../shared/domain';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PageHeader } from '../../components/PageHeader';
import { formatMoney } from '../../utils/format';
import { inventoryApi } from './inventoryApi';

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [id, setId] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const load = () => inventoryApi.list().then(setItems);
  useEffect(() => { load().catch((caught: Error) => setError(caught.message)); }, []);
  async function adjust() { try { await inventoryApi.adjust(id, type, quantity); setMessage('Stock adjusted successfully'); setError(''); await load(); } catch (caught) { setError((caught as Error).message); setMessage(''); } }
  return (
    <>
      <PageHeader title="Inventory" description="Stock availability, cost, and safety thresholds." />
      <FeedbackBanner kind="success" message={message} /><FeedbackBanner message={error} />
      <section className="panel"><div className="toolbar"><label>Item<select value={id} onChange={(e) => setId(e.target.value)}><option value="">Select item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Movement<select data-testid="inventory-adjust-type-select" value={type} onChange={(e) => setType(e.target.value as 'in'|'out')}><option value="in">Stock in</option><option value="out">Stock out</option></select></label><label>Quantity<input data-testid="inventory-adjust-quantity-input" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></label><button data-testid="inventory-adjust-button" className="button primary" disabled={!id || quantity < 1} onClick={() => void adjust()}>Adjust stock</button></div><div className="table-wrap"><table data-testid="inventory-table"><thead><tr><th>Item</th><th>Stock</th><th>Safety stock</th><th>Unit cost</th><th>Health</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} data-testid={`inventory-row-${item.id}`}><td><strong>{item.name}</strong><br /><small>{item.id}</small></td><td>{item.stock}</td><td>{item.safetyStock}</td><td>{formatMoney(item.unitCost)}</td><td>{item.lowStock ? <span data-testid={`low-stock-badge-${item.id}`} className="status-badge status-unpaid">Low stock</span> : <span className="status-badge status-paid">Healthy</span>}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
