"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, User, BookOpen, FileText, Video, Wrench, LifeBuoy,
  ExternalLink, ChevronRight, Truck, Package, Phone, Mail,
  ClipboardList, ShieldCheck, BarChart2, HelpCircle, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

const QUICK_ACTIONS = [
  { label: 'Help Desk', icon: LifeBuoy, color: 'bg-blue-50 text-blue-600', href: '#support' },
  { label: 'New Customer Setup', icon: Package, color: 'bg-green-50 text-[#3BAB6B]', href: '#customer-setup' },
  { label: 'Carrier Override', icon: ShieldCheck, color: 'bg-orange-50 text-orange-600', href: '#carrier-compliance' },
  { label: 'Dispatch Checklist', icon: ClipboardList, color: 'bg-purple-50 text-purple-600', href: '#daily-tools' },
  { label: 'LTL Quote', icon: BarChart2, color: 'bg-teal-50 text-teal-600', href: 'https://portlandialogistics.com/quote', external: true },
  { label: 'Track Shipment', icon: Truck, color: 'bg-indigo-50 text-indigo-600', href: 'https://portlandialogistics.com/track', external: true },
];

const IMPORTANT_DOCUMENTS = [
  { name: 'Customer Setup Form', desc: 'New shipper onboarding form — fill out before first shipment', badge: 'Required' },
  { name: 'Customer Setup Packet', desc: 'Complete packet with instructions, authority docs, and contacts', badge: 'Required' },
  { name: 'Dispatch Checklist', desc: 'Step-by-step checklist for every load before dispatch', badge: 'Daily Use' },
  { name: 'Quick Reference Sheet', desc: 'Common codes, contacts, and SOPs at a glance', badge: 'Daily Use' },
  { name: 'Highway FAQs', desc: 'Carrier vetting answers and escalation workflows', badge: 'Reference' },
  { name: 'QuikSkope Guide', desc: 'Carrier monitoring and compliance screening guide', badge: 'Reference' },
];

const OTHER_DOCUMENTS = [
  { name: 'Broker Authority', desc: 'Current broker authority certificate' },
  { name: 'W-9 / Payee Info', desc: 'Tax and payment documentation for carriers' },
  { name: 'Bond & Insurance', desc: 'Surety bond and cargo insurance certificates' },
  { name: 'SCAC Code', desc: 'Standard carrier alpha code for EDI and BOL use' },
  { name: 'SmartWay Certificate', desc: 'EPA SmartWay partner compliance certificate' },
  { name: 'McLeod Shortcuts', desc: 'TMS keyboard shortcuts and power-user reference' },
  { name: 'Email Signature Template', desc: 'Portlandia-branded email signature setup guide' },
  { name: 'Credit References', desc: 'Vendor credit reference sheet for new carrier setups' },
];

const DAILY_TOOLS = [
  { name: 'McLeod PowerBroker TMS', desc: 'Primary TMS for order entry, dispatch, and settlement', color: 'bg-slate-700', href: '#' },
  { name: 'Highway Carrier Vetting', desc: 'Real-time carrier identity verification and fraud prevention', color: 'bg-blue-700', href: '#' },
  { name: 'Load Lock', desc: 'Load tracking and visibility platform', color: 'bg-green-700', href: '#' },
  { name: 'QuikSkope', desc: 'Carrier compliance scoring and monitoring', color: 'bg-orange-600', href: '#' },
  { name: 'GTZShip / GlobalTranz', desc: 'LTL quoting and tendering platform', color: 'bg-teal-700', href: 'https://portlandialogistics.com/quote', external: true },
  { name: 'Trucker Tools', desc: 'Carrier app for load tracking and driver communication', color: 'bg-purple-700', href: '#' },
];

const TRAINING_VIDEOS = [
  { section: 'TMS — McLeod PowerBroker', videos: [
    { title: 'Customer & Order Entry Walkthrough', desc: 'Setting up new customers and entering loads' },
    { title: 'Dispatch & Load Assignment', desc: 'Assigning carriers and confirming coverage' },
    { title: 'Settlement & Invoicing', desc: 'AP/AR process and document attachment' },
    { title: 'Reporting & Dashboards', desc: 'Pulling operational and financial reports' },
  ]},
  { section: 'Carrier Vetting — Highway', videos: [
    { title: 'Running Carrier Identity Checks', desc: 'Step-by-step carrier vetting before dispatch' },
    { title: 'Fraud Flags & Override Workflow', desc: 'What to do when Highway flags a carrier' },
  ]},
  { section: 'Load Tracking — Load Lock', videos: [
    { title: 'Setting Up Load Visibility', desc: 'How to activate and monitor Load Lock on a shipment' },
    { title: 'Exception Handling & Alerts', desc: 'Responding to late or missing check-calls' },
  ]},
  { section: 'LTL — GlobalTranz / GTZShip', videos: [
    { title: 'LTL Quote-to-Book Flow', desc: 'Getting a rate and booking LTL freight end-to-end' },
    { title: 'BOL & Label Generation', desc: 'Creating Bills of Lading and pallet labels' },
    { title: 'Claims & Dispute Process', desc: 'Filing and tracking LTL freight claims' },
  ]},
];

export default function AgentPortalPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const agentName = user?.name || 'Agent';

  useEffect(() => {
    const verify = async () => {
      const ok = await checkAuth();
      if (!ok) router.push('/login?redirect=/portal/agent');
    };
    verify();
  }, [checkAuth, router]);

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3BAB6B] flex items-center justify-center text-white font-bold">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 font-poppins">{agentName}</p>
              <p className="text-xs text-gray-500">Agent — Portlandia Logistics</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-14">
        {/* Hero */}
        <section>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] flex items-center justify-center">
              <BookOpen size={24} className="text-[#3BAB6B]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 font-poppins">Agent Resource Center</h1>
              <p className="text-gray-500 mt-1">Everything you need to operate — tools, documents, training, and support in one place.</p>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700 font-semibold">
            <AlertCircle size={13} />
            Phase 1 · Current Systems Powered by Pearce
          </div>
        </section>

        {/* Quick Actions */}
        <section id="quick-actions">
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <a
                key={a.label}
                href={a.href}
                target={a.external ? '_blank' : undefined}
                rel={a.external ? 'noopener noreferrer' : undefined}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                  <a.icon size={20} />
                </div>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{a.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Daily Tools */}
        <section id="daily-tools">
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-[#3BAB6B]" /> Daily Tools & Platforms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAILY_TOOLS.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target={t.external ? '_blank' : undefined}
                rel={t.external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${t.color}`}>
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{t.desc}</p>
                </div>
                <ExternalLink size={14} className="text-gray-300 group-hover:text-[#3BAB6B] shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </section>

        {/* Important Documents */}
        <section id="customer-setup">
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <FileText size={18} className="text-[#3BAB6B]" /> Important Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMPORTANT_DOCUMENTS.map((d) => (
              <div key={d.name} className="p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{d.name}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    d.badge === 'Required' ? 'bg-red-50 text-red-600' :
                    d.badge === 'Daily Use' ? 'bg-green-50 text-[#3BAB6B]' :
                    'bg-gray-100 text-gray-500'
                  }`}>{d.badge}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
                <button className="self-start flex items-center gap-1 text-xs text-[#3BAB6B] font-semibold hover:underline">
                  Download <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Other Documents */}
        <section id="carrier-compliance">
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#3BAB6B]" /> Carrier Compliance & Other Docs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {OTHER_DOCUMENTS.map((d) => (
              <div key={d.name} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                <p className="font-semibold text-gray-900 text-sm mb-1">{d.name}</p>
                <p className="text-xs text-gray-500 mb-3 leading-snug">{d.desc}</p>
                <button className="flex items-center gap-1 text-xs text-[#3BAB6B] font-semibold hover:underline">
                  Download <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Training Videos */}
        <section id="training">
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-6 flex items-center gap-2">
            <Video size={18} className="text-[#3BAB6B]" /> Training Library
          </h2>
          <div className="space-y-8">
            {TRAINING_VIDEOS.map((section) => (
              <div key={section.section}>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{section.section}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {section.videos.map((v) => (
                    <div key={v.title} className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all cursor-pointer group">
                      <div className="w-full aspect-video bg-gray-100 rounded-xl mb-3 flex items-center justify-center group-hover:bg-[#DCFCE7] transition-colors">
                        <Video size={28} className="text-gray-300 group-hover:text-[#3BAB6B] transition-colors" />
                      </div>
                      <p className="font-semibold text-gray-900 text-xs leading-snug mb-1">{v.title}</p>
                      <p className="text-xs text-gray-500 leading-snug">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section id="support">
          <h2 className="text-lg font-bold text-gray-900 font-poppins mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-[#3BAB6B]" /> Support & Help Desk
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="mailto:support@portlandialogistics.com" className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Email Support</p>
                <p className="text-xs text-gray-500">support@portlandialogistics.com</p>
              </div>
            </a>
            <a href="tel:+1-800-000-0000" className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Phone size={20} className="text-[#3BAB6B]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Operations Line</p>
                <p className="text-xs text-gray-500">Available Mon–Fri 7am–7pm CT</p>
              </div>
            </a>
            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <LifeBuoy size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Help Desk Portal</p>
                <p className="text-xs text-gray-500">Submit tickets and track requests</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
