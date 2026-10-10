import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Store,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Package,
  FileText,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';

interface WelcomeLandingProps {
  onSelectFlow: (flow: 'new' | 'existing') => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({ onSelectFlow }) => {
  const { login, register } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [targetFlow, setTargetFlow] = useState<'new' | 'existing'>('new');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register', flow: 'new' | 'existing') => {
    setAuthMode(mode);
    setTargetFlow(flow);
    setError('');
    setSuccessMsg('');
    setAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else if (authMode === 'register') {
        await register(name, email, password, {
          status: targetFlow === 'new' ? 'planning' : 'existing',
        });
        onSelectFlow(targetFlow);
      } else if (authMode === 'forgot') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Password reset failed');
        setSuccessMsg('Password updated successfully. Please log in with your new password.');
        setAuthMode('login');
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = async () => {
    setEmail('owner@brief2build.example.com');
    setPassword('DemoPassword123!');
    setAuthMode('login');
    setError('');
    setLoading(true);
    try {
      await login('owner@brief2build.example.com', 'DemoPassword123!');
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to login with demo credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-1">
                <span>Brief2Build</span>
                <span className="text-indigo-400">AI</span>
              </div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                From Business Idea to Business Growth
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleOpenAuth('login', 'existing')}
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition hover:bg-slate-800/60 rounded-lg cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleOpenAuth('register', 'new')}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition rounded-lg shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Unified Planning & Operations Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-center max-w-4xl leading-tight">
          Turn your business brief into a thriving,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
            revenue-generating enterprise.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 text-center max-w-2xl leading-relaxed">
          From concept feasibility, budget modeling, and verified supplier sourcing to real-time inventory, daily sales ledger, and P&L accounting.
        </p>

        {/* Two Core Options */}
        <div className="mt-14 w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          {/* Card 1: New Business Owner */}
          <div
            onClick={() => handleOpenAuth('register', 'new')}
            className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/80 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition text-indigo-400">
              <Compass className="w-24 h-24" />
            </div>

            <div>
              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition">
                <Compass className="w-7 h-7" />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800/60 mb-3">
                Option 1 • Starting Up
              </div>

              <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition">
                I am a New Business Owner
              </h2>

              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                I have a business idea or brief. Guide me through capital estimation, AI feasibility analysis, verified trade suppliers, and a step-by-step launch roadmap.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Structured Business Plan & Capital Allocation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Supplier Discovery & Material Sourcing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sales & Break-Even Modeling with PDF Export</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-indigo-400 font-semibold text-sm group-hover:text-indigo-300">
              <span>Launch Planning Wizard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Existing Business */}
          <div
            onClick={() => handleOpenAuth('register', 'existing')}
            className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/80 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition text-amber-400">
              <Store className="w-24 h-24" />
            </div>

            <div>
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-105 transition">
                <Store className="w-7 h-7" />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800/60 mb-3">
                Option 2 • Already Operating
              </div>

              <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition">
                I Own an Existing Business
              </h2>

              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                I already operate a shop, bakery, boutique, or enterprise. Let me input my products, current inventory, suppliers, and start managing daily transactions immediately.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Configured by Business Type (Bakery, Clothing, Grocery)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Real-time POS Sales, Purchases & Auto Stock Deduction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Authentic P&L (COGS, Gross Margin & Monthly Net Profit)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-amber-400 font-semibold text-sm group-hover:text-amber-300">
              <span>Open Operations Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Demo Fast Track Callout */}
        <div className="mt-12 p-4 rounded-xl bg-slate-900/90 border border-slate-800 max-w-xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Want to test with active business data?</p>
              <p className="text-xs text-slate-400">Preloaded with Flourish Bakery, sales, stock & suppliers</p>
            </div>
          </div>
          <button
            onClick={handleFillDemo}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-md shadow-emerald-900/40"
          >
            Launch Demo Account
          </button>
        </div>

        {/* Feature Grid Highlights */}
        <div className="mt-20 w-full max-w-5xl">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-white">Engineered for Pragmatic Commercial Execution</h3>
            <p className="text-xs text-slate-400 mt-1">Everything your business needs inside one secure platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-white">8 Downloadable PDFs</h4>
              <p className="text-xs text-slate-400 mt-1">Formal business plans, budget sheets, P&L, inventory audits, and sales registers.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-white">Live Inventory Audit</h4>
              <p className="text-xs text-slate-400 mt-1">Automatic stock deduction on sales, reorder thresholds, and movement history.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-white">Zero-Error Accounting</h4>
              <p className="text-xs text-slate-400 mt-1">Strict separation of COGS and operating expenses to prevent double-counting.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-white">Food & Product Safety</h4>
              <p className="text-xs text-slate-400 mt-1">Expiry tracking, quarantine workflows, and complaint incident management.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                {authMode === 'login' ? <Lock className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
              </div>
              <h3 className="text-xl font-bold text-white">
                {authMode === 'login' && 'Sign in to Brief2Build AI'}
                {authMode === 'register' && (targetFlow === 'new' ? 'New Business Owner Registration' : 'Existing Business Registration')}
                {authMode === 'forgot' && 'Reset Account Password'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login' && 'Enter your credentials to access your business records.'}
                {authMode === 'register' && 'Create your persistent account. All records will be securely saved.'}
                {authMode === 'forgot' && 'Enter your registered email and a new password.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {authMode === 'forgot' ? 'New Password' : 'Password'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account & Continue' : 'Update Password'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              {authMode === 'login' ? (
                <>
                  <span>New to Brief2Build?</span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                1-Click Sign In with Demo Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>Brief2Build AI • All business records, reports, and saved data are strictly persistent and isolated.</p>
        <p className="mt-1">Default currency: Indian Rupee (₹ INR) • Configurable in Settings</p>
      </footer>
    </div>
  );
};
