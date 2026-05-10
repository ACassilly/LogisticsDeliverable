"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, User, Truck, AlertTriangle, CheckCircle2, Clock,
  Radio, Package, Phone, RefreshCw, Filter, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

interface DispatcherStats {
  openLoads: number;
  inTransit: number;
  deliveredToday: number;
  escalations: number;
}

const FILTERS = ['All', 'Unassigned', 'In Transit', 'Late', 'Delivered'];

export default function DispatcherPortalPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const dispatcherName = user?.name || 'Dispatcher';
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DispatcherStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    const token = authService.getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/portal/dispatcher/stats', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuth();
      if (!ok) { router.push('/login?redirect=/portal/dispatcher'); return; }
      fetchStats();
    };
    init();
  }, [checkAuth, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoadingStats(true);
    await fetchStats();
    await new Promise(r => setTimeout(r, 400));
    setRefreshing(false);
  };

  const STATS = [
    { label: 'Open Loads', value: loadingStats ? null : stats?.openLoads ?? 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'In Transit', value: loadingStats ? null : stats?.inTransit ?? 0, icon: Truck, color: 'text-orange-600 bg-orange-50' },
    { label: 'Delivered Today', value: loadingStats ? null : stats?.deliveredToday ?? 0, icon: CheckCircle2, color: 'text-[#3BAB6B] bg-green-50' },
    { label: 'Escalations', value: loadingStats ? null : stats?.escalations ?? 0, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3BAB6B] flex items-center justify-center text-white">
              <Radio size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 font-poppins">{dispatcherName}</p>
              <p className="text-xs text-gray-500">Dispatcher — Portlandia Logistics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-all font-medium disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => authService.logout()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h1 className="text-3xl font-black text-gray-900 font-poppins mb-1">Dispatch Board</h1>
          <p className="text-gray-500">Assign, monitor, and resolve all active freight in real time.</p>
        </section>

        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon size={22} />
                </div>
                <div>
                  {s.value === null
                    ? <Loader2 size={20} className="animate-spin text-gray-300 mb-1" />
                    : <p className="text-2xl font-black text-gray-900 font-poppins">{s.value}</p>
                  }
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Load Board */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">Active Load Board</h2>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <div className="flex gap-1">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeFilter === f ? 'bg-[#3BAB6B] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 gap-3 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Load #</span><span>Customer</span><span>Origin</span><span>Destination</span><span>Pickup</span><span>Status</span><span className="text-right">Carrier</span>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Truck size={32} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No active loads match the current filter.</p>
              <p className="text-xs text-gray-400 mt-1">Loads entered in McLeod will sync here once the TMS bridge is connected.</p>
            </div>
          </div>
        </section>

        {/* Escalation Queue */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">Escalation Queue</h2>
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
              {loadingStats ? '…' : `${stats?.escalations ?? 0} Open`}
            </span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Load #</span><span>Issue Type</span><span>Reported By</span><span>Age</span><span className="text-right">Priority</span>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 size={28} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">
                {stats?.escalations === 0 ? 'No open escalations. Great work.' : `${stats?.escalations} stale booking(s) awaiting resolution.`}
              </p>
            </div>
          </div>
        </section>

        {/* Check-Call Status */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[#3BAB6B]" /> Late / Missing Check-Calls
          </h2>
          <div className="bg-white border border-gray-100 rounded-2xl">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Load #</span><span>Carrier</span><span>Last Check</span><span>Expected</span><span className="text-right">Action</span>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 size={28} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">All check-calls are current.</p>
            </div>
          </div>
        </section>

        {/* Quick Contacts */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <Phone size={18} className="text-[#3BAB6B]" /> Quick Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { role: 'Operations Lead', contact: 'Available Mon–Fri 7am–7pm CT', method: 'Phone' },
              { role: 'Agent Support Desk', contact: 'Portlandia Operations Desk', method: 'Portal' },
              { role: 'Customer Escalations', contact: 'Escalate via McLeod or email', method: 'Email' },
            ].map((c) => (
              <div key={c.role} className="p-5 bg-white border border-gray-100 rounded-2xl">
                <p className="font-semibold text-gray-900 text-sm">{c.role}</p>
                <p className="text-xs text-gray-500 mt-1">{c.contact}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wide">{c.method}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
