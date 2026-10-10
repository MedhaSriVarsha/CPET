import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Smartphone,
  Save,
  Check,
  Send,
  Clock,
  Key,
  ShieldCheck,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const navigate = useNavigate();

  const [smsGateway, setSmsGateway] = useState<'fast2sms' | 'twilio' | 'textlocal'>('fast2sms');
  const [apiKey, setApiKey] = useState('cpet_live_fast2sms_9984210a74b');
  const [senderHeader, setSenderHeader] = useState('CPETAP');
  const [notifyOnStatusChange, setNotifyOnStatusChange] = useState(true);
  const [notifyOnCreate, setNotifyOnCreate] = useState(true);
  const [autoEscalateSla, setAutoEscalateSla] = useState(true);
  const [slaEscalationThreshold, setSlaEscalationThreshold] = useState('75');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+91 94940 12345');

  const [banner, setBanner] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showBannerMessage = (msg: string, type: 'success' | 'info' = 'success') => {
    setBanner({ type, message: msg });
    setTimeout(() => setBanner(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showBannerMessage('System & SMS gateway parameters persisted successfully!');
  };

  const handleTestSms = () => {
    if (!testPhoneNumber.trim()) return;
    showBannerMessage(
      `Test SMS dispatched to ${testPhoneNumber}: "[CPET Alert] Case CPET-2026-9021 status updated to IN_PROGRESS. SLA timer active."`
    );
  };

  const auditLogs = [
    {
      id: '1',
      action: 'Water Supply Department SLA adjusted to 4 hours',
      actor: 'Chief Administrator (SUPER_ADMIN)',
      time: '12 mins ago',
      level: 'INFO',
    },
    {
      id: '2',
      action: 'SMS Gateway Fast2SMS ping verified successfully',
      actor: 'System Daemon',
      time: '45 mins ago',
      level: 'SUCCESS',
    },
    {
      id: '3',
      action: 'Anti-Ragging nodal officer account provisioned',
      actor: 'CPET Operations Admin (CPET_ADMIN)',
      time: '2 hours ago',
      level: 'INFO',
    },
    {
      id: '4',
      action: 'Electricity Board 14 resolved cases archived',
      actor: 'Automation Engine',
      time: '5 hours ago',
      level: 'INFO',
    },
    {
      id: '5',
      action: 'Brute-force protection counter reset after verified login',
      actor: 'Security Firewall',
      time: '8 hours ago',
      level: 'SECURITY',
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans select-none text-slate-800">
      {/* 1. Header with Back Button */}
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
              Admin Governance & Gateway Settings
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              SMS dispatch channels, statutory DLT configuration, and security firewall controls
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-102 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-xs ${
            banner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{banner.message}</span>
        </div>
      )}

      {/* 2. Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: SMS Gateway & Dispatch Configuration */}
        <div className="space-y-6">
          {/* SMS Configuration Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1E293B]">
                  SMS Notification Gateway
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Sends instant notifications to citizen & officer mobile numbers
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Primary SMS Gateway Provider
                  </label>
                  <select
                    value={smsGateway}
                    onChange={(e) => setSmsGateway(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="fast2sms">Fast2SMS (Govt DLT Approved)</option>
                    <option value="twilio">Twilio Programmable SMS</option>
                    <option value="textlocal">Textlocal India Nodal Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Approved DLT Sender ID
                  </label>
                  <input
                    type="text"
                    value={senderHeader}
                    onChange={(e) => setSenderHeader(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:bg-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  API Key / Secret Bearer Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-800">Dispatch SMS on Case Registration</p>
                      <p className="text-[11px] text-slate-400">Sends reference number and SLA tracking link</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnCreate}
                    onChange={(e) => setNotifyOnCreate(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-bold text-slate-800">Dispatch SMS on Status Progression</p>
                      <p className="text-[11px] text-slate-400">Alerts citizen when officer marks In-Progress or Resolved</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnStatusChange}
                    onChange={(e) => setNotifyOnStatusChange(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            </form>
          </div>

          {/* Live SMS Diagnostic Console */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1E293B]">Live SMS Dispatch Diagnostics</h3>
                <p className="text-xs text-slate-400">Verify carrier deliverability with a test payload</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <input
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+91 Mobile Number"
                className="w-full sm:flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestSms}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Ping</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SLA Escalation Rules & System Audit Logs */}
        <div className="space-y-6">
          {/* SLA Escalation Rules Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1E293B]">
                  Automated SLA Escalation Rules
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Universal countdown daemon and departmental notice triggers
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Auto-Escalate Unresolved Cases</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Elevates priority to HIGH/CRITICAL and sends alert to HOD
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoEscalateSla}
                  onChange={(e) => setAutoEscalateSla(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </label>

              <div>
                <div className="flex items-center justify-between font-bold text-slate-700 mb-2">
                  <span>Escalation Trigger Threshold</span>
                  <span className="text-blue-600 font-extrabold">{slaEscalationThreshold}% of SLA elapsed</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={slaEscalationThreshold}
                  onChange={(e) => setSlaEscalationThreshold(e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>50% (Early Warning)</span>
                  <span>75% (Recommended)</span>
                  <span>90% (Urgent Pre-breach)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs & Security Activity */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1E293B]">Admin Security Audit Trail</h3>
                  <p className="text-xs text-slate-400">Tamper-evident logs of governance events</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/80">
                Audited
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between text-xs gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{log.actor}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
