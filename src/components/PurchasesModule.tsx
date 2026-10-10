import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Purchase, Supplier, Product, PurchaseItem } from '../types';
import { exportPurchasesReportPDF } from '../utils/pdfGenerator';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Truck,
  Layers,
} from 'lucide-react';

export const PurchasesModule: React.FC = () => {
  const { business, formatCurrency, currency } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New PO Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    batchNumber?: string;
    expiryDate?: string;
  }>>([]);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('paid');
  const [poStatus, setPoStatus] = useState<'received' | 'ordered'>('received');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poData, supData, prodData] = await Promise.all([
        api.get<Purchase[]>('/api/purchases'),
        api.get<Supplier[]>('/api/suppliers'),
        api.get<Product[]>('/api/products'),
      ]);
      setPurchases(poData || []);
      setSuppliers(supData || []);
      setProducts(prodData || []);
    } catch (err) {
      console.error('Failed to load purchases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [business?.id]);

  const handleOpenNewPO = () => {
    setSupplierId(suppliers[0]?.id || '');
    setPoNumber(`PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setDate(new Date().toISOString().split('T')[0]);
    setItems([
      {
        productId: products[0]?.id || '',
        productName: products[0]?.name || 'Raw Materials / Inventory',
        quantity: 10,
        unitCost: products[0]?.purchasePrice || 100,
        batchNumber: '',
        expiryDate: '',
      },
    ]);
    setAdditionalCharges(0);
    setPaymentStatus('paid');
    setPoStatus('received');
    setNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        productId: products[0]?.id || '',
        productName: products[0]?.name || 'Inventory Item',
        quantity: 5,
        unitCost: 100,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    const copy = [...items];
    copy[index].productId = prodId;
    if (prod) {
      copy[index].productName = prod.name;
      copy[index].unitCost = prod.purchasePrice;
    }
    setItems(copy);
  };

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setModalError('Please add at least one line item to the purchase order.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = selectedSupplier ? selectedSupplier.name : 'Direct Wholesale Supplier';

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
    const totalAmount = subtotal + Number(additionalCharges);

    const purchaseItems: PurchaseItem[] = items.map((i) => ({
      productId: i.productId || undefined,
      productName: i.productName,
      quantity: i.quantity,
      unitCost: i.unitCost,
      total: i.quantity * i.unitCost,
      batchNumber: i.batchNumber || undefined,
      expiryDate: i.expiryDate || undefined,
    }));

    try {
      await api.post('/api/purchases', {
        poNumber,
        date: new Date(date).toISOString(),
        supplierId: supplierId || undefined,
        supplierName,
        items: purchaseItems,
        additionalCharges: Number(additionalCharges) || 0,
        totalAmount,
        paymentStatus,
        status: poStatus,
        notes: notes.trim() || undefined,
      });

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to record purchase order');
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalProcurementSpend = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const itemsSubtotal = items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);
  const orderTotal = itemsSubtotal + Number(additionalCharges);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Procurement & Purchasing</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Purchase Orders & Stock Replenishment
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track vendor purchase receipts, additional shipping charges, batch codes, and automatic inventory replenishment.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportPurchasesReportPDF(purchases, business?.name || 'My_Business', currency)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Purchases PDF</span>
          </button>
          <button
            onClick={handleOpenNewPO}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Purchase</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Total Purchase Orders</span>
          <p className="text-xl font-bold text-white font-mono mt-1">{purchases.length}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Total Procurement Spend</span>
          <p className="text-xl font-bold text-amber-300 font-mono mt-1">{formatCurrency(totalProcurementSpend)}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Received & Stocked</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {purchases.filter((p) => p.status === 'received').length}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Pending Orders</span>
          <p className="text-xl font-bold text-amber-400 font-mono mt-1">
            {purchases.filter((p) => p.status === 'ordered').length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PO #, supplier, or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="received">Received (Stock Added)</option>
            <option value="ordered">Ordered (Awaiting Dispatch)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">PO #</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Items Purchased</th>
                <th className="py-3 px-4 font-semibold text-right">Freight/Charges</th>
                <th className="py-3 px-4 font-semibold text-right">Total Outlay</th>
                <th className="py-3 px-4 font-semibold text-center">Payment</th>
                <th className="py-3 px-4 font-semibold text-center">Receipt Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No purchase orders recorded yet. Click "Record New Purchase" to log inventory deliveries.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-medium text-white">{po.poNumber}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(po.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{po.supplierName}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {po.items.map((i, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300">
                            {i.productName} <span className="text-slate-500">x{i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {po.additionalCharges > 0 ? formatCurrency(po.additionalCharges) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-300 text-sm">
                      {formatCurrency(po.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                        po.paymentStatus === 'paid' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {po.status === 'received' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Stock Added
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                          Ordered
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Record Inventory Purchase / Purchase Order
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Receipts marked as "Received" immediately add quantities to your live product inventory.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitPO} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Direct Wholesale Vendor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">PO Number</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Purchased Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Product</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Custom Item</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const copy = [...items];
                              copy[idx].quantity = Number(e.target.value);
                              setItems(copy);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="flex items-end justify-between gap-1">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block mb-0.5">Unit Cost ({currency})</label>
                            <input
                              type="number"
                              min={0}
                              value={item.unitCost}
                              onChange={(e) => {
                                const copy = [...items];
                                copy[idx].unitCost = Number(e.target.value);
                                setItems(copy);
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Optional Batch & Expiry */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                        <div>
                          <input
                            type="text"
                            placeholder="Batch Number (optional)"
                            value={item.batchNumber || ''}
                            onChange={(e) => {
                              const copy = [...items];
                              copy[idx].batchNumber = e.target.value;
                              setItems(copy);
                            }}
                            className="w-full bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1 text-[11px] text-slate-300 font-mono"
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            placeholder="Expiry Date"
                            value={item.expiryDate || ''}
                            onChange={(e) => {
                              const copy = [...items];
                              copy[idx].expiryDate = e.target.value;
                              setItems(copy);
                            }}
                            className="w-full bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1 text-[11px] text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Charges (Freight/Taxes)</label>
                  <input
                    type="number"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Order Status</label>
                  <select
                    value={poStatus}
                    onChange={(e) => setPoStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="received">Received (Add to Stock Now)</option>
                    <option value="ordered">Ordered (Do Not Add Stock Yet)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Supplier Invoice Ref</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Delivery truck arrived at 10 AM, quality seal intact"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Items Subtotal: {formatCurrency(itemsSubtotal)}</span>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Total PO Cost</span>
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Save & Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
