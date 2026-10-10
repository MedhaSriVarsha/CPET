import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Building2,
  Sliders,
  Settings,
  Inbox,
  Layers,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  ShieldCheck,
  Search,
  Activity,
} from 'lucide-react';
import { cn } from '../../design-system/utils.js';

export const AdminShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      group: 'Core Management',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, badge: null },
        { name: 'Organizations', href: '/admin/organizations', icon: Building2, badge: 'Directory' },
        { name: 'Service Catalog & SLA', href: '/admin/services', icon: Sliders, badge: null },
      ],
    },
    {
      group: 'Triage & Operations',
      items: [
        { name: 'Universal Cases', href: '/admin/requests', icon: Inbox, badge: null },
        { name: 'Forms Studio', href: '/admin/forms', icon: Layers, badge: null },
        { name: 'Admin Team', href: '/admin/team', icon: Users, badge: null },
        { name: 'SLA Performance', href: '/admin/performance', icon: BarChart3, badge: null },
      ],
    },
    {
      group: 'Governance & Security',
      items: [
        { name: 'SMS & System Settings', href: '/admin/settings', icon: Settings, badge: null },
      ],
    },
  ];

  const adminName = user?.name || 'Chief Administrator';
  const adminEmail = user?.email || 'admin@cpet.org';
  const adminRole = user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'CPET Admin';
  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/organizations?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex font-sans select-none text-slate-800 antialiased">
      {/* ========================================================= */}
      {/* 1. FIXED VERTICAL LEFT SIDEBAR (DESKTOP)                  */}
      {/* ========================================================= */}
      <aside
        className={cn(
          'hidden sm:flex flex-col justify-between bg-white border-r border-slate-200/90 transition-all duration-300 z-40 sticky top-0 h-screen shrink-0 shadow-xs select-none',
          isSidebarCollapsed ? 'w-20 px-3 py-5' : 'w-64 px-5 py-6'
        )}
      >
        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar">
          {/* Brand Header & Toggle */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-3 cursor-pointer overflow-hidden group"
            >
              {/* Circular CPET Gradient Swirl Logo */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-[2.5px] shadow-sm shadow-blue-500/20 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" className="opacity-20" />
                    <path d="M12 3a9 9 0 0 1 9 9" className="text-sky-500 stroke-[3]" />
                    <path d="M12 21a9 9 0 0 1-9-9" className="text-blue-600 stroke-[3]" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-blue-600" />
                  </svg>
                </div>
              </div>

              {!isSidebarCollapsed && (
                <div className="leading-tight overflow-hidden">
                  <span className="font-black text-xl tracking-tight text-[#1E293B] block">
                    CPET
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block whitespace-nowrap truncate">
                    Central Admin Portal
                  </span>
                </div>
              )}
            </div>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200/80 items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-5 pt-2">
            {navGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {grp.group}
                  </p>
                )}
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={cn(
                        'flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer relative group',
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        isSidebarCollapsed && 'justify-center px-0'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      {!isSidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between overflow-hidden">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="ml-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-700">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-md" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          {!isSidebarCollapsed ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{adminName}</div>
                  <div className="text-[10px] font-semibold text-blue-600 truncate">{adminRole} • {adminEmail}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-10 h-10 mx-auto rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN LAYOUT: TOP HEADER + OUTLET CONTENT               */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP DESKTOP & MOBILE HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          {/* Left: Mobile Toggle + Breadcrumb / Badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Oversight Active
              </span>

              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Authorized Government Tier
              </span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md hidden md:flex items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search organizations, services, cases... (Press Enter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </form>

          {/* Right: Quick Links, Alerts & Profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/services')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>SLA SLA Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </button>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-800">{adminName}</div>
                <div className="text-[10px] font-semibold text-slate-400">{adminRole}</div>
              </div>
            </div>
          </div>
        </header>

        {/* OUTLET MAIN CONTENT CONTAINER */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE SLIDEOUT DRAWER                                 */}
      {/* ========================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    C
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block leading-tight">CPET Admin</span>
                    <span className="text-[10px] text-slate-400">Oversight Panel</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {navGroups.map((grp, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {grp.group}
                    </p>
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            setIsMobileDrawerOpen(false);
                            navigate(item.href);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left',
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION (Small screens only)          */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-30 shadow-lg sm:hidden">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl font-medium cursor-pointer',
            location.pathname === '/admin/dashboard'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/organizations')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl font-medium cursor-pointer',
            location.pathname === '/admin/organizations'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Building2 className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Organizations</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/services')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl font-medium cursor-pointer',
            location.pathname === '/admin/services'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Services</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/settings')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl font-medium cursor-pointer',
            location.pathname === '/admin/settings'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[10px] leading-tight">Settings</span>
        </button>
      </nav>
    </div>
  );
};
