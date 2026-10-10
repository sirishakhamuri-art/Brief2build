import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Supplier, Product } from '../types';
import {
  Users,
  Plus,
  Phone,
  Globe,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  ShoppingCart,
  X,
  ShieldCheck,
  CheckCircle2,
  Search,
} from 'lucide-react';

export const SupplierDirectory: React.FC = () => {
  const { business, formatCurrency, currency } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Reorder modal states
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderSupplier, setReorderSupplier] = useState<Supplier | null>(null);
  const [reorderItems, setReorderItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }>>([]);
  const [reorderAdditionalCost, setReorderAdditionalCost] = useState<number>(0);
  const [reorderNotes, setReorderNotes] = useState<string>('');
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCategories, setFormCategories] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formMoq, setFormMoq] = useState('');
  const [formPriceNotes, setFormPriceNotes] = useState('');
  const [formPaymentTerms, setFormPaymentTerms] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supData, prodData] = await Promise.all([
        api.get<Supplier[]>('/api/suppliers'),
        api.get<Product[]>('/api/products'),
      ]);
      setSuppliers(supData || []);
      setProducts(prodData || []);
    } catch (err) {
      console.error('Failed to load supplier directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [business?.id]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormCategories('General');
    setFormWebsite('');
    setFormMoq('');
    setFormPriceNotes('');
    setFormPaymentTerms('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormName(sup.name);
    setFormContactPerson(sup.contactPerson);
    setFormPhone(sup.phone);
    setFormEmail(sup.email || '');
    setFormAddress(sup.address);
    setFormCategories(sup.productCategories.join(', '));
    setFormWebsite(sup.website || '');
    setFormMoq(sup.minOrderQuantity || '');
    setFormPriceNotes(sup.priceNotes || '');
    setFormPaymentTerms(sup.paymentTerms || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Supplier name is required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      contactPerson: formContactPerson.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      address: formAddress.trim(),
      productCategories: formCategories.split(',').map((c) => c.trim()).filter(Boolean),
      website: formWebsite.trim() || undefined,
      minOrderQuantity: formMoq.trim() || undefined,
      priceNotes: formPriceNotes.trim() || undefined,
      paymentTerms: formPaymentTerms.trim() || undefined,
      verified: editingSupplier ? editingSupplier.verified : false,
      verificationStatusNote: editingSupplier ? editingSupplier.verificationStatusNote : 'User Registered Business Supplier',
    };

    try {
      if (editingSupplier) {
        await api.put(`/api/suppliers/${editingSupplier.id}`, payload);
      } else {
        await api.post('/api/suppliers', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save supplier');
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!window.confirm(`Delete supplier "${name}" from directory?`)) return;
    try {
      await api.del(`/api/suppliers/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  // Reorder Request Workflow (Section 7)
  const handleOpenReorder = (sup: Supplier) => {
    setReorderSupplier(sup);
    setReorderSuccessMsg(null);
    // Find products linked to this supplier or matching categories
    const matchingProducts = products.filter(
      (p) => p.supplierId === sup.id || p.supplierName?.toLowerCase() === sup.name.toLowerCase()
    );

    const initialItems = (matchingProducts.length > 0 ? matchingProducts : products.slice(0, 3)).map((p) => {
      // Recommend reorder quantity considering current stock & threshold
      const neededQty = Math.max(5, p.minThreshold * 2 - p.currentStock);
      return {
        productId: p.id,
        productName: p.name,
        quantity: neededQty,
        unitCost: p.purchasePrice || 100,
      };
    });

    setReorderItems(initialItems);
    setReorderAdditionalCost(200); // estimated freight/dispatch
    setReorderNotes('Reorder request generated from low-stock threshold alert');
    setIsReorderModalOpen(true);
  };

  const handleConfirmReorder = async () => {
    if (!reorderSupplier || reorderItems.length === 0) return;

    try {
      const totalAmount =
        reorderItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0) +
        Number(reorderAdditionalCost);

      const payload = {
        poNumber: `PO-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        supplierId: reorderSupplier.id,
        supplierName: reorderSupplier.name,
        items: reorderItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.quantity * item.unitCost,
        })),
        additionalCharges: Number(reorderAdditionalCost) || 0,
        totalAmount,
        paymentStatus: 'pending' as const,
        status: 'ordered' as const, // Confirmed order
        notes: reorderNotes,
      };

      await api.post('/api/purchases', payload);
      setReorderSuccessMsg(`Reorder request confirmed and logged as Purchase Order ${payload.poNumber}! You can view it under Purchases.`);
      setTimeout(() => {
        setIsReorderModalOpen(false);
        setReorderSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to place reorder');
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productCategories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Supplier Directory & Relationship Ledger</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Active Trade Suppliers & Agencies
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain authorized vendor contacts, call wholesalers directly, and issue verified reorder requests.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Supplier</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search suppliers by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredSuppliers.length} supplier(s) recorded
        </span>
      </div>

      {/* Grid of Saved Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs bg-slate-900/30 rounded-2xl border border-slate-800">
            No suppliers found in directory. Use "Supplier Discovery" to add verified vendors or click "Add Custom Supplier".
          </div>
        ) : (
          filteredSuppliers.map((sup) => {
            // Count products supplied by this vendor
            const suppliedProducts = products.filter(
              (p) => p.supplierId === sup.id || p.supplierName?.toLowerCase() === sup.name.toLowerCase()
            );
            const hasLowStockItem = suppliedProducts.some(
              (p) => p.currentStock <= p.minThreshold
            );

            return (
              <div
                key={sup.id}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-white">{sup.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Contact: {sup.contactPerson || 'Office'}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(sup)}
                        className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {sup.verified ? (
                    <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span className="truncate">{sup.verificationStatusNote || 'Verified Trade Merchant'}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded">
                      Unverified Listing • Custom Vendor Record
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {sup.productCategories.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <p><strong className="text-slate-400">Phone: </strong>{sup.phone || 'N/A'}</p>
                    <p><strong className="text-slate-400">Address: </strong>{sup.address || 'N/A'}</p>
                    {sup.minOrderQuantity && <p><strong className="text-slate-400">MOQ: </strong>{sup.minOrderQuantity}</p>}
                    {sup.priceNotes && <p><strong className="text-slate-400">Quotations: </strong>{sup.priceNotes}</p>}
                    {sup.paymentTerms && <p><strong className="text-slate-400">Terms: </strong>{sup.paymentTerms}</p>}
                  </div>

                  {hasLowStockItem && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Items from this supplier need reordering!</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {sup.phone && (
                      <a
                        href={`tel:${sup.phone}`}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                    {sup.website && (
                      <a
                        href={sup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                        title="Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenReorder(sup)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Prepare Reorder</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Prepare Reorder Request Modal */}
      {isReorderModalOpen && reorderSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsReorderModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Prepare Purchase Reorder Request
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Supplier: <strong className="text-white">{reorderSupplier.name}</strong> • Phone: {reorderSupplier.phone}
            </p>

            {reorderSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reorderSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Reorder Line Items</label>
                {reorderItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs">
                    <span className="font-semibold text-white truncate">{item.productName}</span>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Order Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const copy = [...reorderItems];
                          copy[idx].quantity = Number(e.target.value);
                          setReorderItems(copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Cost Each ({currency})</label>
                      <input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => {
                          const copy = [...reorderItems];
                          copy[idx].unitCost = Number(e.target.value);
                          setReorderItems(copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Freight / Taxes ({currency})</label>
                  <input
                    type="number"
                    value={reorderAdditionalCost}
                    onChange={(e) => setReorderAdditionalCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Instructions</label>
                  <input
                    type="text"
                    value={reorderNotes}
                    onChange={(e) => setReorderNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Total PO Estimated Amount:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {formatCurrency(
                    reorderItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0) +
                      Number(reorderAdditionalCost)
                  )}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Note: In accordance with Brief2Build AI integrity policies, confirming here creates an official internal Purchase Order and replenishes stock upon physical receipt.
              </p>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReorder}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Confirm & Record Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Custom Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingSupplier ? 'Edit Supplier Record' : 'Add Custom Supplier'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter wholesaler contact details, minimum order terms, and quotation agreements.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier / Agency Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Metro Packaging Solutions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Sunil Kumar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="sales@supplier.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Website</label>
                  <input
                    type="url"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Market yard / Industrial estate address"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categories Supplied (Comma separated)</label>
                <input
                  type="text"
                  value={formCategories}
                  onChange={(e) => setFormCategories(e.target.value)}
                  placeholder="e.g. Flour, Sugar, Fats, Packaging"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Order Qty (MOQ)</label>
                  <input
                    type="text"
                    value={formMoq}
                    onChange={(e) => setFormMoq(e.target.value)}
                    placeholder="e.g. 50 kg or ₹5000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price Notes / Quotes</label>
                  <input
                    type="text"
                    value={formPriceNotes}
                    onChange={(e) => setFormPriceNotes(e.target.value)}
                    placeholder="e.g. ₹42/kg on 100kg+"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    placeholder="e.g. Net 15 / COD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
