import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import InteractiveFreightMap from '@/components/InteractiveFreightMap'
import { STATES, CITIES, CORRIDORS, MODES } from '@/data/programmatic-seo-matrix'

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params
  const st = STATES.find((s) => s.slug === state)
  if (!st) return { title: 'State Freight Hub | Portlandia Logistics' }
  return {
    title: `${st.name} (${st.abbr}) LTL & 26-Ft Straight Box Truck Freight Shipping | Portlandia Logistics`,
    description: `${st.summary} Compare instant ungated LTL pallet rates and dedicated 26-ft box truck direct turns across ${st.majorHubs.join(', ')}.`,
  }
}

export default async function StateHubPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const st = STATES.find((s) => s.slug === state)
  if (!st) notFound()
  const stateCities = CITIES.filter((c) => c.stateSlug === st.slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-xs text-slate-500 mb-3">
        <Link href="/locations" className="hover:underline">Locations</Link> / <span>{st.name} ({st.abbr})</span> · Published {st.publishedAt} · Updated {st.lastModified}
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
        {st.name} ({st.abbr}) LTL &amp; Dedicated 26-Ft Box Truck Freight Hub
      </h1>
      <p className="text-slate-600 mt-3 max-w-3xl text-lg">{st.summary}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <div className="text-xs font-bold uppercase text-slate-400">Primary Freight Corridors</div>
          <div className="text-base font-bold text-slate-900 mt-1">{st.primaryHighways.join(' · ')}</div>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <div className="text-xs font-bold uppercase text-slate-400">Major Commercial Hubs</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">{st.majorHubs.join(', ')}</div>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl bg-white">
          <div className="text-xs font-bold uppercase text-slate-400">26-Ft Box Truck Direct Overflow</div>
          <div className="text-sm font-bold text-emerald-700 mt-1">
            {st.boxTruckEligible ? 'Eligible — Direct Door-to-Door via PES Fleet (USDOT #7728111)' : 'National 3PL LTL / FTL Network (WWEX / GTZ)'}
          </div>
        </div>
      </div>

      <InteractiveFreightMap />

      {stateCities.length > 0 && (
        <section className="my-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{st.name} Commercial City Terminals &amp; Industrial Parks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateCities.map((ct) => (
              <Link
                key={ct.slug}
                href={`/locations/${st.slug}/${ct.slug}`}
                className="border border-slate-200 hover:border-emerald-500 rounded-xl p-4 bg-white block"
              >
                <div className="font-bold text-slate-900">{ct.name}, {ct.stateAbbr} ({ct.primaryZip})</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">
                  {ct.boxTruckDirectRateUsd ? `26-Ft Box Truck Turn: $${ct.boxTruckDirectRateUsd}` : `LTL Transit: ${ct.ltlTransitDays} Day(s)`}
                </div>
                <div className="text-xs text-slate-500 mt-2">{ct.industrialParks.join(' · ')}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Freight Modes in {st.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.map((m) => (
            <Link key={m.slug} href={`/modes/${m.slug}`} className="border border-slate-200 rounded-xl p-4 bg-white block hover:border-emerald-500">
              <div className="font-bold text-slate-900">{m.title}</div>
              <p className="text-xs text-slate-600 mt-1">{m.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
