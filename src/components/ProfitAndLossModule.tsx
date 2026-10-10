import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { FinancialSummary, Expense } from '../types';
import { exportProfitLossReportPDF, exportIncomeExpenseReportPDF } from '../utils/pdfGenerator';
import {
  TrendingUp,
  Download,
  DollarSign,
  PieChart,
  HelpCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

export const ProfitAndLossModule: React.FC = () => {
  const { business, formatCurrency, currency } = useAuth();
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFin = async () => {
      setLoading(true);
      try {
        const [finData, expData] = await Promise.all([
          api.get<FinancialSummary>('/api/financials'),
          api.get<Expense[]>('/api/expenses'),
        ]);
        setFinancials(finData);
        setExpenses(expData || []);
      } catch (err) {
        console.error('Failed to load P&L data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFin();
  }, [business?.id]);

  if (loading || !financials) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Calculating financial statements and margins...
      </div>
    );
  }

  const isDataIncomplete = financials.totalRevenue === 0 && financials.totalOperatingExpenses === 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Financial Statements & Margins</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Comprehensive Profit & Loss Statement (P&L)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            GAAP-aligned accounting: Revenue, direct Cost of Goods Sold (COGS), gross margins, and net operating profit.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportProfitLossReportPDF(financials, business?.name || 'My_Business', 'Current Year / All Time', currency)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export P&L Statement PDF</span>
          </button>
          <button
            onClick={() => exportIncomeExpenseReportPDF(expenses, financials, business?.name || 'My_Business', 'Current Month', currency)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Expenses Statement PDF</span>
          </button>
        </div>
      </div>

      {isDataIncomplete && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Notice: No completed sales or operational expenses recorded yet. Statement is currently in preliminary/zero balance status.
          </span>
        </div>
      )}

      {/* Accounting Education & Integrity Banner */}
      <div className="p-5 bg-indigo-950/30 border border-indigo-900/50 rounded-2xl space-y-3 text-xs">
        <div className="flex items-center space-x-2 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Brief2Build Accounting Principles & Separation Guide</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-white block mb-0.5">1. Gross Revenue</span>
            <p className="text-[11px] text-slate-400">Total customer receipts collected or billed for delivered products.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-white block mb-0.5">2. Cost of Goods Sold (COGS)</span>
            <p className="text-[11px] text-slate-400">Direct unit cost of items that were actually sold during the period.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-white block mb-0.5">3. Operating Overhead</span>
            <p className="text-[11px] text-slate-400">Fixed rent, staff salaries, and utilities. Unsold stock is an asset, never an expense.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-white block mb-0.5">4. Held Stock Asset</span>
            <p className="text-[11px] text-slate-400">Currently held inventory ({formatCurrency(financials.totalInventoryValue)}) sits on your balance sheet.</p>
          </div>
        </div>
      </div>

      {/* Core Executive KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Gross Sales Revenue</span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {formatCurrency(financials.totalRevenue)}
          </p>
          <span className="text-[10px] text-emerald-400 mt-1 block">100% of top-line receipts</span>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Cost of Goods Sold (COGS)</span>
          <p className="text-2xl font-extrabold text-slate-300 font-mono mt-1">
            {formatCurrency(financials.totalCOGS)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Direct merchandise cost</span>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Gross Profit (Revenue - COGS)</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {formatCurrency(financials.grossProfit)}
          </p>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">
            Gross Margin: {financials.grossMarginPercent.toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Net Operating Profit / (Loss)</span>
          <p className={`text-2xl font-extrabold font-mono mt-1 ${financials.netProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {formatCurrency(financials.netProfit)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Net Margin: {financials.netMarginPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Formal P&L Statement Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Statement of Financial Performance</h3>
          <span className="text-xs text-slate-400 font-mono">Currency: {currency}</span>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Revenue Section */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-white pb-1 border-b border-slate-800">
              <span className="uppercase tracking-wider">Revenue</span>
              <span className="font-mono">{formatCurrency(financials.totalRevenue)}</span>
            </div>
            <div className="flex justify-between pl-4 text-slate-300">
              <span>Gross Sales from Invoiced Products</span>
              <span className="font-mono">{formatCurrency(financials.totalRevenue)}</span>
            </div>
          </div>

          {/* COGS Section */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-slate-300 pb-1 border-b border-slate-800">
              <span className="uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
              <span className="font-mono text-rose-300">({formatCurrency(financials.totalCOGS)})</span>
            </div>
            <div className="flex justify-between pl-4 text-slate-400">
              <span>Direct inventory cost of units sold</span>
              <span className="font-mono">({formatCurrency(financials.totalCOGS)})</span>
            </div>
          </div>

          {/* Gross Profit Highlight */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex justify-between items-center font-bold text-sm text-emerald-300">
            <span>GROSS PROFIT</span>
            <div className="text-right">
              <span className="font-mono">{formatCurrency(financials.grossProfit)}</span>
              <span className="text-[10px] text-emerald-400/80 block font-normal">
                Margin: {financials.grossMarginPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Operating Overhead Section */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between font-bold text-slate-300 pb-1 border-b border-slate-800">
              <span className="uppercase tracking-wider">Operating Expenses (Overhead)</span>
              <span className="font-mono text-rose-400">({formatCurrency(financials.totalOperatingExpenses)})</span>
            </div>
            {Object.entries(financials.expenseByCategory).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between pl-4 text-slate-400">
                <span>{cat.toUpperCase().replace('_', ' ')}</span>
                <span className="font-mono text-slate-300">({formatCurrency(amt)})</span>
              </div>
            ))}
          </div>

          {/* Net Profit Highlight */}
          <div className={`p-4 rounded-xl flex justify-between items-center font-bold text-base ${
            financials.netProfit >= 0
              ? 'bg-indigo-950/40 border border-indigo-700/60 text-indigo-300'
              : 'bg-rose-950/40 border border-rose-700/60 text-rose-300'
          }`}>
            <div>
              <span>NET PROFIT / (LOSS)</span>
              <span className="text-[11px] font-normal text-slate-400 block">
                Net Margin: {financials.netMarginPercent.toFixed(1)}%
              </span>
            </div>
            <span className="font-mono text-xl">{formatCurrency(financials.netProfit)}</span>
          </div>

          {/* Balance Sheet Asset Note */}
          <div className="pt-2 border-t border-slate-800/80 flex justify-between text-slate-400 text-[11px]">
            <span>Memorandum Asset Balance: Held Inventory on Hand</span>
            <span className="font-mono text-amber-300 font-semibold">{formatCurrency(financials.totalInventoryValue)}</span>
          </div>
        </div>
      </div>

      {/* Month-over-Month Comparison Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <h3 className="font-bold text-sm text-white">Month-Over-Month Performance Matrix</h3>
          <p className="text-[11px] text-slate-400">Last 6 recorded calendar months</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-3 px-4 font-semibold">Calendar Month</th>
                <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                <th className="py-3 px-4 font-semibold text-right">COGS</th>
                <th className="py-3 px-4 font-semibold text-right">Gross Profit</th>
                <th className="py-3 px-4 font-semibold text-right">Expenses</th>
                <th className="py-3 px-4 font-semibold text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {financials.monthlyData.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-medium text-white">{m.month}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatCurrency(m.revenue)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">{formatCurrency(m.cogs)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">{formatCurrency(m.grossProfit)}</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-400">{formatCurrency(m.expenses)}</td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${m.netProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {formatCurrency(m.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
