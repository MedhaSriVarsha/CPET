import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Droplet,
  Zap,
  Heart,
  Building2,
  Bus,
  Flame,
  GraduationCap,
  ShieldAlert,
  Clock,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';

export interface OrgListItem {
  id: string;
  name: string;
  category: string;
  serviceCount: number;
  status: 'Active' | 'Pending' | 'Suspended';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  location?: string;
  email?: string;
  phone?: string;
  slaDeadline?: string;
}

export const ADMIN_ORGANIZATIONS_DATA: OrgListItem[] = [
  {
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
  },
  {
    id: 'org-power',
    name: 'Electricity Board',
    category: 'Electricity',
    serviceCount: 10,
    status: 'Active',
    icon: Zap,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    location: 'Kakinada Central Substation',
    email: 'helpdesk@electricity.gov.in',
    phone: '1912 / +91 88972 88211',
    slaDeadline: '4 hours',
  },
  {
    id: 'org-health',
    name: 'District Medical & Health Office',
    category: 'Healthcare',
    serviceCount: 15,
    status: 'Active',
    icon: Heart,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    location: 'Government General Hospital Campus, Kakinada',
    email: 'dmho.eg@gov.in',
    phone: '+91 884 236 1234',
    slaDeadline: '6 hours',
  },
  {
    id: 'org-muni',
    name: 'Municipal Corporation',
    category: 'Municipal Services',
    serviceCount: 18,
    status: 'Active',
    icon: Building2,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    location: 'Municipal Administrative Complex, Danavaipeta',
    email: 'commissioner@rmc.gov.in',
    phone: '0883-2472288',
    slaDeadline: '24 hours',
  },
  {
    id: 'org-rtc',
    name: 'State Road Transport (APSRTC)',
    category: 'Transport',
    serviceCount: 8,
    status: 'Active',
    icon: Bus,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    location: 'APSRTC Regional Complex, Morampudi',
    email: 'grievance@apsrtc.gov.in',
    phone: '0866-2570005',
    slaDeadline: '48 hours',
  },
  {
    id: 'org-gas',
    name: 'City Gas Distribution (Bhagyanagar Gas)',
    category: 'Gas Distribution',
    serviceCount: 6,
    status: 'Active',
    icon: Flame,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    location: 'Industrial Estate, Dowleswaram',
    email: 'care@bglgas.com',
    phone: '1800-425-0101',
    slaDeadline: '2 hours',
  },
  {
    id: 'org-edu',
    name: 'National Anti-Ragging Cell & UGC Desk',
    category: 'Education & Statutory',
    serviceCount: 7,
    status: 'Active',
    icon: GraduationCap,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    location: 'UGC Headquarters, New Delhi',
    email: 'helpline@antiragging.in',
    phone: '1800-180-5522',
    slaDeadline: '12 hours',
  },
  {
    id: 'org-cyber',
    name: 'Cyber Crime Reporting Desk',
    category: 'Cyber & Police',
    serviceCount: 9,
    status: 'Active',
    icon: ShieldAlert,
    iconBg: 'bg-slate-900',
    iconColor: 'text-red-400',
    location: 'National Cyber Crime Cell',
    email: 'incident@cybercrime.gov.in',
    phone: '1930 / +91 88972 91930',
    slaDeadline: '2 hours',
  },
];

export const AdminOrganizations: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Pending' | 'Suspended'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [organizations, setOrganizations] = useState<OrgListItem[]>(ADMIN_ORGANIZATIONS_DATA);

  // Fetch live organizations from API and merge
  useEffect(() => {
    async function fetchLiveOrgs() {
      try {
        const token = localStorage.getItem('cpet_access_token');
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/v1/organizations', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: OrgListItem[] = json.data.map((o: any) => ({
              id: o._id || o.id,
              name: o.name,
              category: o.category || o.type || 'Public Authority',
              serviceCount: (o.services && o.services.length) || (o.departments && o.departments.length) || 6,
              status: (o.status === 'VERIFIED' ? 'Active' : o.status || 'Active') as any,
              icon: Building2,
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-600',
              location: o.address || (o.locations && o.locations[0]?.city) || 'Andhra Pradesh',
              email: o.contactEmail || 'registry@cpet.org',
              phone: o.contactPhone || '+91 94940 12345',
              slaDeadline: o.settings?.defaultSlaHours ? `${o.settings.defaultSlaHours} hours` : '24 hours',
            }));

            // Merge unique by name
            const combined = [...ADMIN_ORGANIZATIONS_DATA];
            mapped.forEach((m) => {
              if (!combined.some((c) => c.name.toLowerCase() === m.name.toLowerCase())) {
                combined.push(m);
              }
            });
            setOrganizations(combined);
          }
        }
      } catch (err) {
        console.warn('Notice: Using pre-seeded organizations', err);
      }
    }

    fetchLiveOrgs();
  }, []);

  const categories = ['All Categories', ...Array.from(new Set(organizations.map((o) => o.category)))];

  const filteredOrgs = organizations.filter((org) => {
    if (activeTab !== 'All' && org.status !== activeTab) return false;
    if (selectedCategory !== 'All Categories' && org.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        org.name.toLowerCase().includes(q) ||
        org.category.toLowerCase().includes(q) ||
        (org.location && org.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-12 font-sans select-none text-slate-800">
      {/* 1. Header with Back Button and Quick Stats */}
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
              Organizations Directory
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Verified departments, state boards, and corporate redressal desks
            </p>
          </div>
        </div>

        {/* Top Metric Badges */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700">
            {organizations.length} Total Authorities
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700">
            {organizations.filter((o) => o.status === 'Active').length} Active Queues
          </span>
        </div>
      </div>

      {/* 2. Search & Filter Desktop Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by organization name, category, or location..."
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

          {/* Category Dropdown */}
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
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {(['All', 'Active', 'Pending', 'Suspended'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto font-medium">
            Showing {filteredOrgs.length} of {organizations.length}
          </span>
        </div>
      </div>

      {/* 3. Organizations Grid (Responsive Desktop 3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrgs.map((org) => {
          const Icon = org.icon;
          return (
            <div
              key={org.id}
              onClick={() => navigate(`/admin/organizations/${org.id}`)}
              className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              {/* Card Top: Icon, Name, Category & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${org.iconBg} ${org.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      org.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : org.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                        : 'bg-rose-50 text-rose-700 border-rose-200/80'
                    }`}
                  >
                    {org.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                  {org.name}
                </h3>
                <div className="text-xs font-semibold text-blue-600 mt-1">
                  {org.category}
                </div>

                {/* Metadata List */}
                <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  {org.location && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{org.location}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{org.phone}</span>
                    </div>
                  )}
                  {org.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{org.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: SLA Badge & View CTA */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>SLA: {org.slaDeadline || '24 hours'}</span>
                </div>

                <div className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrgs.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No organizations match your search</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or switching the category filter.
          </p>
        </div>
      )}
    </div>
  );
};
