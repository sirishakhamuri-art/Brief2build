import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { CashFlowForecastReport, CashFlowMonthForecast } from '../types';
import { exportCashFlowForecastPDF } from '../utils/pdfGenerator';
import {
  TrendingUp,
  Download,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Edit2,
  Check,
  X,
  Info,
  Clock,
} from 'lucide-react';

export const CashFlowForecastModule: React.FC = () => {
  const { business, formatCurrency, currency, refreshBusiness } = useAuth();
  const [data, setData] = useState<CashFlowForecastReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<'expected' | 'conservative' | 'aggressive'>('expected');

  // AI Narrative state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Edit Opening Cash Balance State
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [customCashBalance, setCustomCashBalance] = useState<number>(0);
  const [savingCash, setSavingCash] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await api.get<CashFlowForecastReport>('/api/cash-flow/forecast');
      setData(res);
      setCustomCashBalance(res.currentCashBalance);

      // Trigger AI narrative
      triggerAiAnalysis();
    } catch (err) {
      console.error('Failed to load cash flow forecast', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAiAnalysis = async () => {
    setLoadingAI(true);
    try {
      const aiRes = await api.post('/api/cash-flow/forecast/ai');
      setAiAnalysis(aiRes);
    } catch (err) {
      console.error('Failed to fetch AI cash flow analysis', err);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [business?.id]);

  const handleSaveStartingCash = async () => {
    setSavingCash(true);
    try {
      await api.put('/api/cash-flow/starting-balance', {
        startingCashBalance: customCashBalance,
      });
      await refreshBusiness();
      setIsEditingCash(false);
      fetchForecast();
    } catch (err: any) {
      alert(err.message || 'Failed to update cash balance');
    } finally {
      setSavingCash(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        <p>Synthesizing 90-day cash flow projections from historical ledgers...</p>
      </div>
    );
  }

  // Active scenario forecast list
  const activeForecastMonths: CashFlowMonthForecast[] = data.scenarios[activeScenario] || data.forecastMonths;

  // Chart data: 3 historical + 3 forecast months
  const chartHistorical = data.historicalMonths.map((h, i) => ({
    label: h.month,
    inflow: h.revenue,
    outflow: h.expenses + h.cogs,
    net: h.netCash,
    isForecast: false,
  }));

  const chartForecast = activeForecastMonths.map((f) => ({
    label: f.monthLabel,
    inflow: f.projectedRevenue,
    outflow: f.projectedCOGS + f.projectedOperatingExpenses,
    net: f.netCashFlow,
    isForecast: true,
  }));

  const combinedChartMonths = [...chartHistorical, ...chartForecast];
  const maxFlow = Math.max(
    ...combinedChartMonths.map((m) => Math.max(m.inflow, m.outflow, Math.abs(m.net), 1000))
  );

  const endingCashBalance = activeForecastMonths[2]?.closingCashBalance || 0;
  const net3MonthChange = endingCashBalance - data.currentCashBalance;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Working Capital & Liquidity Forecasting</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            90-Day Rolling Cash Flow Forecast
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Predict cash inflows, operational disbursements, and ending bank balance trends for the next 3 months.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportCashFlowForecastPDF(data, business?.name || 'My_Business', currency)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forecast PDF</span>
          </button>
          <button
            onClick={fetchForecast}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Recalculate with fresh transactions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Opening Liquid Cash Reserve Bar */}
      <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Available Liquid Cash Reserve
            </span>
            {isEditingCash ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="number"
                  value={customCashBalance}
                  onChange={(e) => setCustomCashBalance(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 w-36"
                />
                <button
                  onClick={handleSaveStartingCash}
                  disabled={savingCash}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingCash(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xl font-extrabold text-white font-mono">
                  {formatCurrency(data.currentCashBalance)}
                </span>
                <button
                  onClick={() => setIsEditingCash(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 ml-2 cursor-pointer"
                  title="Adjust actual opening bank balance"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Adjust Balance</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500 block text-[10px]">Predicted Month 3 Close</span>
            <span className={`font-mono font-bold ${endingCashBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(endingCashBalance)}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500 block text-[10px]">90-Day Net Cash Flow</span>
            <span className={`font-mono font-bold flex items-center space-x-0.5 ${net3MonthChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {net3MonthChange >= 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
              <span>{formatCurrency(net3MonthChange)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Financial Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Runway */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Estimated Cash Runway</span>
          <p className="text-2xl font-extrabold text-white font-mono">
            {data.metrics.projectedRunwayMonths === 99
              ? 'Cash Positive'
              : `${data.metrics.projectedRunwayMonths} Mo.`}
          </p>
          <span className="text-[10px] text-slate-500 block">
            {data.metrics.averageMonthlyBurnRate > 0
              ? `Burn rate: ${formatCurrency(data.metrics.averageMonthlyBurnRate)}/mo`
              : 'Revenues cover operational disbursements'}
          </span>
        </div>

        {/* Metric 2: Lowest Balance Dip */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Lowest Projected Cash Dip</span>
          <p className={`text-2xl font-extrabold font-mono ${data.metrics.lowestProjectedBalance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {formatCurrency(data.metrics.lowestProjectedBalance)}
          </p>
          <span className="text-[10px] text-slate-500 block">
            Lowest balance over the next 90 days
          </span>
        </div>

        {/* Metric 3: Recommended Safety Buffer */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Recommended Reserve Buffer</span>
          <p className="text-2xl font-extrabold text-indigo-300 font-mono">
            {formatCurrency(data.metrics.safetyBufferNeeded)}
          </p>
          <span className="text-[10px] text-slate-500 block">
            Equivalent to 2 months fixed operating overhead
          </span>
        </div>

        {/* Metric 4: Health Status */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Liquidity Status Classification</span>
          <div className="pt-1">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              data.metrics.surplusOrDeficit === 'surplus'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                : data.metrics.surplusOrDeficit === 'deficit'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
            }`}>
              {data.metrics.surplusOrDeficit === 'deficit' ? 'Cash Deficit Risk' : data.metrics.surplusOrDeficit === 'surplus' ? 'Strong Surplus' : 'Stable Working Capital'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Stress outcome across forward quarters
          </span>
        </div>
      </div>

      {/* Trajectory Chart & Scenario Switcher */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">6-Month Liquidity Trajectory (Historical Actuals vs 3-Month Predictions)</h3>
            <p className="text-[11px] text-slate-400">Solid bars represent verified historical months; striped/glowing bars represent forward modeled projections.</p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveScenario('conservative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeScenario === 'conservative'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Conservative (-15%)
            </button>
            <button
              onClick={() => setActiveScenario('expected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeScenario === 'expected'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expected (Baseline)
            </button>
            <button
              onClick={() => setActiveScenario('aggressive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeScenario === 'aggressive'
                  ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aggressive (+20%)
            </button>
          </div>
        </div>

        {/* SVG Responsive Trajectory Chart */}
        <div className="h-56 w-full flex items-end justify-between pt-6 px-2 gap-3 border-b border-slate-800">
          {combinedChartMonths.map((m, idx) => {
            const inHeight = maxFlow > 0 ? Math.min(100, Math.round((m.inflow / maxFlow) * 100)) : 4;
            const outHeight = maxFlow > 0 ? Math.min(100, Math.round((m.outflow / maxFlow) * 100)) : 4;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center space-x-1 h-40">
                  {/* Inflow bar */}
                  <div
                    className={`w-1/2 max-w-[22px] rounded-t transition-all duration-300 relative ${
                      m.isForecast
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 ring-1 ring-indigo-400/50'
                        : 'bg-indigo-700 hover:bg-indigo-600'
                    }`}
                    style={{ height: `${Math.max(inHeight, 4)}%` }}
                    title={`${m.label} Inflow: ${formatCurrency(m.inflow)}`}
                  />
                  {/* Outflow bar */}
                  <div
                    className={`w-1/2 max-w-[22px] rounded-t transition-all duration-300 relative ${
                      m.isForecast
                        ? 'bg-gradient-to-t from-rose-700 to-rose-500 ring-1 ring-rose-400/50'
                        : 'bg-rose-800 hover:bg-rose-700'
                    }`}
                    style={{ height: `${Math.max(outHeight, 4)}%` }}
                    title={`${m.label} Outflow: ${formatCurrency(m.outflow)}`}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className={`text-[10px] font-mono block ${m.isForecast ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                    {m.label}
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    {m.isForecast ? 'Forecast' : 'Actual'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
              <span>Projected / Actual Cash Inflows (Sales)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
              <span>Cash Outflows (COGS & Overhead)</span>
            </span>
          </div>
          <span>Mode: <strong className="text-white capitalize">{activeScenario} Scenario</strong></span>
        </div>
      </div>

      {/* Detailed Monthly Cash Flow Statement Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">3-Month Forward Cash Statement Ledger ({activeScenario.toUpperCase()})</h3>
          <span className="text-xs text-slate-400 font-mono">Currency: {currency}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-3 px-4 font-semibold">Forecast Period</th>
                <th className="py-3 px-4 font-semibold text-right">Opening Cash</th>
                <th className="py-3 px-4 font-semibold text-right">Projected Inflows</th>
                <th className="py-3 px-4 font-semibold text-right">Stock Outflows (COGS)</th>
                <th className="py-3 px-4 font-semibold text-right">Fixed Overhead (Rent/Staff)</th>
                <th className="py-3 px-4 font-semibold text-right">Variable Overhead</th>
                <th className="py-3 px-4 font-semibold text-right">Net Monthly Flow</th>
                <th className="py-3 px-4 font-semibold text-right">Closing Cash Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activeForecastMonths.map((m) => (
                <tr key={m.monthIndex} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-white">
                    Month +{m.monthIndex} ({m.monthLabel})
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(m.openingCashBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                    +{formatCurrency(m.projectedRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    -{formatCurrency(m.projectedCOGS)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    -{formatCurrency(m.breakdown.fixedExpenses)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    -{formatCurrency(m.breakdown.variableExpenses)}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${m.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.netCashFlow >= 0 ? `+${formatCurrency(m.netCashFlow)}` : formatCurrency(m.netCashFlow)}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-extrabold text-sm ${m.closingCashBalance >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                    {formatCurrency(m.closingCashBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Cash Advisory & Strategic Risk Mitigation */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Chief Financial Officer Strategy Synthesis</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              aiAnalysis.riskLevel === 'high' || aiAnalysis.riskLevel === 'critical'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : aiAnalysis.riskLevel === 'moderate'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {aiAnalysis.riskLevel} Risk Profile
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {aiAnalysis.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Key Alerts */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Liquidity Alerts & Timing Risks</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(aiAnalysis.keyAlerts || []).map((alert: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Action Items */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Working Capital Action Items</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(aiAnalysis.actionItems || []).map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
