import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Clock,
  CheckCircle2,
  Building2,
  Plus,
  Edit2,
  X,
  Check,
  ShieldAlert,
  Droplet,
  Zap,
  Heart,
  Bus,
  Flame,
  GraduationCap,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  department: string;
  category: string;
  slaHours: number;
  priority: 'High' | 'Medium' | 'Critical' | 'Low';
  enabled: boolean;
  icon: React.ElementType;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'svc-1',
    name: 'New Water Connection Request',
    department: 'Water Supply Department',
    category: 'Water Supply',
    slaHours: 24,
    priority: 'Medium',
    enabled: true,
    icon: Droplet,
  },
  {
    id: 'svc-2',
    name: 'Main Pipeline Leakage Repair',
    department: 'Water Supply Department',
    category: 'Water Supply',
    slaHours: 4,
    priority: 'Critical',
    enabled: true,
    icon: Droplet,
  },
  {
    id: 'svc-3',
    name: 'Power Outage & Transformer Fault',
    department: 'Electricity Board',
    category: 'Electricity',
    slaHours: 4,
    priority: 'Critical',
    enabled: true,
    icon: Zap,
  },
  {
    id: 'svc-4',
    name: 'Street Light & Distribution Pole Issue',
    department: 'Electricity Board',
    category: 'Electricity',
    slaHours: 12,
    priority: 'Medium',
    enabled: true,
    icon: Zap,
  },
  {
    id: 'svc-5',
    name: 'Emergency O- Blood Unit Requirement',
    department: 'District Medical & Health Office',
    category: 'Healthcare',
    slaHours: 6,
    priority: 'Critical',
    enabled: true,
    icon: Heart,
  },
  {
    id: 'svc-6',
    name: 'Primary Health Center Care Deficiency',
    department: 'District Medical & Health Office',
    category: 'Healthcare',
    slaHours: 24,
    priority: 'High',
    enabled: true,
    icon: Heart,
  },
  {
    id: 'svc-7',
    name: 'Town Drainage & Overflowing Sump Clearance',
    department: 'Municipal Corporation',
    category: 'Municipal Services',
    slaHours: 24,
    priority: 'High',
    enabled: true,
    icon: Building2,
  },
  {
    id: 'svc-8',
    name: 'Property Tax Assessment & Discrepancy',
    department: 'Municipal Corporation',
    category: 'Municipal Services',
    slaHours: 48,
    priority: 'Low',
    enabled: true,
    icon: Building2,
  },
  {
    id: 'svc-9',
    name: 'City Bus Route Cancellation & Breakdown',
    department: 'State Road Transport (APSRTC)',
    category: 'Transport',
    slaHours: 48,
    priority: 'Low',
    enabled: true,
    icon: Bus,
  },
  {
    id: 'svc-10',
    name: 'Piped Natural Gas (PNG) Low Pressure',
    department: 'City Gas Distribution',
    category: 'Gas Distribution',
    slaHours: 2,
    priority: 'Critical',
    enabled: true,
    icon: Flame,
  },
  {
    id: 'svc-11',
    name: 'Severe Campus Ragging & Hostel Harassment',
    department: 'National Anti-Ragging Cell & UGC Desk',
    category: 'Education & Statutory',
    slaHours: 12,
    priority: 'Critical',
    enabled: true,
    icon: GraduationCap,
  },
  {
    id: 'svc-12',
    name: 'Urgent Financial Cyber Fraud (Helpline 1930)',
    department: 'Cyber Crime Reporting Desk',
    category: 'Cyber & Police',
    slaHours: 2,
    priority: 'Critical',
    enabled: true,
    icon: ShieldAlert,
  },
];

export const AdminServices: React.FC = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((svc) => {
    if (selectedCategory !== 'All' && svc.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && svc.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        svc.name.toLowerCase().includes(q) ||
        svc.department.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? editingService : s))
    );
    setEditingService(null);
    setShowToast('Service SLA updated successfully!');
    setTimeout(() => setShowToast(null), 3000);
  };

  const criticalCount = services.filter((s) => s.priority === 'Critical').length;
  const activeCount = services.filter((s) => s.enabled).length;

  return (
    <div className="w-full space-y-6 pb-12 font-sans select-none text-slate-800">
      {/* 1. Header with Back Button and Add Service CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
              Service Catalog & SLA Matrix
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Deterministic routing rules, service categories, and escalation deadlines
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const newSvc: ServiceItem = {
              id: `svc-${Date.now()}`,
              name: 'New Custom Public Service',
              department: 'Municipal Corporation',
              category: 'Municipal Services',
              slaHours: 24,
              priority: 'Medium',
              enabled: true,
              icon: CheckCircle2,
            };
            setServices([newSvc, ...services]);
            setShowToast('New service added to catalog!');
            setTimeout(() => setShowToast(null), 3000);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-102 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{showToast}</span>
          </div>
          <button onClick={() => setShowToast(null)} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Top Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Services</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{services.length}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-emerald-600 font-semibold">Active in Engine</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-rose-600 font-semibold">Critical Fast SLAs (&le;6h)</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-blue-600 font-semibold">Avg Escalation Window</div>
          <div className="text-2xl font-black text-blue-600 mt-1">16.4h</div>
        </div>
      </div>

      {/* 3. Search & Filter Desktop Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services by keyword, department, or domain..."
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Desktop High-Density Table & Responsive Card List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Service Name & Scope</th>
                <th className="py-3.5 px-4">Department / Org</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">SLA Window</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <tr key={svc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="font-extrabold text-[#1E293B] text-xs max-w-sm">
                          {svc.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600">{svc.department}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {svc.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                          svc.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : svc.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : svc.priority === 'Medium'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {svc.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{svc.slaHours} hours</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          svc.enabled ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        title="Toggle Service"
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                            svc.enabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingService(svc)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-200/60"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit SLA</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View (< lg screens) */}
        <div className="lg:hidden divide-y divide-slate-100 p-4 space-y-3">
          {filteredServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-[#1E293B] text-xs">{svc.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{svc.department}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingService(svc)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{svc.slaHours} Hours SLA</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      svc.priority === 'Critical'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {svc.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SLA Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#1E293B]">Edit SLA & Threshold</h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">{editingService.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Resolution SLA (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={editingService.slaHours}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      slaHours: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Priority Level
                </label>
                <select
                  value={editingService.priority}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Critical">Critical (Immediate Emergency Relay)</option>
                  <option value="High">High (Rapid Municipal / Health Triage)</option>
                  <option value="Medium">Medium (Standard Consumer Escalation)</option>
                  <option value="Low">Low (General Statutory Inquiries)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save SLA Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
