import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  MapPin,
  Mail,
  Phone,
  Clock,
  Droplet,
  CreditCard,
  AlertTriangle,
  FileText,
  Search,
  Check,
  X,
  Edit2,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { ADMIN_ORGANIZATIONS_DATA, OrgListItem } from './AdminOrganizations.js';

export const AdminOrgDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [org, setOrg] = useState<OrgListItem>(() => {
    const found = ADMIN_ORGANIZATIONS_DATA.find((o) => o.id === id);
    return (
      found || {
        id: 'org-water',
        name: 'Water Supply Department',
        category: 'Water Supply',
        serviceCount: 12,
        status: 'Active',
        icon: Droplet,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        location: 'Rajahmundry, East Godavari',
        email: 'support@wsd.gov.in',
        phone: '+91 88972 44567',
        slaDeadline: '4 hours',
      }
    );
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: org.name,
    category: org.category,
    location: org.location || 'Rajahmundry, East Godavari',
    email: org.email || 'support@wsd.gov.in',
    phone: org.phone || '+91 88972 44567',
    slaDeadline: org.slaDeadline || '4 hours',
    status: org.status,
  });

  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    async function loadLiveOrg() {
      try {
        const token = localStorage.getItem('cpet_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/v1/organizations/${id}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const live = json.data;
            const updated: OrgListItem = {
              id: live._id || live.id,
              name: live.name,
              category: live.category || live.type || 'Public Authority',
              serviceCount: (live.services && live.services.length) || 12,
              status: (live.status === 'VERIFIED' ? 'Active' : live.status || 'Active') as any,
              icon: Building2,
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-600',
              location: live.address || 'Andhra Pradesh',
              email: live.contactEmail || 'registry@cpet.org',
              phone: live.contactPhone || '+91 94940 12345',
              slaDeadline: live.settings?.defaultSlaHours ? `${live.settings.defaultSlaHours} hours` : '24 hours',
            };
            setOrg(updated);
            setFormData({
              name: updated.name,
              category: updated.category,
              location: updated.location || '',
              email: updated.email || '',
              phone: updated.phone || '',
              slaDeadline: updated.slaDeadline || '24 hours',
              status: updated.status,
            });
            return;
          }
        }
      } catch (err) {
        // Fallback to pre-seeded data
      }

      const found = ADMIN_ORGANIZATIONS_DATA.find((o) => o.id === id);
      if (found) {
        setOrg(found);
        setFormData({
          name: found.name,
          category: found.category,
          location: found.location || '',
          email: found.email || '',
          phone: found.phone || '',
          slaDeadline: found.slaDeadline || '4 hours',
          status: found.status,
        });
      }
    }

    loadLiveOrg();
  }, [id]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...org,
      ...formData,
    };
    setOrg(updated);
    setShowEditModal(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const servicesList = [
    { title: 'New Connection', icon: Droplet, count: '32 active cases', sla: '24h' },
    { title: 'Billing & Tariff Dispute', icon: CreditCard, count: '14 active cases', sla: '48h' },
    { title: 'Pipeline Leakage Emergency', icon: AlertTriangle, count: '6 active cases', sla: '4h' },
    { title: 'Water Quality Inspection', icon: Droplet, count: '8 active cases', sla: '12h' },
    { title: 'Meter Calibration Service', icon: Search, count: '5 active cases', sla: '24h' },
    { title: 'Statutory Grievance Appeal', icon: FileText, count: '2 active cases', sla: '48h' },
  ];

  const OrgIcon = org.icon || Droplet;

  return (
    <div className="w-full space-y-6 pb-12 font-sans select-none text-slate-800">
      {/* 1. Top Header with Back Button and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/organizations')}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Back to Organizations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
              {org.name}
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Organization details, designated routing queue, and live SLA scorecard
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-102 cursor-pointer self-start sm:self-auto"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Details & SLA</span>
        </button>
      </div>

      {/* Save Success Banner */}
      {saveToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Organization profile and SLA thresholds updated successfully!</span>
          </div>
          <button onClick={() => setSaveToast(false)} className="text-emerald-500 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3): Organization Metadata & Performance Scorecard */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <OrgIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1E293B] leading-snug">
                    {org.name}
                  </h2>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">
                    {org.category}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  org.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {org.status}
              </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Category</span>
                </div>
                <span className="font-bold text-slate-800">{org.category}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Jurisdiction</span>
                </div>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{org.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Email</span>
                </div>
                <span className="font-bold text-blue-600 truncate max-w-[180px]">{org.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Helpline / Phone</span>
                </div>
                <span className="font-bold text-slate-800">{org.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Base SLA Window</span>
                </div>
                <span className="font-bold text-amber-600">{org.slaDeadline}</span>
              </div>
            </div>
          </div>

          {/* Performance Gauges Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#1E293B]">
              Real-Time SLA Performance
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-500 mb-2">
                  SLA Compliance
                </span>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                  94.2%
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Target &ge; 90%</span>
              </div>

              <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-500 mb-2">
                  Avg Resolution
                </span>
                <div className="text-2xl font-black text-blue-600 tracking-tight">
                  3.2h
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Under 4h target</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2/3): Service Catalog & Routing Queues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  Active Services & Triage Channels ({servicesList.length})
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Citizen requests matching these services route directly to this authority
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/admin/services')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View SLA Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {servicesList.map((svc) => {
                const SvcIcon = svc.icon;
                return (
                  <div
                    key={svc.title}
                    className="p-4 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <SvcIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1E293B] group-hover:text-blue-600 transition-colors truncate">
                          {svc.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {svc.count}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shrink-0">
                      {svc.sla} SLA
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#1E293B]">
                Edit Organization Details
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SLA Deadline</label>
                  <input
                    type="text"
                    value={formData.slaDeadline}
                    onChange={(e) => setFormData({ ...formData, slaDeadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
