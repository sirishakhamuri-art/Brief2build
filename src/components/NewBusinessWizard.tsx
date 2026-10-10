import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { BusinessPlan } from '../types';
import { exportBusinessPlanPDF, exportStartupBudgetPDF } from '../utils/pdfGenerator';
import {
  Sparkles,
  Download,
  Save,
  RefreshCw,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  HelpCircle,
  Building,
  Target,
  Wrench,
  Check,
} from 'lucide-react';

interface NewBusinessWizardProps {
  onPlanFinished: () => void;
  onNavigateToSuppliers: () => void;
}

export const NewBusinessWizard: React.FC<NewBusinessWizardProps> = ({ onPlanFinished, onNavigateToSuppliers }) => {
  const { business, updateBusiness, formatCurrency, currency } = useAuth();

  // Wizard input state
  const [proposedName, setProposedName] = useState(business?.name || '');
  const [category, setCategory] = useState(business?.category || 'bakery_restaurant');
  const [description, setDescription] = useState(business?.description || '');
  const [location, setLocation] = useState(business?.location || '');
  const [productsOrServices, setProductsOrServices] = useState('');
  const [startingBudget, setStartingBudget] = useState<number>(business?.startingBudget || 500000);
  const [targetCustomers, setTargetCustomers] = useState(business?.targetCustomers || '');
  const [preferredSize, setPreferredSize] = useState(business?.preferredSize || 'Boutique Storefront');
  const [equipmentNeeded, setEquipmentNeeded] = useState(business?.equipmentNeeded || '');
  const [expectedLaunchDate, setExpectedLaunchDate] = useState(business?.expectedLaunchDate || '');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [naturalLanguageBrief, setNaturalLanguageBrief] = useState('');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<BusinessPlan | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Follow-up answer state
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<number, string>>({});

  // Active view tab in wizard
  const [activeTab, setActiveTab] = useState<'input' | 'plan' | 'financials' | 'timeline'>('input');

  // Load existing plan if previously saved
  useEffect(() => {
    const fetchExistingPlan = async () => {
      try {
        const existing = await api.get<BusinessPlan | null>('/api/business-plan');
        if (existing) {
          setGeneratedPlan(existing);
          if (existing.summary) {
            setActiveTab('plan');
          }
        }
      } catch (err) {
        console.error('Could not load plan', err);
      }
    };
    fetchExistingPlan();
  }, []);

  const handleGeneratePlan = async () => {
    if (!proposedName.trim()) {
      setError('Please provide a proposed business name.');
      return;
    }
    if (!description.trim() && !naturalLanguageBrief.trim()) {
      setError('Please provide a brief or description of your business idea.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setAiNote(null);

    // Merge natural brief with description if provided
    const mergedDescription = naturalLanguageBrief.trim()
      ? `${description ? description + '\n' : ''}Natural Language Brief: ${naturalLanguageBrief}`
      : description;

    try {
      const payload = {
        proposedName,
        category,
        description: mergedDescription,
        location: location || 'Urban City, India',
        productsOrServices,
        startingBudget,
        targetCustomers,
        preferredSize,
        equipmentNeeded,
        expectedLaunchDate,
        additionalRequirements,
      };

      const result = await api.post('/api/ai/business-plan', payload);

      if (!result.isAIAvailable && result.message) {
        setAiNote(result.message);
      }

      setGeneratedPlan(result.plan);
      setActiveTab('plan');

      // Auto update business profile
      await updateBusiness({
        name: proposedName,
        category: category as any,
        description: mergedDescription,
        location,
        startingBudget,
        targetCustomers,
        preferredSize,
        equipmentNeeded,
        expectedLaunchDate,
        status: 'planning',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const saved = await api.post<BusinessPlan>('/api/business-plan', generatedPlan);
      setGeneratedPlan(saved);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedPlan) return;
    exportBusinessPlanPDF(generatedPlan, proposedName || business?.name || 'My_Business', currency);
  };

  const handleExportBudgetPDF = () => {
    if (!generatedPlan) return;
    exportStartupBudgetPDF(generatedPlan, proposedName || business?.name || 'My_Business', currency);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>New Business Planning Module</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            AI Guided Business Planning & Feasibility Wizard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formulate your business strategy, budget projections, break-even unit metrics, and capital allocation before committing real funds.
          </p>
        </div>

        {generatedPlan && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved' : isSaving ? 'Saving...' : 'Save Plan'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Plan PDF</span>
            </button>
            <button
              onClick={handleExportBudgetPDF}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Budget PDF</span>
            </button>
          </div>
        )}
      </div>

      {aiNote && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice: </span>
            {aiNote}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'input'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          1. Business Brief & Inputs
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          disabled={!generatedPlan}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-indigo-600 text-white'
              : !generatedPlan
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          2. Executive Plan & Strategy
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          disabled={!generatedPlan}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'financials'
              ? 'bg-indigo-600 text-white'
              : !generatedPlan
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          3. Budget & Break-Even Modeling
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          disabled={!generatedPlan}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-indigo-600 text-white'
              : !generatedPlan
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          4. Launch Milestones & Risks
        </button>
      </div>

      {/* Tab 1: Inputs & Natural Language Brief */}
      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Core Business Parameters</span>
            </h3>

            {/* Natural language idea prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Natural Language Business Brief (Describe your idea in plain English)</span>
                <span className="text-[11px] text-indigo-400 font-normal">AI-Powered Synthesis</span>
              </label>
              <textarea
                rows={3}
                value={naturalLanguageBrief}
                onChange={(e) => setNaturalLanguageBrief(e.target.value)}
                placeholder="e.g. I want to open an artisanal sourdough bakery in Koramangala, Bengaluru with organic flours, French butter croissants, and a small 12-seat coffee bar. I have ₹15 Lakhs capital and want to launch in 4 months."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proposed Business Name *</label>
                <input
                  type="text"
                  required
                  value={proposedName}
                  onChange={(e) => setProposedName(e.target.value)}
                  placeholder="e.g. Flourish Bakery & Cafe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="bakery_restaurant">Bakery, Cafe & Foodservice</option>
                  <option value="clothing">Apparel, Boutique & Textiles</option>
                  <option value="grocery">Grocery & Supermarket</option>
                  <option value="electronics">Retail Hardware & Electronics</option>
                  <option value="services">Professional & Commercial Services</option>
                  <option value="manufacturing">Small Manufacturing & Workshop</option>
                  <option value="other">Other Business Enterprise</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Planned Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Koramangala 4th Block, Bengaluru, KA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Available Starting Capital ({currency}) *</label>
                <input
                  type="number"
                  value={startingBudget}
                  onChange={(e) => setStartingBudget(Number(e.target.value))}
                  placeholder="500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Products or Services</label>
                <input
                  type="text"
                  value={productsOrServices}
                  onChange={(e) => setProductsOrServices(e.target.value)}
                  placeholder="e.g. Sourdough bread, croissants, celebration cakes, espresso"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Customer Profile</label>
                <input
                  type="text"
                  value={targetCustomers}
                  onChange={(e) => setTargetCustomers(e.target.value)}
                  placeholder="e.g. Young professionals, families, cafe regulars"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Size / Scale</label>
                <input
                  type="text"
                  value={preferredSize}
                  onChange={(e) => setPreferredSize(e.target.value)}
                  placeholder="e.g. 500 sq ft boutique"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Launch Date</label>
                <input
                  type="date"
                  value={expectedLaunchDate}
                  onChange={(e) => setExpectedLaunchDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Required Equipment</label>
                <input
                  type="text"
                  value={equipmentNeeded}
                  onChange={(e) => setEquipmentNeeded(e.target.value)}
                  placeholder="e.g. Deck oven, spiral mixer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Feasibility Model via Gemini 3.8 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Structured Business Plan & Projections</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Guidance Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Next Step in Workflow</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once generated, your business plan models startup capital, operating expenses, and monthly break-even metrics.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                <button
                  onClick={onNavigateToSuppliers}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                >
                  <span>Explore Verified Suppliers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={onPlanFinished}
                  className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                >
                  <span>Begin Managing Live Operations</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">Accounting Integrity Guarantee</p>
              <p>• Projections are clearly designated as estimates.</p>
              <p>• Operating expenses do not double-count inventory purchases.</p>
              <p>• Real downloadable PDF generation available at any stage.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Executive Plan & Strategy */}
      {activeTab === 'plan' && generatedPlan && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Summary Card */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>1. Executive Summary & Value Proposition</span>
            </h3>
            <textarea
              rows={4}
              value={generatedPlan.summary}
              onChange={(e) =>
                setGeneratedPlan({ ...generatedPlan, summary: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Target Market */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>2. Target Market Analysis & Demographics</span>
            </h3>
            <textarea
              rows={3}
              value={generatedPlan.targetMarket}
              onChange={(e) =>
                setGeneratedPlan({ ...generatedPlan, targetMarket: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Required Equipment */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span>3. Required Equipment & Operational Assets</span>
              </h3>
              <span className="text-xs text-slate-400">
                Total Asset Outlay: {formatCurrency((generatedPlan.requiredEquipment || []).reduce((acc, e) => acc + e.estimatedCost, 0))}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Equipment / Asset</th>
                    <th className="py-2 px-3">Operational Purpose</th>
                    <th className="py-2 px-3 text-right">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {(generatedPlan.requiredEquipment || []).map((eq, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">{eq.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{eq.purpose}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-300">{formatCurrency(eq.estimatedCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Follow-up Questions from AI */}
          {generatedPlan.followUpQuestions && generatedPlan.followUpQuestions.length > 0 && (
            <div className="bg-indigo-950/30 p-6 rounded-2xl border border-indigo-900/50 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>AI Follow-Up Inquiries to Sharpen Strategy</span>
              </div>
              <div className="space-y-3">
                {generatedPlan.followUpQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <p className="text-xs font-semibold text-white mb-2">{q}</p>
                    <input
                      type="text"
                      placeholder="Your thoughts or response..."
                      value={followUpAnswers[idx] || ''}
                      onChange={(e) =>
                        setFollowUpAnswers({ ...followUpAnswers, [idx]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Budget & Break-Even Modeling */}
      {activeTab === 'financials' && generatedPlan && (
        <div className="space-y-6 animate-fade-in">
          {/* Projections Card */}
          {generatedPlan.salesAndBreakEvenEstimates && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-indigo-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                    Modeled Feasibility
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Sales Projections & Break-Even Analysis
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Monthly Break-Even Target</span>
                  <p className="text-xl font-extrabold text-amber-400 font-mono">
                    {formatCurrency(generatedPlan.salesAndBreakEvenEstimates.breakEvenMonthlyRevenue)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Monthly Unit Volume</span>
                  <p className="text-lg font-bold text-white font-mono mt-1">
                    {generatedPlan.salesAndBreakEvenEstimates.estimatedMonthlySalesUnits} units
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Avg Selling Price</span>
                  <p className="text-lg font-bold text-white font-mono mt-1">
                    {formatCurrency(generatedPlan.salesAndBreakEvenEstimates.averageUnitPrice)}
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Est. Monthly Revenue</span>
                  <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    {formatCurrency(generatedPlan.salesAndBreakEvenEstimates.estimatedMonthlyRevenue)}
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Break-Even Units</span>
                  <p className="text-lg font-bold text-amber-400 font-mono mt-1">
                    {generatedPlan.salesAndBreakEvenEstimates.breakEvenMonthlyUnits} units
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p>
                  <strong className="text-slate-300">Underlying Assumptions: </strong>
                  {generatedPlan.salesAndBreakEvenEstimates.assumptions}
                </p>
                <p>
                  <strong className="text-slate-300">Disclaimer: </strong>
                  {generatedPlan.salesAndBreakEvenEstimates.disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* Budget Allocation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Capital Budget Allocation</span>
              </h4>
              <div className="space-y-3">
                {(generatedPlan.budgetAllocation || []).map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{b.category}</span>
                      <span className="text-indigo-300 font-mono font-semibold">
                        {b.percentage}% ({formatCurrency(b.amount)})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Operating Expenses */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Estimated Monthly Overhead</span>
                </h4>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {formatCurrency((generatedPlan.monthlyOperatingExpenses || []).reduce((acc, m) => acc + m.cost, 0))}/mo
                </span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {(generatedPlan.monthlyOperatingExpenses || []).map((m, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{m.item}</p>
                      <span className="text-[10px] text-slate-500">{m.category}</span>
                    </div>
                    <span className="font-mono text-slate-300">{formatCurrency(m.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Launch Milestones & Risks */}
      {activeTab === 'timeline' && generatedPlan && (
        <div className="space-y-6 animate-fade-in">
          {/* Launch Timeline */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Suggested Launch Roadmap</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(generatedPlan.launchTimeline || []).map((phase, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    {phase.timeframe}
                  </span>
                  <h4 className="font-bold text-sm text-white">{phase.phase}</h4>
                  <ul className="space-y-1.5 pt-2 text-xs text-slate-400">
                    {phase.milestones.map((m, mIdx) => (
                      <li key={mIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Recommendations */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Potential Operational Risks & Practical Mitigation</span>
            </h3>

            <div className="space-y-3">
              {(generatedPlan.risksAndRecommendations || []).map((r, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="text-xs font-bold text-amber-300">Risk: {r.risk}</p>
                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-400">Recommendation: </strong>
                    {r.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-white">Ready to Execute?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Save this plan to your account and proceed to source trade equipment or configure live stock.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onNavigateToSuppliers}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <span>Discover Verified Suppliers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onPlanFinished}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <span>Open Management Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
