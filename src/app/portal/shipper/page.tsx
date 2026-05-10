"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, User, Truck, Package, BarChart2, Clock,
  CheckCircle2, ArrowRight, Plus, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

interface ShipperStats {
  activeShipments: number;
  deliveredThisMonth: number;
  pendingPayment: number;
  totalShipments: number;
}

interface Booking {
  _id: string;
  quoteId: string;
  pickup: { city: string; state: string };
  delivery: { city: string; state: string };
  serviceType?: string;
  status: string;
  totalRate: number;
  createdAt: string;
}

const QUICK_ACTIONS = [
  { label: 'Request a Quote', desc: 'Get an instant LTL rate', href: 'https://portlandialogistics.com/quote', primary: true },
  { label: 'Track a Shipment', desc: 'Check real-time status', href: 'https://portlandialogistics.com/track', primary: false },
];

const STATUS_BADGE: Record<string, string> = {
  paid: 'bg-green-50 text-[#3BAB6B]',
  pending_payment: 'bg-yellow-50 text-yellow-600',
  expired: 'bg-gray-100 text-gray-500',
  failed: 'bg-red-50 text-red-500',
};

export default function ShipperPortalPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const shipperName = user?.name || 'Shipper';

  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuth();
      if (!ok) { router.push('/login?redirect=/portal/shipper'); return; }

      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats and bookings in parallel
      Promise.all([
        fetch('/api/portal/shipper/stats', { headers }).then(r => r.json()),
        fetch('/api/portal/shipper/bookings?limit=10', { headers }).then(r => r.json()),
      ]).then(([statsRes, bookingsRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (bookingsRes.success) setBookings(bookingsRes.data.bookings);
      }).finally(() => {
        setLoadingStats(false);
        setLoadingBookings(false);
      });
    };
    init();
  }, [checkAuth, router]);

  const STATS = [
    { label: 'Active Shipments', value: loadingStats ? null : stats?.activeShipments ?? 0, icon: Truck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Delivered This Month', value: loadingStats ? null : stats?.deliveredThisMonth ?? 0, icon: CheckCircle2, color: 'text-[#3BAB6B] bg-green-50' },
    { label: 'Pending Payment', value: loadingStats ? null : stats?.pendingPayment ?? 0, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Total Shipments', value: loadingStats ? null : stats?.totalShipments ?? 0, icon: Package, color: 'text-purple-600 bg-purple-50' },
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
              <p className="text-sm font-bold text-gray-900 font-poppins">{shipperName}</p>
              <p className="text-xs text-gray-500">{user?.companyName || 'Shipper Account'}</p>
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
          <h1 className="text-3xl font-black text-gray-900 font-poppins mb-1">Welcome back, {shipperName.split(' ')[0]}</h1>
          <p className="text-gray-500">Manage your freight — quote, book, and track all in one place.</p>
        </section>

        {/* KPI Stats */}
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
                  <p className="text-xs text-gray-500 leading-snug mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all group ${
                  a.primary
                    ? 'bg-[#3BAB6B] border-transparent text-white hover:opacity-90 shadow-lg shadow-[#3BAB6B]/20'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div>
                  <p className={`font-bold text-lg font-poppins ${a.primary ? 'text-white' : 'text-gray-900'}`}>{a.label}</p>
                  <p className={`text-sm mt-0.5 ${a.primary ? 'text-green-100' : 'text-gray-500'}`}>{a.desc}</p>
                </div>
                <ArrowRight size={22} className={`shrink-0 group-hover:translate-x-1 transition-transform ${a.primary ? 'text-white' : 'text-gray-400'}`} />
              </a>
            ))}
          </div>
        </section>

        {/* Recent Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-poppins">Recent Bookings</h2>
            <Link href="/portal/shipper/bookings" className="text-sm text-[#3BAB6B] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Booking ID</span>
              <span>Origin → Dest</span>
              <span>Service</span>
              <span>Status</span>
              <span className="text-right">Rate</span>
            </div>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <Truck size={28} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No bookings yet</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">Once you book a shipment it will appear here with live status updates.</p>
                <a
                  href="https://portlandialogistics.com/quote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#3BAB6B] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                >
                  <Plus size={16} /> Book Your First Shipment
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <div key={b._id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-mono text-gray-600">#{b.quoteId.slice(-8).toUpperCase()}</span>
                    <span className="text-sm text-gray-700">{b.pickup.city}, {b.pickup.state} → {b.delivery.city}, {b.delivery.state}</span>
                    <span className="text-xs text-gray-500">{b.serviceType || 'LTL'}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit ${
                      STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-500'
                    }`}>{b.status.replace('_', ' ')}</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">${b.totalRate.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Monthly summary */}
        {!loadingStats && stats && stats.totalShipments > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 font-poppins">Activity Summary</h2>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart2 size={32} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">Revenue chart coming soon — connects to Odoo reporting pipeline.</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
