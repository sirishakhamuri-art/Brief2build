import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { FinancialSummary, Product } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldAlert,
  Banknote,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { business, formatCurrency } = useAuth();
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [finData, prodData] = await Promise.all([
        api.get<FinancialSummary>('/api/financials'),
        api.get<Product[]>('/api/products'),
      ]);
      setFinancials(finData);
      setLowStockProducts(
        (prodData || []).filter(
          (p) => p.status === 'low_stock' || p.currentStock <= p.minThreshold
        )
      );
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [business?.id]);

  if (loading || !financials) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        <p className="text-xs">Loading operational metrics...</p>
      </div>
    );
  }

  // Max value for SVG bar chart scaling
  const maxMonthlyRev = Math.max(...financials.monthlyData.map((m) => Math.max(m.revenue, m.expenses, 1000)));

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
              Live Command Center
            </span>
            <span className="text-xs text-slate-400">• {business?.categoryLabel || business?.category}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
            {business?.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time balance sheet, active inventory thresholds, and commercial transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('sales')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New POS Sale</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stock / SKU</span>
          </button>
          <button
            onClick={() => onNavigate('expenses')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={() => onNavigate('cashflow')}
            className="px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>90-Day Cash Flow</span>
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                Low Stock Alert ({lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Need Reordering)
              </h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(', ')}
                {lowStockProducts.length > 3 ? ` and ${lowStockProducts.length - 3} more` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('suppliers')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer shrink-0"
          >
            <span>Issue Supplier Reorder</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Today's Sales</span>
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              {formatCurrency(financials.todaySalesRevenue)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {financials.todaySalesCount} transaction(s) recorded
            </p>
          </div>
        </div>

        {/* Card 2: Monthly Revenue */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Current Month Rev</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-emerald-400 font-mono">
              {formatCurrency(financials.currentMonthRevenue)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Gross sales collected
            </p>
          </div>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Operating Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-rose-400 font-mono">
              {formatCurrency(financials.currentMonthOperatingExpenses)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Overhead excluding stock
            </p>
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Net Profit (MTD)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <p className={`text-xl font-bold font-mono ${financials.currentMonthNetProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatCurrency(financials.currentMonthNetProfit)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Margin: {financials.netMarginPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Card 5: Inventory Valuation */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Held Stock Valuation</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-amber-300 font-mono">
              {formatCurrency(financials.totalInventoryValue)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {financials.totalProductsCount} SKUs on hand
            </p>
          </div>
        </div>

        {/* Card 6: Threshold Alerts */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">
              {financials.lowStockCount} <span className="text-xs font-normal text-slate-400">Low</span>
              {financials.outOfStockCount > 0 && <span className="text-xs text-rose-400 ml-1.5">({financials.outOfStockCount} Out)</span>}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {financials.expiredCount > 0 ? `${financials.expiredCount} expired item(s)` : 'Zero expired stock'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts & Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue vs Expenses Trend (SVG Responsive) */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Revenue & Overhead Trajectory</h3>
              <p className="text-[11px] text-slate-400">Real transaction history over the last 6 calendar periods</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                <span>Revenue</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>Operating Overhead</span>
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-52 w-full flex items-end justify-between pt-6 px-2 gap-3 border-b border-slate-800">
            {financials.monthlyData.map((m, idx) => {
              const revHeight = maxMonthlyRev > 0 ? Math.min(100, Math.round((m.revenue / maxMonthlyRev) * 100)) : 4;
              const expHeight = maxMonthlyRev > 0 ? Math.min(100, Math.round((m.expenses / maxMonthlyRev) * 100)) : 4;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center space-x-1 h-36">
                    {/* Revenue Bar */}
                    <div
                      className="w-1/2 max-w-[20px] bg-indigo-500 hover:bg-indigo-400 rounded-t transition-all duration-300 relative"
                      style={{ height: `${Math.max(revHeight, 3)}%` }}
                      title={`Revenue: ${formatCurrency(m.revenue)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-1/2 max-w-[20px] bg-rose-500 hover:bg-rose-400 rounded-t transition-all duration-300 relative"
                      style={{ height: `${Math.max(expHeight, 3)}%` }}
                      title={`Expenses: ${formatCurrency(m.expenses)}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">{m.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Gross Lifetime Revenue: <strong className="text-slate-200">{formatCurrency(financials.totalRevenue)}</strong></span>
            <span>Lifetime Gross Profit: <strong className="text-emerald-400">{formatCurrency(financials.grossProfit)}</strong> ({financials.grossMarginPercent.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Best Selling Products based on ACTUAL sales transactions */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Top Selling Products</span>
              </h3>
              <span className="text-[10px] text-slate-400">By Sales Quantity</span>
            </div>

            {financials.topSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recorded sales yet. Once you complete checkout, top performers will render here.
              </div>
            ) : (
              <div className="space-y-3">
                {financials.topSellingProducts.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[150px]">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.quantity} units sold</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('insights')}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <span>View Full AI Insights & Recommendations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Operating Expense Distribution */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Operating Expense Distribution</span>
          </h3>
          <span className="text-xs text-slate-400">
            Total Operational Outflow: {formatCurrency(financials.totalOperatingExpenses)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(financials.expenseByCategory).map(([cat, amt]) => {
            const pct = financials.totalOperatingExpenses > 0 ? (amt / financials.totalOperatingExpenses) * 100 : 0;
            return (
              <div key={cat} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 truncate block">
                  {cat.replace('_', ' ')}
                </span>
                <p className="text-sm font-bold text-white font-mono">{formatCurrency(amt)}</p>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[9px] text-slate-500">{pct.toFixed(0)}% of total</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
