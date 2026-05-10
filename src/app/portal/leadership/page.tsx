"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, User, TrendingUp, Truck, DollarSign, Users,
  BarChart2, Activity, CheckCircle2, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Package, Globe, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

interface KpiData {
  revenueMTD: number;
  revenueChange: number | null;
  loadsMTD: number;
  loadsChange: number | null;
  activeAgents: number;
  grossMarginPct: string;
  onTimePct: string;
  openEscalations: number;
  newCustomersMTD: number;
  carrierCount: number;
  revenueTrend: { _id: string; revenue: number; loads: number }[];
}

export default function LeadershipPortalPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const leaderName = user?.name || 'Leadership';

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuth();
      if (!ok) { router.push('/login?redirect=/portal/leadership'); return; }

      const token = authService.getToken();
      fetch('/api/portal/leadership/kpis', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(res => { if (res.success) setKpis(res.data); })
        .finally(() => setLoading(false));
    };
    init();
  }, [checkAuth, router]);

  const fmt = (n: number, prefix = '') =>
    loading ? null : `${prefix}${n.toLocaleString()}`;

  const KPI_CARDS = [
    { label: 'Total Revenue (MTD)', value: loading ? null : `$${(kpis?.revenueMTD ?? 0).toLocaleString()}`, change: kpis?.revenueChange ?? null, icon: DollarSign, color: 'text-[#3BAB6B] bg-green-50' },
    { label: 'Loads This Month', value: fmt(kpis?.loadsMTD ?? 0), change: kpis?.loadsChange ?? null, icon: Truck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Agents', value: fmt(kpis?.activeAgents ?? 0), change: null, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Gross Margin %', value: loading ? null : (kpis?.grossMarginPct ?? '—'), change: null, icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
    { label: 'On-Time Delivery', value: loading ? null : (kpis?.onTimePct ?? '—'), change: null, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
    { label: 'Open Escalations', value: fmt(kpis?.openEscalations ?? 0), change: null, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
    { label: 'New Customers (MTD)', value: fmt(kpis?.newCustomersMTD ?? 0), change: null, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Carrier Network', value: fmt(kpis?.carrierCount ?? 0), change: null, icon: Globe, color: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3BAB6B] flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 font-poppins">{leaderName}</p>
              <p className="text-xs text-gray-500">Leadership — Portlandia Logistics</p>
            </div>
          </div>
          <button
            onClick={() => authService.logout()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h1 className="text-3xl font-black text-gray-900 font-poppins mb-1">Executive Overview</h1>
          <p className="text-gray-500">Real-time KPIs, team activity, and operational health for Portlandia Logistics.</p>
        </section>

        {/* KPI Grid */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Key Performance Indicators</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {KPI_CARDS.map((k) => (
              <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                  <k.icon size={20} />
                </div>
                {k.value === null
                  ? <Loader2 size={20} className="animate-spin text-gray-300 mb-1" />
                  : <p className="text-2xl font-black text-gray-900 font-poppins">{k.value}</p>
                }
                <p className="text-xs text-gray-500 mt-1 leading-snug">{k.label}</p>
                {k.change !== null && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                    (k.change as number) >= 0 ? 'text-[#3BAB6B]' : 'text-red-500'
                  }`}>
                    {(k.change as number) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(k.change as number)}% vs last month
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Revenue Trend + Activity Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 font-poppins">Revenue Trend</h2>
              <span className="text-xs text-gray-400">Last 30 days</span>
            </div>
            {!loading && kpis && kpis.revenueTrend.length > 0 ? (
              <div className="space-y-2">
                {kpis.revenueTrend.slice(-14).map((d) => {
                  const maxRevenue = Math.max(...kpis.revenueTrend.map(x => x.revenue), 1);
                  const pct = Math.round((d.revenue / maxRevenue) * 100);
                  return (
                    <div key={d._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-20 shrink-0">{d._id.slice(5)}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-[#3BAB6B] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-16 text-right">${d.revenue.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl">
                <div className="text-center">
                  {loading
                    ? <Loader2 size={28} className="animate-spin text-gray-300 mx-auto mb-2" />
                    : <BarChart2 size={36} className="text-gray-200 mx-auto mb-2" />
                  }
                  <p className="text-sm text-gray-400">
                    {loading ? 'Loading...' : 'No revenue data yet for the last 30 days.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 font-poppins mb-4">Activity Feed</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[#3BAB6B] mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-700 leading-snug">
                    {!loading && kpis
                      ? `${kpis.loadsMTD} paid bookings recorded this month.`
                      : 'Loading activity...'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Month-to-date</p>
                </div>
              </div>
              {!loading && kpis && kpis.openEscalations > 0 && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">
                      {kpis.openEscalations} booking(s) stalled in pending_payment for over 24 hours.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Requires attention</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-700 leading-snug">McLeod TMS bridge and reporting pipeline are pending integration.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Phase 2</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Status */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <Users size={18} className="text-[#3BAB6B]" /> Team Status
          </h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Team Member</span><span>Role</span><span>Active Tasks</span><span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { name: 'Alex', role: 'Executive', tasks: '—', status: 'Active' },
                { name: 'Tanya', role: 'Operations Lead', tasks: '—', status: 'Active' },
                { name: 'Byzid', role: 'Infrastructure', tasks: '—', status: 'Active' },
                { name: "Amit's Team", role: 'GTM / Implementation', tasks: '—', status: 'Active' },
                { name: 'Aizaz', role: 'Web / Technical', tasks: '—', status: 'Active' },
              ].map((m) => (
                <div key={m.name} className="grid grid-cols-4 gap-4 px-6 py-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#3BAB6B] text-xs font-black">
                      {m.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{m.role}</span>
                  <span className="text-sm text-gray-900 font-mono">{m.tasks}</span>
                  <div className="flex justify-end">
                    <span className="px-2 py-0.5 bg-green-50 text-[#3BAB6B] text-[10px] font-bold rounded-full uppercase tracking-wide">{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Operational Health */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#3BAB6B]" /> Operational Health
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { system: 'Quote & Booking (GTZShip)', status: 'Operational', color: 'bg-green-50 text-[#3BAB6B]' },
              { system: 'Stripe Payment Processing', status: 'Operational', color: 'bg-green-50 text-[#3BAB6B]' },
              { system: 'Odoo CRM / ERP', status: 'Operational', color: 'bg-green-50 text-[#3BAB6B]' },
              { system: 'McLeod TMS Bridge', status: 'Pending', color: 'bg-yellow-50 text-yellow-600' },
              { system: 'Reporting Pipeline', status: 'Pending', color: 'bg-yellow-50 text-yellow-600' },
              { system: 'AI Agent Layer', status: 'In Setup', color: 'bg-blue-50 text-blue-600' },
            ].map((s) => (
              <div key={s.system} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                <p className="text-sm font-semibold text-gray-900">{s.system}</p>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
