import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Expense } from '../types';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Search,
  Filter,
  X,
  CheckCircle2,
} from 'lucide-react';

export const ExpensesModule: React.FC = () => {
  const { business, formatCurrency, currency } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Expense['category']>('rent');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer / NEFT');
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.get<Expense[]>('/api/expenses');
      setExpenses(data || []);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [business?.id]);

  const handleOpenAdd = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('rent');
    setDescription('');
    setAmount(0);
    setPaymentMethod('Bank Transfer / NEFT');
    setReceiptRef('');
    setNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setModalError('Description is required.');
      return;
    }
    if (amount <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }

    try {
      await api.post('/api/expenses', {
        date,
        category,
        description: description.trim(),
        amount: Number(amount),
        paymentMethod,
        receiptRef: receiptRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setIsModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      setModalError(err.message || 'Failed to record expense');
    }
  };

  const handleDeleteExpense = async (id: string, desc: string) => {
    if (!window.confirm(`Delete expense record "${desc}"?`)) return;
    try {
      await api.del(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.receiptRef && e.receiptRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Operational Overhead</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Business Operating Expenses Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record non-stock operational disbursements: rent, utilities, salaries, marketing, packaging, and maintenance.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense Entry</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Total Entries Recorded</span>
          <p className="text-xl font-bold text-white font-mono mt-1">{expenses.length}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Lifetime Overhead Total</span>
          <p className="text-xl font-bold text-rose-400 font-mono mt-1">{formatCurrency(totalExpenseAmount)}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Premises / Rent Share</span>
          <p className="text-xl font-bold text-white font-mono mt-1">
            {formatCurrency(expenses.filter((e) => e.category === 'rent').reduce((acc, e) => acc + e.amount, 0))}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Staff Salaries Share</span>
          <p className="text-xl font-bold text-white font-mono mt-1">
            {formatCurrency(expenses.filter((e) => e.category === 'salaries').reduce((acc, e) => acc + e.amount, 0))}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description, receipt #, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Expense Categories</option>
            <option value="rent">Rent & Storefront</option>
            <option value="electricity">Electricity & Utilities</option>
            <option value="salaries">Salaries & Wages</option>
            <option value="raw_materials">Direct Raw Materials</option>
            <option value="packaging">Packaging Supplies</option>
            <option value="transportation">Logistics & Transportation</option>
            <option value="equipment">Equipment Maintenance</option>
            <option value="marketing">Advertising & Marketing</option>
            <option value="other">Other Miscellaneous</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold">Receipt / Ref</th>
                <th className="py-3 px-4 font-semibold text-right">Amount Outlay</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No operating expenses recorded. Click "Record Expense Entry" to log bills or rent.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px] uppercase">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{exp.description}</div>
                      {exp.notes && <div className="text-[10px] text-slate-500 italic">{exp.notes}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{exp.receiptRef || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.description)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Record Operating Expense
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter operational costs like lease, utilities, staff payroll, or packaging.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="rent">Store Rent</option>
                    <option value="electricity">Electricity / Power</option>
                    <option value="salaries">Salaries & Wages</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="packaging">Packaging Supplies</option>
                    <option value="transportation">Logistics / Freight</option>
                    <option value="equipment">Equipment Maintenance</option>
                    <option value="marketing">Marketing & Promotion</option>
                    <option value="other">Other Operating Overhead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. October Commercial Lease Advance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Cash">Cash Voucher</option>
                    <option value="Corporate Card">Credit / Debit Card</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice / Receipt Ref</label>
                  <input
                    type="text"
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    placeholder="e.g. RCP-1092"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Approved by owner"
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
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
