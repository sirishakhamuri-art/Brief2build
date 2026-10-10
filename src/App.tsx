import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeLanding } from './components/WelcomeLanding';
import { NewBusinessWizard } from './components/NewBusinessWizard';
import { ExistingBusinessOnboarding } from './components/ExistingBusinessOnboarding';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductsInventory } from './components/ProductsInventory';
import { SupplierDiscovery } from './components/SupplierDiscovery';
import { SupplierDirectory } from './components/SupplierDirectory';
import { SalesModule } from './components/SalesModule';
import { PurchasesModule } from './components/PurchasesModule';
import { ExpensesModule } from './components/ExpensesModule';
import { ProfitAndLossModule } from './components/ProfitAndLossModule';
import { AIBusinessInsights } from './components/AIBusinessInsights';
import { FoodSafetyModule } from './components/FoodSafetyModule';
import { ReportsExport } from './components/ReportsExport';
import { SettingsModal } from './components/SettingsModal';
import { CashFlowForecastModule } from './components/CashFlowForecastModule';
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  Search,
  Users,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  FileText,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  CheckCircle2,
  Banknote,
} from 'lucide-react';

function MainApp() {
  const {
    user,
    business,
    isLoading,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    currencySymbol,
  } = useAuth();

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // If user selected a specific onboarding flow during welcome
  const [activeOnboardingFlow, setActiveOnboardingFlow] = useState<'new' | 'existing' | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3 text-slate-400 font-sans">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold tracking-wide">Brief2Build AI • Loading Commercial Environment...</p>
      </div>
    );
  }

  // Not logged in -> Welcome Landing
  if (!user || !business) {
    return (
      <WelcomeLanding
        onSelectFlow={(flow) => {
          setActiveOnboardingFlow(flow);
          if (flow === 'new') setActiveSection('planning');
          else if (flow === 'existing') setActiveSection('onboarding');
        }}
      />
    );
  }

  // Check if food safety tab should have prominent badge
  const isFoodCategory =
    business.category === 'bakery_restaurant' || business.category === 'grocery';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'planning', label: 'Business Planning', icon: Compass, badge: business.status === 'planning' ? 'Planning' : undefined },
    { id: 'discovery', label: 'Supplier Discovery', icon: Search },
    { id: 'suppliers', label: 'Supplier Directory', icon: Users },
    { id: 'inventory', label: 'Products & Inventory', icon: Package },
    { id: 'sales', label: 'Daily Sales (POS)', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases (PO)', icon: Truck },
    { id: 'expenses', label: 'Operating Expenses', icon: DollarSign },
    { id: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'cashflow', label: 'Cash Flow Forecast', icon: Banknote, badge: '90-Day' },
    { id: 'insights', label: 'AI Business Insights', icon: Sparkles },
    { id: 'safety', label: 'Food & Product Safety', icon: ShieldAlert, badge: isFoodCategory ? 'Active' : undefined },
    { id: 'reports', label: 'PDF Reports & Export', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="h-20 px-6 flex items-center space-x-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-white flex items-center space-x-1">
              <span>Brief2Build</span>
              <span className="text-indigo-400">AI</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 truncate max-w-[130px]">
              {business.name}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setActiveOnboardingFlow(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-indigo-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer User Info & Settings */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Settings & Currency"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="w-full py-2 px-3 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Brief2Build AI • Workspace
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                {business.name}
              </h1>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center space-x-3">
            {/* Currency Pill */}
            <div
              onClick={() => setSettingsOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center space-x-1 cursor-pointer hover:border-slate-700"
              title="Change Currency"
            >
              <span className="text-indigo-400 font-bold">{currencySymbol}</span>
              <span>{business.currency || 'INR'}</span>
            </div>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 relative transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Notifications & Alerts</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {unreadNotificationsCount} unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-500">No notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkSection) setActiveSection(n.linkSection);
                            setNotificationsOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            n.read
                              ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                              : 'bg-slate-950 border-indigo-500/40 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white truncate text-[11px]">{n.title}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Trigger */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeOnboardingFlow === 'existing' && activeSection === 'onboarding' ? (
            <ExistingBusinessOnboarding
              onComplete={() => {
                setActiveOnboardingFlow(null);
                setActiveSection('overview');
              }}
            />
          ) : activeSection === 'overview' ? (
            <DashboardOverview onNavigate={(sec) => setActiveSection(sec)} />
          ) : activeSection === 'planning' ? (
            <NewBusinessWizard
              onPlanFinished={() => setActiveSection('overview')}
              onNavigateToSuppliers={() => setActiveSection('discovery')}
            />
          ) : activeSection === 'discovery' ? (
            <SupplierDiscovery />
          ) : activeSection === 'suppliers' ? (
            <SupplierDirectory />
          ) : activeSection === 'inventory' ? (
            <ProductsInventory />
          ) : activeSection === 'sales' ? (
            <SalesModule />
          ) : activeSection === 'purchases' ? (
            <PurchasesModule />
          ) : activeSection === 'expenses' ? (
            <ExpensesModule />
          ) : activeSection === 'pnl' ? (
            <ProfitAndLossModule />
          ) : activeSection === 'cashflow' ? (
            <CashFlowForecastModule />
          ) : activeSection === 'insights' ? (
            <AIBusinessInsights />
          ) : activeSection === 'safety' ? (
            <FoodSafetyModule />
          ) : activeSection === 'reports' ? (
            <ReportsExport />
          ) : (
            <DashboardOverview onNavigate={(sec) => setActiveSection(sec)} />
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-64 bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-sm">Brief2Build AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setActiveOnboardingFlow(null);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setSettingsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Settings & Profile
              </button>
              <button
                onClick={() => logout()}
                className="w-full py-2 bg-rose-600/20 text-rose-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
