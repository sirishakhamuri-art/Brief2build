import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AIInsightResult {
  isAIAvailable: boolean;
  hasSufficientData: boolean;
  summary: string;
  recommendation: string;
  insights: Array<{
    type: 'best_seller' | 'inventory_risk' | 'expense_optimization' | 'margin_growth' | 'status';
    title: string;
    metric?: string;
    description: string;
  }>;
}

export const AIBusinessInsights: React.FC = () => {
  const { business } = useAuth();
  const [data, setData] = useState<AIInsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AIInsightResult>('/api/ai/insights');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize business insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [business?.id]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Operations & Growth Analyst</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Data-Driven Commercial Insights & Margin Optimization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Directly generated from your actual stored sales ledger, stock velocities, and operational expenses.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing...' : 'Refresh Insights'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs">Analyzing historical transactions and calculating margins via Gemini...</p>
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Executive Synthesis</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {data.summary}
            </p>

            {data.recommendation && (
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Top Strategic Priority
                </span>
                <p className="text-xs font-semibold text-white">
                  {data.recommendation}
                </p>
              </div>
            )}
          </div>

          {/* If insufficient data notice */}
          {!data.hasSufficientData && (
            <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs text-amber-300">
              <div className="flex items-center space-x-2 font-bold">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Honest Data Integrity Policy</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Brief2Build AI never fabricates or hallucinates fictional trends. As you record everyday sales, purchases, and operating expenses, this dashboard will continuously update with velocity metrics, dead-stock warnings, and pricing opportunities.
              </p>
            </div>
          )}

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.insights || []).map((item, idx) => {
              let Icon = Sparkles;
              let badgeColor = 'text-indigo-400 bg-indigo-950 border-indigo-800';

              if (item.type === 'best_seller') {
                Icon = TrendingUp;
                badgeColor = 'text-emerald-400 bg-emerald-950 border-emerald-800';
              } else if (item.type === 'inventory_risk') {
                Icon = AlertTriangle;
                badgeColor = 'text-amber-400 bg-amber-950 border-amber-800';
              } else if (item.type === 'expense_optimization') {
                Icon = Layers;
                badgeColor = 'text-rose-400 bg-rose-950 border-rose-800';
              }

              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>

                  {item.metric && (
                    <div className="text-xs font-mono font-bold text-indigo-300">
                      {item.metric}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
