import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import InteractiveFreightMap from '@/components/InteractiveFreightMap'
import { STATES, CITIES, MODES, CORRIDORS, COMPETITOR_BENCHMARKS } from '@/data/programmatic-seo-matrix'

export const metadata: Metadata = {
  title: 'Freight Shipping Locations, Terminal Hubs & 26-Ft Box Truck Corridors | Portlandia Logistics',
  description: 'Explore 50-state LTL contract tariffs (WWEX/GTZ 65+ carriers) and $475 Metro / $795+ Regional Dedicated 26-Ft Straight Box Truck corridors across Kentucky, Indiana, Ohio, Tennessee, Illinois, and Missouri.',
}

export default function LocationsIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Dual-Engine Freight Network · State × City × Mode × Corridor Matrix
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2">
          National 3PL LTL Network &amp; Regional 26-Ft Straight Box Truck Hubs
        </h1>
        <p className="text-slate-600 mt-3 max-w-3xl text-lg">
          Unlike TQL, C.H. Robinson, and Flexport — which hide rates behind cold-call lead forms — Portlandia Logistics publishes ungated pallet rate cards across 65+ Tier-1 LTL carriers and our asset-backed 26-ft straight box truck overflow fleet (USDOT #7728111).
        </p>
      </div>

      <InteractiveFreightMap />

      {/* State Hubs */}
      <section className="my-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Priority Freight States &amp; Corridor Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STATES.map((st) => (
            <Link
              key={st.slug}
              href={`/locations/${st.slug}`}
              className="border border-slate-200 hover:border-emerald-500 rounded-xl p-5 bg-white shadow-sm transition block"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-slate-900">{st.name} ({st.abbr})</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {st.zone.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{st.summary}</p>
              <div className="text-xs text-slate-500">
                <b>Highways:</b> {st.primaryHighways.join(', ')} · <b>Published:</b> {st.publishedAt}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* City Terminals */}
      <section className="my-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Commercial City Terminals &amp; Industrial Parks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CITIES.map((ct) => (
            <Link
              key={`${ct.stateSlug}-${ct.slug}`}
              href={`/locations/${ct.stateSlug}/${ct.slug}`}
              className="border border-slate-200 hover:border-emerald-500 rounded-xl p-4 bg-white shadow-sm transition block"
            >
              <div className="font-bold text-slate-900">
                {ct.name}, {ct.stateAbbr} ({ct.primaryZip})
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                {ct.boxTruckDirectRateUsd ? `26-Ft Box Truck Direct: $${ct.boxTruckDirectRateUsd} · ` : ''}
                LTL Transit: {ct.ltlTransitDays} Day(s)
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {ct.industrialParks.slice(0, 2).join(' · ')}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Corridors & Modes */}
      <section className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-3">High-Volume Origin → Destination Corridors</h2>
          <ul className="space-y-2.5 text-sm">
            {CORRIDORS.map((c) => (
              <li key={c.slug}>
                <Link href={`/lanes/${c.slug}`} className="text-emerald-700 hover:underline font-semibold">
                  {c.originCity}, {c.originState} → {c.destCity}, {c.destState} ({c.miles} mi · {c.highways})
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Freight Equipment &amp; Service Modes</h2>
          <ul className="space-y-2.5 text-sm">
            {MODES.map((m) => (
              <li key={m.slug}>
                <Link href={`/modes/${m.slug}`} className="text-emerald-700 hover:underline font-semibold">
                  {m.title}
                </Link>
                <div className="text-xs text-slate-500">{m.headline}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="my-12 border border-slate-200 rounded-xl p-6 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Why Shippers Switch from TQL, C.H. Robinson &amp; Flexport</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMPETITOR_BENCHMARKS.map((cb) => (
            <div key={cb.name} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-bold text-slate-900">{cb.name}</div>
              <p className="text-xs text-red-700 mt-2"><b>Legacy Broker Gap:</b> {cb.weakness}</p>
              <p className="text-xs text-emerald-800 mt-2"><b>Portlandia Dual-Lane Edge:</b> {cb.portlandiaAdvantage}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
