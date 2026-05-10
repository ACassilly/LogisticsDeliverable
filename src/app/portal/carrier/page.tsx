"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, User, Truck, DollarSign, MapPin,
  CheckCircle2, Clock, FileText, Phone, ArrowRight, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

interface CarrierStats {
  availableLoads: number;
  activeLoads: number;
  completedThisMonth: number;
  pendingSettlement: number;
}

const DOCS = [
  { name: 'Rate Confirmation Template', desc: 'Standard rate con format required for all loads' },
  { name: 'Carrier Packet', desc: 'Onboarding documents and compliance requirements' },
  { name: 'Insurance Requirements', desc: 'Minimum coverage limits and certificate of insurance format' },
  { name: 'W-9 / Direct Deposit', desc: 'Settlement payment setup and tax documentation' },
  { name: 'Fuel Surcharge Schedule', desc: 'Current FSC table and calculation methodology' },
  { name: 'Claims Process', desc: 'How to file a cargo claim and escalation timeline' },
];

export default function CarrierPortalPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const carrierName = user?.name || 'Carrier';

  const [stats, setStats] = useState<CarrierStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuth();
      if (!ok) { router.push('/login?redirect=/portal/carrier'); return; }

      const token = authService.getToken();
      fetch('/api/portal/carrier/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(res => { if (res.success) setStats(res.data); })
        .finally(() => setLoadingStats(false));
    };
    init();
  }, [checkAuth, router]);

  const STATS = [
    { label: 'Available Loads', value: loadingStats ? null : stats?.availableLoads ?? 0, icon: Truck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Loads', value: loadingStats ? null : stats?.activeLoads ?? 0, icon: MapPin, color: 'text-orange-600 bg-orange-50' },
    { label: 'Completed This Month', value: loadingStats ? null : stats?.completedThisMonth ?? 0, icon: CheckCircle2, color: 'text-[#3BAB6B] bg-green-50' },
    { label: 'Pending Settlement', value: loadingStats ? null : (stats ? `$${Number(stats.pendingSettlement).toFixed(2)}` : '$0.00'), icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
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
              <p className="text-sm font-bold text-gray-900 font-poppins">{carrierName}</p>
              <p className="text-xs text-gray-500">{user?.companyName || 'Carrier Account'}</p>
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
          <h1 className="text-3xl font-black text-gray-900 font-poppins mb-1">Carrier Dashboard</h1>
          <p className="text-gray-500">Find loads, manage active freight, and track your settlements.</p>
        </section>

        {/* Stats */}
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

        {/* Available Loads Board */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">Available Loads</h2>
            <span className="text-xs text-gray-400">Refreshes every 5 minutes</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Load #</span>
              <span>Origin</span>
              <span>Destination</span>
              <span>Pickup Date</span>
              <span>Rate</span>
              <span className="text-right">Action</span>
            </div>
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Truck size={32} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No available loads at this time.</p>
              <p className="text-xs text-gray-400 mt-1">Check back shortly — loads are posted throughout the day.</p>
            </div>
          </div>
        </section>

        {/* Active Loads */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4">Active Loads</h2>
          <div className="bg-white border border-gray-100 rounded-2xl">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Load #</span>
              <span>Route</span>
              <span>Pickup</span>
              <span>Status</span>
              <span className="text-right">Update</span>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock size={28} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No loads currently in transit.</p>
            </div>
          </div>
        </section>

        {/* Settlement History */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4">Settlement History</h2>
          <div className="bg-white border border-gray-100 rounded-2xl">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Load #</span>
              <span>Delivery Date</span>
              <span>Gross Rate</span>
              <span>Status</span>
              <span className="text-right">Docs</span>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign size={28} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">Settlement history will appear here after your first completed load.</p>
            </div>
          </div>
        </section>

        {/* Carrier Documents */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <FileText size={18} className="text-[#3BAB6B]" /> Carrier Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCS.map((d) => (
              <div key={d.name} className="p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all">
                <p className="font-semibold text-gray-900 text-sm mb-1">{d.name}</p>
                <p className="text-xs text-gray-500 mb-3 leading-snug">{d.desc}</p>
                <button className="flex items-center gap-1 text-xs text-[#3BAB6B] font-semibold hover:underline">
                  Download <ArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section>
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-[#3BAB6B]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Carrier Support Line</p>
              <p className="text-xs text-gray-500">For load inquiries, settlement disputes, and document requests — contact your Portlandia dispatcher.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
