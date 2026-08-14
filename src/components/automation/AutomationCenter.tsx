'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Settings,
  ToggleLeft,
  ToggleRight,
  ChevronRight
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  channel: 'whatsapp' | 'email' | 'sms' | 'push';
  enabled: boolean;
  lastTriggered?: string;
}

const defaultRules: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Booking Confirmation',
    description: 'Send confirmation notification upon successful booking with payment receipt',
    trigger: 'On booking confirmed',
    channel: 'whatsapp',
    enabled: true,
    lastTriggered: '2 hours ago',
  },
  {
    id: 'auto-2',
    name: 'Rotation Reminder (T-3 Days)',
    description: 'Remind trainee about upcoming rotation start date with preparation checklist',
    trigger: '3 days before rotation start',
    channel: 'email',
    enabled: true,
    lastTriggered: '1 day ago',
  },
  {
    id: 'auto-3',
    name: 'Daily Logbook Nudge',
    description: 'Encourage daily clinical logbook entry for active trainees at 9 PM',
    trigger: 'Daily at 9:00 PM',
    channel: 'push',
    enabled: true,
    lastTriggered: '12 hours ago',
  },
  {
    id: 'auto-4',
    name: 'Certificate Ready',
    description: 'Notify trainee when DMHCA certificate is issued and available for download',
    trigger: 'On certificate issued',
    channel: 'whatsapp',
    enabled: true,
    lastTriggered: '3 days ago',
  },
  {
    id: 'auto-5',
    name: 'Payment Receipt',
    description: 'Auto-generate and email GST invoice and payment receipt',
    trigger: 'On payment success',
    channel: 'email',
    enabled: false,
  },
  {
    id: 'auto-6',
    name: 'Mentor Assignment Alert',
    description: 'Notify hospital admin when a new trainee is assigned to their facility',
    trigger: 'On booking approval',
    channel: 'sms',
    enabled: false,
  },
];

const channelConfig = {
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  email: { label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  sms: { label: 'SMS', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  push: { label: 'Push', icon: <Bell className="w-3.5 h-3.5" />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

export const AutomationCenter: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const { notifications } = useApp();

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 text-blue-800 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
          <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Notification & Automation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Automation <span className="gradient-text-blue">Center</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Configure automated notifications across WhatsApp, Email, SMS, and push channels. Keep trainees, hospitals, and admins in sync — hands-free.
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Active Rules', value: enabledCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />, iconBg: 'bg-emerald-100/90 border border-emerald-300', border: 'border-emerald-200 hover:border-emerald-500' },
          { label: 'Total Rules', value: rules.length, icon: <Settings className="w-5 h-5 text-blue-700" />, iconBg: 'bg-blue-100/90 border border-blue-300', border: 'border-blue-200 hover:border-blue-500' },
          { label: 'Notifications Sent', value: notifications.length, icon: <Bell className="w-5 h-5 text-amber-700" />, iconBg: 'bg-amber-100/90 border border-amber-300', border: 'border-amber-200 hover:border-amber-500' },
          { label: 'Channels Active', value: 4, icon: <Zap className="w-5 h-5 text-indigo-700" />, iconBg: 'bg-indigo-100/90 border border-indigo-300', border: 'border-indigo-200 hover:border-indigo-500' },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4, scale: 1.02 }}
            className={`bg-white border-2 ${s.border} rounded-3xl p-5 space-y-3 shadow-md hover:shadow-xl transition-all duration-300`}
          >
            <div className={`w-10 h-10 rounded-2xl ${s.iconBg} flex items-center justify-center shadow-2xs`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">{s.value}</p>
              <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mt-1 font-heading">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Automation Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-slate-900 font-heading">Automation Rules</h3>
          <span className="text-[11px] font-bold text-slate-500">{enabledCount} of {rules.length} enabled</span>
        </div>

        <div className="space-y-3.5">
          {rules.map((rule) => {
            const ch = channelConfig[rule.channel];
            return (
              <motion.div
                key={rule.id}
                whileHover={{ y: -2 }}
                className={`glass-card rounded-3xl p-5 sm:p-6 transition shadow-xs flex flex-col sm:flex-row sm:items-center gap-4 ${
                  rule.enabled ? 'border-slate-200/80' : 'border-slate-200/50 opacity-60'
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="shrink-0 self-start touch-target cursor-pointer"
                  aria-label={`Toggle ${rule.name}`}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-9 h-9 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="text-base font-bold text-slate-900 font-heading">{rule.name}</h4>
                    <span className={`inline-flex items-center gap-1 ${ch.bg} ${ch.color} border ${ch.border} text-[10px] font-extrabold px-2.5 py-0.5 rounded-full`}>
                      {ch.icon}
                      {ch.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{rule.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Trigger: {rule.trigger}
                    </span>
                    {rule.lastTriggered && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Last: {rule.lastTriggered}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-300 hidden sm:block shrink-0" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Notification Log */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="px-6 py-4.5 border-b border-slate-200/80">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">Recent Notification Log</h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto font-medium">
          {notifications.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500 text-xs">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No notifications dispatched yet.
            </div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div key={n.id} className="px-6 py-3.5 flex items-start gap-3.5 hover:bg-slate-50/50 transition">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.status === 'Read' ? 'bg-slate-300' : 'bg-blue-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-900 font-bold font-heading">{n.title}</p>
                  <p className="text-[11px] text-slate-600 truncate">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
