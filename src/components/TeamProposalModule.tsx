import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { exportTeamProposalPDF } from '../utils/pdfGenerator';
import {
  Sparkles,
  Compass,
  Package,
  ShoppingCart,
  TrendingUp,
  Banknote,
  Users,
  ShieldCheck,
  FileDown,
  CheckCircle2,
  Circle,
  ArrowRight,
  Target,
  Layers,
  Code2,
  Database,
  Cpu,
  CheckSquare,
  AlertTriangle,
  Play,
  Share2,
} from 'lucide-react';

interface TeamProposalModuleProps {
  onNavigate: (section: string) => void;
}

export function TeamProposalModule({ onNavigate }: TeamProposalModuleProps) {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState<'proposal' | 'prototype_tour' | 'roadmap' | 'architecture'>('proposal');
  
  // Interactive Checklist for Team Progress
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    'item-1': true,
    'item-2': true,
    'item-3': true,
    'item-4': true,
    'item-5': true,
    'item-6': true,
    'item-7': true,
    'item-8': true,
  });

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const prototypeModules = [
    {
      id: 'planning',
      title: '1. AI Business Planning Wizard',
      tagline: 'Idea to Feasibility Plan',
      desc: 'Input raw business ideas in natural language. Generates startup equipment, budget allocation, break-even models, and risk mitigations.',
      icon: Compass,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Interactive AI',
    },
    {
      id: 'sales',
      title: '2. Real-Time POS Billing & Sales Register',
      tagline: 'Point-of-Sale with Instant Stock Sync',
      desc: 'Record customer sales across Cash, UPI, and Card. Automatically deducts inventory stock and prevents selling out-of-stock items.',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Live Operations',
    },
    {
      id: 'inventory',
      title: '3. Products & Stock Movement Audit',
      tagline: 'SKU, Expiry & Threshold Warnings',
      desc: 'Track units, purchase vs. selling prices, low-stock reorder thresholds, and FIFO expiry tracking for retail and food businesses.',
      icon: Package,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Real Persistence',
    },
    {
      id: 'discovery',
      title: '4. Curated Trade Supplier Directory',
      tagline: 'Verified B2B Vendors & Restock Requests',
      desc: 'Browse verified wholesalers (Dairy, Flour, Packaging, Apparel) with MOQs, direct calling, and restock order drafting.',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      badge: 'Verified Data',
    },
    {
      id: 'pnl',
      title: '5. Managerial Profit & Loss (P&L)',
      tagline: 'True Net Profit & Margin Analysis',
      desc: 'Automatically correlates Revenue with Cost of Goods Sold (COGS) and Operating Expenses (rent, salaries, utilities).',
      icon: TrendingUp,
      color: 'from-violet-500 to-indigo-600',
      badge: 'Accounting Engine',
    },
    {
      id: 'cashflow',
      title: '6. 90-Day Predictive Cash Flow Forecast',
      tagline: '3-Month Forward Liquidity Model',
      desc: 'Predicts future bank balance trends based on historical inflows and outflows across Expected, Conservative, and Aggressive scenarios.',
      icon: Banknote,
      color: 'from-pink-500 to-rose-600',
      badge: 'Forward Modeling',
    },
    {
      id: 'insights',
      title: '7. Data-Grounded AI Insights',
      tagline: 'Audited Operational Recommendations',
      desc: 'Analyzes live ledger data to spot bestsellers, low-stock risks, and margin leaks. Halts when data is insufficient to prevent false claims.',
      icon: Sparkles,
      color: 'from-amber-400 to-yellow-600',
      badge: 'Gemini 3.8-Flash',
    },
    {
      id: 'reports',
      title: '8. Professional PDF Export Suite',
      tagline: '8 Downloadable Official Reports',
      desc: 'One-click client-side PDF downloads for Business Plan, Budget, Supplier Comparison, Inventory, Sales, Purchases, P&L, and Cash Flow.',
      icon: FileDown,
      color: 'from-slate-600 to-slate-800',
      badge: 'jsPDF Engine',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Project Alignment & Live Prototype Showcase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Brief2Build AI: Proposal & Prototype Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Everything your team, mentors, and evaluators need to understand the vision, scope boundaries, technical architecture, and test every feature in the working prototype.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportTeamProposalPDF(business?.name || 'Brief2Build AI')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Proposal PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('prototype_tour')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Explore Prototype</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800/80">
          {[
            { id: 'proposal', label: '1-Page Alignment Proposal', icon: Target },
            { id: 'prototype_tour', label: 'Interactive Prototype Tour', icon: Play },
            { id: 'architecture', label: 'Tech Stack & Flowchart', icon: Layers },
            { id: 'roadmap', label: 'Milestones & Definition of Done', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: 1-PAGE PROPOSAL */}
      {activeTab === 'proposal' && (
        <div className="space-y-6">
          {/* North Star Callout */}
          <div className="p-6 rounded-2xl bg-indigo-900/20 border border-indigo-500/30 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400">The North Star Vision</span>
              <p className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                "Eliminate the gap between business planning and business execution by replacing fragmented spreadsheets and guesswork with a single AI-guided operations platform."
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Tagline: <strong className="text-slate-200">From Business Idea to Business Growth</strong> • Primary Beneficiaries: New Entrepreneurs & Small-to-Medium Business Owners.
              </p>
            </div>
          </div>

          {/* Scope Boundaries: IN vs OUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>IN SCOPE (Core Commitments)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span><strong>AI Feasibility Planning:</strong> Natural-language prompt parsing into structured equipment, OPEX, CAPEX, and break-even models.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span><strong>Verified Supplier Discovery:</strong> Curated B2B trade supplier directory, MOQs, contact cards, and restock order drafting.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span><strong>Real POS Billing & Inventory:</strong> Live point-of-sale checkout, inventory decrement, overselling safeguards, and expiry alerts.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span><strong>Managerial P&L & 90-Day Cash Flow:</strong> Live COGS, gross margin, operating overhead, and 3-month predictive cash dips.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>OUT OF SCOPE (Strict Non-Goals)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span><strong>No Website Creation or Hosting:</strong> We do not build websites, edit landing pages, or redirect users to external site builders.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span><strong>No Speculative Hallucinations:</strong> AI never guarantees sales or creates fake phone numbers or addresses.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span><strong>No Mock-Only Screens:</strong> All dashboards must read and write from persistent database storage (`data/db.json`).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span><strong>No Generic Chatbots:</strong> AI is purposefully integrated as a specialized financial and operational analyst.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Team Roles Matrix */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Team Roles & Deliverables Matrix</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  role: 'Frontend & UX Lead',
                  stack: 'React 19, Tailwind v4, Motion',
                  duties: 'POS Checkout, Stepper Wizard, Reports, Dark UI',
                  deliverable: 'Responsive client & PDF reports',
                },
                {
                  role: 'Backend & Data Lead',
                  stack: 'Node.js, Express, Atomic DB',
                  duties: 'Session auth, REST API, Safe stock logic, P&L queries',
                  deliverable: 'Stable API & persistent ledger',
                },
                {
                  role: 'AI & Financial Modeler',
                  stack: 'Gemini SDK, Cash Flow Math',
                  duties: 'Prompt schemas, 90-day cash forecasting, Break-even model',
                  deliverable: 'Grounded insights & forecasting',
                },
                {
                  role: 'QA & Product Analyst',
                  stack: 'End-to-End Scenarios',
                  duties: 'Bakery & Retail workflows, Zero-stock tests, Edge cases',
                  deliverable: 'Bug-free, production-ready app',
                },
              ].map((member, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{member.role}</span>
                  <p className="text-xs font-semibold text-white">{member.stack}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">{member.duties}</p>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-emerald-400 font-mono">Deliverable: {member.deliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PROTOTYPE TOUR */}
      {activeTab === 'prototype_tour' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live Prototype Capabilities</h2>
              <p className="text-xs text-slate-400">Click any module below to immediately launch and test the running feature.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              8 of 8 Modules Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {prototypeModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] font-medium text-indigo-400/90 mt-0.5">
                        {mod.tagline}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(mod.id)}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & FLOWCHART */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Full-Stack Prototype Architecture</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                  <Code2 className="w-4 h-4" />
                  <span>CLIENT LAYER (React 19 SPA)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Single-page React application powered by Vite 8 and Tailwind CSS v4. Manages POS cart state, guided wizard steps, and executes client-side PDF compilation via jsPDF without server rendering latency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>SERVER & AI LAYER (Node/Express)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Express 4 engine on port 3000 running via TSX. Handles salted cryptographic token authentication, inventory decrement validation, and acts as a secure server-side proxy to Google's Gemini 3.8-Flash model.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <span>PERSISTENCE LAYER (Atomic DB)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Synchronous atomic JSON database (`data/db.json`) supporting multi-tenant user isolation. Maintains live records for users, businesses, inventory, sales, purchases, expenses, and notifications.
                </p>
              </div>
            </div>

            {/* End-to-End Workflow Diagram */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Information Flow</span>
              <div className="mt-3 flex flex-col md:flex-row items-center justify-between text-xs text-slate-300 gap-3">
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/40 text-center w-full md:w-auto">
                  1. Entrepreneur Idea
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 hidden md:block" />
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/40 text-center w-full md:w-auto">
                  2. Gemini Plan & Sourcing
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 hidden md:block" />
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/40 text-center w-full md:w-auto">
                  3. POS Sales & PO Purchases
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 hidden md:block" />
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/40 text-center w-full md:w-auto">
                  4. Live Inventory & P&L
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 hidden md:block" />
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/40 text-center w-full md:w-auto">
                  5. 90-Day Cash Forecast
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROADMAP & DEFINITION OF DONE */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Interactive Sprint & Milestone Checklist</h2>
                <p className="text-xs text-slate-400">Click checkboxes to verify deliverables completed by your team.</p>
              </div>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {Object.values(completedItems).filter(Boolean).length} / 8 Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'item-1', label: 'Token-based session authentication with crypto password hashing & demo accounts', phase: 'Phase 1' },
                { id: 'item-2', label: 'Guided Business Plan Wizard with equipment budget breakdown and break-even math', phase: 'Phase 1' },
                { id: 'item-3', label: 'Curated trade supplier discovery with side-by-side comparison & MOQ verification', phase: 'Phase 1' },
                { id: 'item-4', label: 'Point-of-Sale (POS) billing with real-time stock deductions and oversell safeguards', phase: 'Phase 2' },
                { id: 'item-5', label: 'Inventory management with low-stock alerts, batch numbers, and expiry tracking', phase: 'Phase 2' },
                { id: 'item-6', label: 'Automated Managerial P&L engine: Revenue, COGS, Gross Margin, and Net Profit', phase: 'Phase 2' },
                { id: 'item-7', label: '90-Day Cash Flow Forecasting tool with Expected, Conservative, and Aggressive models', phase: 'Phase 3' },
                { id: 'item-8', label: 'Export suite with 8 official downloadable PDF documents via jsPDF & jspdf-autotable', phase: 'Phase 4' },
              ].map((item) => {
                const checked = completedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      checked
                        ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className={`text-xs ${checked ? 'text-white' : 'line-through text-slate-500'}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">
                      {item.phase}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
