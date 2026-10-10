import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Product, FoodSafetyIncident } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  Lock,
  Search,
  Filter,
} from 'lucide-react';

export const FoodSafetyModule: React.FC = () => {
  const { business } = useAuth();
  const [incidents, setIncidents] = useState<FoodSafetyIncident[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState<FoodSafetyIncident['incidentType']>('customer_complaint');
  const [productId, setProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<FoodSafetyIncident['severity']>('medium');
  const [stockQuarantinedQty, setStockQuarantinedQty] = useState<number>(0);
  const [actionTaken, setActionTaken] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incData, prodData] = await Promise.all([
        api.get<FoodSafetyIncident[]>('/api/food-safety'),
        api.get<Product[]>('/api/products'),
      ]);
      setIncidents(incData || []);
      setProducts(prodData || []);
    } catch (err) {
      console.error('Failed to load food safety data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [business?.id]);

  const handleOpenLogModal = () => {
    setIncidentType('customer_complaint');
    setProductId(products[0]?.id || '');
    setBatchNumber(products[0]?.batchNumber || '');
    setDescription('');
    setSeverity('medium');
    setStockQuarantinedQty(0);
    setActionTaken('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleProductChange = (pId: string) => {
    setProductId(pId);
    const p = products.find((prod) => prod.id === pId);
    if (p && p.batchNumber) {
      setBatchNumber(p.batchNumber);
    }
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setModalError('Incident description is required.');
      return;
    }

    const selectedProd = products.find((p) => p.id === productId);

    try {
      await api.post('/api/food-safety', {
        date: new Date().toISOString(),
        incidentType,
        productId: productId || undefined,
        productName: selectedProd ? selectedProd.name : undefined,
        batchNumber: batchNumber.trim() || undefined,
        description: description.trim(),
        severity,
        actionTaken: actionTaken.trim() || 'Logged for review; batch inspected.',
        stockQuarantinedQty: Number(stockQuarantinedQty) || 0,
        status: 'investigating',
      });

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to record safety incident');
    }
  };

  // Expiry audit
  const nowTime = Date.now();
  const sevenDaysFromNow = nowTime + 7 * 24 * 3600 * 1000;

  const expiredProducts = products.filter(
    (p) => p.status === 'expired' || (p.expiryDate && new Date(p.expiryDate).getTime() < nowTime)
  );

  const expiringSoonProducts = products.filter((p) => {
    if (!p.expiryDate) return false;
    const t = new Date(p.expiryDate).getTime();
    return t >= nowTime && t <= sevenDaysFromNow;
  });

  const onHoldProducts = products.filter((p) => p.status === 'on_hold');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Food & Product Quality Assurance</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Safety Incidents, Batch Traceability & Quarantine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor perishable expiry dates, record customer product complaints, isolate affected batches, and maintain audit records.
          </p>
        </div>

        <button
          onClick={handleOpenLogModal}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-rose-600/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Safety Incident / Complaint</span>
        </button>
      </div>

      {/* Expiry & Quarantine Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expired Stock Card */}
        <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Expired Products</span>
            <span className="text-lg font-mono font-extrabold text-rose-400">{expiredProducts.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {expiredProducts.length > 0
              ? `${expiredProducts.map((p) => p.name).join(', ')}. Blocked from point-of-sale checkout.`
              : 'Zero expired products detected.'}
          </p>
        </div>

        {/* Expiring Soon Card */}
        <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Expiring in 7 Days</span>
            <span className="text-lg font-mono font-extrabold text-amber-400">{expiringSoonProducts.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {expiringSoonProducts.length > 0
              ? `${expiringSoonProducts.map((p) => `${p.name} (Exp: ${new Date(p.expiryDate!).toLocaleDateString()})`).join(', ')}`
              : 'All perishable inventory is well within expiration dates.'}
          </p>
        </div>

        {/* Quarantined Stock Card */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Stock on Quarantine Hold</span>
            <span className="text-lg font-mono font-extrabold text-white">{onHoldProducts.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {onHoldProducts.length > 0
              ? `${onHoldProducts.map((p) => `${p.name} (${p.currentStock} units)`).join(', ')}`
              : 'No inventory currently sequestered under safety hold.'}
          </p>
        </div>
      </div>

      {/* Safety Incident & Complaint Register */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Product Safety & Complaint Incident Register</h3>
          <span className="text-xs text-slate-400 font-mono">{incidents.length} record(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-3 px-4 font-semibold">Incident Date</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Product & Batch #</th>
                <th className="py-3 px-4 font-semibold">Complaint / Issue Description</th>
                <th className="py-3 px-4 font-semibold text-center">Severity</th>
                <th className="py-3 px-4 font-semibold">Corrective Action Taken</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No safety incidents or complaints logged. Click "Log Safety Incident / Complaint" to record an event.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(inc.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold text-[10px] uppercase">
                        {inc.incidentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{inc.productName || 'General Facility'}</div>
                      {inc.batchNumber && <div className="text-[10px] text-slate-500 font-mono">Batch: {inc.batchNumber}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">{inc.description}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inc.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : inc.severity === 'high'
                          ? 'bg-rose-950/60 text-rose-400'
                          : inc.severity === 'medium'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      {inc.actionTaken}
                      {inc.stockQuarantinedQty ? (
                        <span className="block text-[10px] text-amber-400 font-semibold mt-0.5">
                          Quarantined: {inc.stockQuarantinedQty} units
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300">
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Guidance Protocol */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
        <h4 className="font-bold text-sm text-white flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>FSSAI & Regulatory Investigation Protocol Guidance</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <strong className="text-white block">1. Immediate Quarantine</strong>
            <p className="text-slate-400 text-[11px]">
              Upon receiving a foreign-body or spoilage complaint, instantly segregate remaining units from that batch into the quarantine zone.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block">2. Supplier Traceability</strong>
            <p className="text-slate-400 text-[11px]">
              Cross-reference the batch number against the relevant Purchase Order to identify date of ingredient receipt and wholesale vendor credentials.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block">3. Preserve Audit Evidence</strong>
            <p className="text-slate-400 text-[11px]">
              Retain sample photographs, packaging lot numbers, and customer contact notes for verification during food inspector audits.
            </p>
          </div>
        </div>
      </div>

      {/* Log Safety Incident Modal */}
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
              Log Safety Incident / Customer Complaint
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording an incident with quarantine units will immediately move that stock on hold.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitIncident} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Type</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="customer_complaint">Customer Complaint</option>
                    <option value="spoiled_batch">Spoiled Batch / Texture</option>
                    <option value="temperature_excursion">Chiller / Temperature Issue</option>
                    <option value="supplier_recall">Supplier Notice / Recall</option>
                    <option value="packaging_defect">Packaging Seal Defect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="low">Low (Cosmetic / Minor)</option>
                    <option value="medium">Medium (Taste / Off-flavor)</option>
                    <option value="high">High (Spoilage / Physical defect)</option>
                    <option value="critical">Critical (Allergen / Contamination)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Product</label>
                  <select
                    value={productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">General Facility / Non-specific</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-2026-10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description of Incident / Complaint *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Customer reported sour taste in batch #10. Suspected cold storage interruption."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Units to Quarantine</label>
                  <input
                    type="number"
                    min={0}
                    value={stockQuarantinedQty}
                    onChange={(e) => setStockQuarantinedQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corrective Action Taken</label>
                  <input
                    type="text"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="e.g. Quarantined 5 units, refunded customer, notified vendor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  Log Incident & Quarantine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
