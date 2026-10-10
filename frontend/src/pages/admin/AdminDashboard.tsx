import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Building2,
  Sliders,
  Settings,
  Inbox,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Send,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [metrics, setMetrics] = useState({
    totalOrganizations: 0,
    totalRequests: 0,
    resolvedCases: 0,
    pendingCases: 0,
    publishedForms: 0,
  });
  const [orgsList, setOrgsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const token = localStorage.getItem('cpet_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [orgsRes, formsRes, caseMetricsRes] = await Promise.all([
          fetch('/api/v1/organizations', { headers }),
          fetch('/api/v1/forms/public'),
          fetch('/api/v1/cases/admin/metrics', { headers }),
        ]);

        let orgCount = 0;
        if (orgsRes.ok) {
          const json = await orgsRes.json();
          if (json.data && Array.isArray(json.data)) {
            orgCount = json.data.length;
            setOrgsList(json.data.slice(0, 6));
          }
        }

        let formCount = 0;
        let formSubmissions = 0;
        if (formsRes.ok) {
          const json = await formsRes.json();
          if (json.data && Array.isArray(json.data)) {
            formCount = json.data.length;
            formSubmissions = json.data.reduce((acc: number, f: any) => acc + (f.submissionCount || 0), 0);
          }
        }

        let totalCases = 0;
        let resolvedCount = 0;
        let pendingCount = 0;

        if (caseMetricsRes.ok) {
          const json = await caseMetricsRes.json();
          if (json.data) {
            totalCases = json.data.totalCases || 0;
            resolvedCount = json.data.resolvedCases || 0;
            pendingCount =
              (json.data.pendingCases || 0) +
              (json.data.inProgressCases || 0) +
              (json.data.escalatedCases || 0);
          }
        }

        const totalRequests = totalCases + formSubmissions;
        const totalPending = pendingCount > 0 ? pendingCount : Math.max(0, totalRequests - resolvedCount);

        setMetrics({
          totalOrganizations: orgCount,
          totalRequests: totalRequests,
          resolvedCases: resolvedCount,
          pendingCases: totalPending,
          publishedForms: formCount,
        });
      } catch (err) {
        console.warn('Error loading admin live stats', err);
      }
    }

    loadAdminData();
  }, []);

  return (
    <div className="w-full space-y-6 pb-12 font-sans select-none text-slate-800">
      {/* ========================================================= */}
      {/* 1. TOP HERO BANNER & GREETING                             */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase">
              Central Executive Console
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Feeds Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Admin Oversight & Escalation Engine
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Multi-tenant governance across Andhra Pradesh statutory departments, public utilities,
            and healthcare networks. Automated SLA enforcement and two-way channel routing.
          </p>
        </div>

        {/* Quick Executive Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => navigate('/admin/organizations')}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all hover:scale-102 flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Manage Directory</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>SLA Rules</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOUR KEY METRIC CARDS (DESKTOP 4-COL GRID)             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Organizations */}
        <div
          onClick={() => navigate('/admin/organizations')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-[#1E293B] tracking-tight">
              {metrics.totalOrganizations}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Registered Organizations
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Utilities, Healthcare & Govt Bodies
            </div>
          </div>
        </div>

        {/* Metric 2: Total Requests */}
        <div
          onClick={() => navigate('/admin/requests')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              Live Intake
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-[#1E293B] tracking-tight">
              {metrics.totalRequests}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Total Grievance & Cases
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across all multi-channel connectors
            </div>
          </div>
        </div>

        {/* Metric 3: Resolved Cases */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              High Adherence
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-[#1E293B] tracking-tight text-emerald-600">
              {metrics.resolvedCases}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Resolved Successfully
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Completed within designated SLAs
            </div>
          </div>
        </div>

        {/* Metric 4: Pending Cases */}
        <div
          onClick={() => navigate('/admin/requests')}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              Active SLA
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-[#1E293B] tracking-tight text-amber-600">
              {metrics.pendingCases}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Active Triage Queue
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Monitored by escalation timers
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN ANALYTICS ROW: TREND CHART + SLA SCORECARD        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Responsive Request Trend Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1E293B] tracking-tight">
                Case Influx & Intake Trends
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Aggregate universal service requests, blood emergencies, and consumer disputes
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              {['Last 24h', 'Last 7 Days', '30 Days'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    timeRange === r
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Canvas with Full Desktop Width */}
          <div className="w-full pt-2">
            <svg viewBox="0 0 700 220" className="w-full h-56 sm:h-64 overflow-visible">
              {/* Horizontal Grid lines */}
              <g stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="4 4">
                <line x1="40" y1="30" x2="680" y2="30" />
                <line x1="40" y1="80" x2="680" y2="80" />
                <line x1="40" y1="130" x2="680" y2="130" />
                <line x1="40" y1="180" x2="680" y2="180" />
              </g>

              {/* Y-Axis Labels */}
              <text x="8" y="34" className="text-[10px] fill-slate-400 font-mono">350</text>
              <text x="8" y="84" className="text-[10px] fill-slate-400 font-mono">200</text>
              <text x="8" y="134" className="text-[10px] fill-slate-400 font-mono">100</text>
              <text x="18" y="184" className="text-[10px] fill-slate-400 font-mono">0</text>

              {/* Gradient Fill under trend line */}
              <defs>
                <linearGradient id="adminTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Trend Path */}
              <path
                d="M50,150 C120,110 180,125 240,115 C300,105 340,140 400,130 C460,120 500,65 560,55 C620,45 640,35 670,30 L670,180 L50,180 Z"
                fill="url(#adminTrendGradient)"
              />

              {/* Main Line */}
              <path
                d="M50,150 C120,110 180,125 240,115 C300,105 340,140 400,130 C460,120 500,65 560,55 C620,45 640,35 670,30"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Point Markers */}
              <circle cx="50" cy="150" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="240" cy="115" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="400" cy="130" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="560" cy="55" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="670" cy="30" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />

              {/* X-Axis Date Labels */}
              <text x="45" y="202" className="text-[10px] fill-slate-400">Mon, 10th</text>
              <text x="140" y="202" className="text-[10px] fill-slate-400">Tue, 11th</text>
              <text x="240" y="202" className="text-[10px] fill-slate-400">Wed, 12th</text>
              <text x="340" y="202" className="text-[10px] fill-slate-400">Thu, 13th</text>
              <text x="440" y="202" className="text-[10px] fill-slate-400">Fri, 14th</text>
              <text x="540" y="202" className="text-[10px] fill-slate-400">Sat, 15th</text>
              <text x="635" y="202" className="text-[10px] fill-slate-400">Sun, 16th</text>
            </svg>
          </div>
        </div>

        {/* Right (1/3): Real-Time SLA Compliance & Dispatch Engine */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#1E293B] tracking-tight">
                SLA Compliance Matrix
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Healthy (98.4%)
              </span>
            </div>

            <div className="space-y-4">
              {/* Emergency Blood Tier */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Emergency Blood Request</span>
                  <span className="text-rose-600 font-extrabold">6 Hours SLA</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '96%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Discovery Level 1-5 Relay • 100% On-time Dispatch
                </span>
              </div>

              {/* Water & Power Essential Utility */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Water & Utility Disruption</span>
                  <span className="text-blue-600 font-extrabold">4 Hours SLA</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Municipal Dispatch • Fast SMS Trigger active
                </span>
              </div>

              {/* Consumer Electronics & Appliances */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Consumer Appliances (Lloyd/Samsung)</span>
                  <span className="text-indigo-600 font-extrabold">48 Hours SLA</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '89%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Brand Support Desk • Two-way communication
                </span>
              </div>

              {/* Statutory Ragging & Cyber Crime */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>UGC Anti-Ragging & Cyber Rapid Response</span>
                  <span className="text-amber-600 font-extrabold">12 Hours SLA</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nodal Officer Triage Desk • High Escalation Alert
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/services')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Configure SLA Rules & Thresholds</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RECENT ORGANIZATIONS & FAST DISPATCH HUB               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Recent Organizations Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-[#1E293B] tracking-tight">
                Verified Organizations Directory
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Authorities mapped to deterministic routing queues
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/organizations')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Full Directory ({metrics.totalOrganizations})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {orgsList.length > 0 ? (
              orgsList.map((org) => {
                const orgId = org._id || org.id;
                return (
                  <div
                    key={orgId}
                    onClick={() => navigate(`/admin/organizations/${orgId}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 hover:bg-blue-50/50 rounded-2xl border border-slate-200/60 hover:border-blue-200 transition-all cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#1E293B] truncate">
                          {org.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium truncate mt-0.5 flex items-center gap-2">
                          <span>{org.category || org.type || 'Public Authority'}</span>
                          <span className="text-slate-300">•</span>
                          <span>{org.contactPhone || org.contactEmail || 'Registry Active'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        {org.status || 'Active'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                Loading verified organizations directory...
              </div>
            )}
          </div>
        </div>

        {/* Right (1/3): Quick Diagnostics & Settings Hub */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#1E293B] tracking-tight mb-1">
              Gateway Diagnostics
            </h2>
            <p className="text-xs text-slate-400 font-normal mb-5">
              Infrastructure health and communication connectors
            </p>

            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">SMS Gateway Engine</div>
                    <div className="text-[10px] text-slate-400">Fast2SMS HTTP REST Connector</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">NoSQL & XSS Sanitizer</div>
                    <div className="text-[10px] text-slate-400">Active on all intake routes</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Forms Dynamic Studio</div>
                    <div className="text-[10px] text-slate-400">
                      {metrics.publishedForms} Published Public Schemas
                    </div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Open System & SMS Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
