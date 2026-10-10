import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  BusinessPlan,
  Supplier,
  Product,
  Sale,
  Purchase,
  Expense,
  FinancialSummary,
} from '../types';
import {
  exportBusinessPlanPDF,
  exportStartupBudgetPDF,
  exportSupplierComparisonPDF,
  exportInventoryReportPDF,
  exportSalesReportPDF,
  exportPurchasesReportPDF,
  exportIncomeExpenseReportPDF,
  exportProfitLossReportPDF,
  exportCashFlowForecastPDF,
} from '../utils/pdfGenerator';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  Compass,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  Banknote,
} from 'lucide-react';

export const ReportsExport: React.FC = () => {
  const { business, currency } = useAuth();

  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [cashFlowReport, setCashFlowReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [pData, sData, prData, saData, puData, exData, fiData, cfData] = await Promise.all([
          api.get<BusinessPlan | null>('/api/business-plan').catch(() => null),
          api.get<Supplier[]>('/api/suppliers').catch(() => []),
          api.get<Product[]>('/api/products').catch(() => []),
          api.get<Sale[]>('/api/sales').catch(() => []),
          api.get<Purchase[]>('/api/purchases').catch(() => []),
          api.get<Expense[]>('/api/expenses').catch(() => []),
          api.get<FinancialSummary>('/api/financials').catch(() => null),
          api.get<any>('/api/cash-flow/forecast').catch(() => null),
        ]);

        setPlan(pData);
        setSuppliers(sData || []);
        setProducts(prData || []);
        setSales(saData || []);
        setPurchases(puData || []);
        setExpenses(exData || []);
        setFinancials(fiData);
        setCashFlowReport(cfData);
      } catch (err) {
        console.error('Failed to load export data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [business?.id]);

  const businessName = business?.name || 'My_Business';

  const reportsList = [
    {
      title: 'Strategic Business Plan PDF',
      description: 'Comprehensive business model, executive summary, target market, and operational roadmap.',
      icon: Compass,
      available: !!plan,
      badge: plan ? 'Plan Configured' : 'Draft / Create First',
      meta: plan ? `${plan.launchTimeline?.length || 3} roadmap phases` : 'No plan saved',
      action: () => {
        if (!plan) return alert('Please generate or save a business plan first in Business Planning.');
        exportBusinessPlanPDF(plan, businessName, currency);
      },
    },
    {
      title: 'Startup Budget Estimate PDF',
      description: 'Capital expenditure breakdown, capital allocation percentages, and initial fit-out costs.',
      icon: Layers,
      available: !!plan,
      badge: plan ? 'Ready for Export' : 'Requires Plan',
      meta: plan ? `${plan.budgetAllocation?.length || 4} allocation tiers` : 'No budget saved',
      action: () => {
        if (!plan) return alert('Please generate or save a business plan first in Business Planning.');
        exportStartupBudgetPDF(plan, businessName, currency);
      },
    },
    {
      title: 'Supplier Directory & Comparison PDF',
      description: 'Side-by-side sourcing matrix with contact phone numbers, MOQs, and verification status.',
      icon: Truck,
      available: suppliers.length > 0,
      badge: `${suppliers.length} Vendor(s)`,
      meta: 'Includes call contacts & MOQs',
      action: () => {
        if (suppliers.length === 0) return alert('No suppliers saved in directory.');
        exportSupplierComparisonPDF(suppliers, businessName, currency);
      },
    },
    {
      title: 'Inventory & Stock Valuation Report PDF',
      description: 'Full SKU audit, cost vs selling prices, held asset valuation, and low-stock reorder thresholds.',
      icon: Package,
      available: products.length > 0,
      badge: `${products.length} SKU(s)`,
      meta: `Valuation: ${currency} ${(financials?.totalInventoryValue || 0).toLocaleString()}`,
      action: () => {
        exportInventoryReportPDF(products, businessName, currency);
      },
    },
    {
      title: 'Daily / Monthly Sales Register PDF',
      description: 'Itemized sales transactions, payment methods (UPI/Cash/Card), and COGS margin per invoice.',
      icon: ShoppingCart,
      available: sales.length > 0,
      badge: `${sales.length} Invoices`,
      meta: `Revenue: ${currency} ${(financials?.totalRevenue || 0).toLocaleString()}`,
      action: () => {
        exportSalesReportPDF(sales, businessName, 'All Time / Historical', currency);
      },
    },
    {
      title: 'Purchase Orders & Sourcing Log PDF',
      description: 'Procurement expenditures, supplier invoices, received goods, and additional freight charges.',
      icon: FileText,
      available: purchases.length > 0,
      badge: `${purchases.length} Purchase Orders`,
      meta: 'Received & ordered tracking',
      action: () => {
        exportPurchasesReportPDF(purchases, businessName, currency);
      },
    },
    {
      title: 'Operating Income & Expense Report PDF',
      description: 'Disbursements by category (rent, electricity, salaries, packaging) and share of total outflow.',
      icon: DollarSign,
      available: expenses.length > 0 || (financials && financials.totalRevenue > 0),
      badge: `${expenses.length} Expense Logs`,
      meta: `Overhead: ${currency} ${(financials?.totalOperatingExpenses || 0).toLocaleString()}`,
      action: () => {
        if (!financials) return;
        exportIncomeExpenseReportPDF(expenses, financials, businessName, 'Current Fiscal Period', currency);
      },
    },
    {
      title: 'Formal Profit and Loss Statement (P&L) PDF',
      description: 'Certified financial statement separating Gross Revenue, COGS, Gross Margin, and Net Profit.',
      icon: TrendingUp,
      available: !!financials,
      badge: 'Certified P&L Format',
      meta: `Net Profit: ${currency} ${(financials?.netProfit || 0).toLocaleString()}`,
      action: () => {
        if (!financials) return;
        exportProfitLossReportPDF(financials, businessName, 'Current Year to Date', currency);
      },
    },
    {
      title: '90-Day Cash Flow Forecast PDF',
      description: 'Monthly predicted cash inflows, outflows, ending cash balance trajectory, and runway analysis.',
      icon: Banknote,
      available: !!cashFlowReport,
      badge: '90-Day Projection',
      meta: `Predicted Close: ${currency} ${(cashFlowReport?.forecastMonths?.[2]?.closingCashBalance || 0).toLocaleString()}`,
      action: () => {
        if (!cashFlowReport) return alert('Cash flow forecast is still calculating.');
        exportCashFlowForecastPDF(cashFlowReport, businessName, currency);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Document Generation & PDF Exports</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Official Commercial Reports & PDF Downloads
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal, print-ready PDF documents formatted with tables, timestamps, and currency markers.
          </p>
        </div>
      </div>

      {/* Grid of 8 PDF Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportsList.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {rep.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{rep.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {rep.description}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-indigo-300/80 pt-1">
                  {rep.meta}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <button
                  onClick={rep.action}
                  className="w-full py-2 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
