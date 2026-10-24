import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import InteractiveFreightMap from '@/components/InteractiveFreightMap'
import { CITIES, CORRIDORS, MODES } from '@/data/programmatic-seo-matrix'

export function generateStaticParams() {
  return CITIES.map((c) => ({ state: c.stateSlug, city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params
  const ct = CITIES.find((c) => c.stateSlug === state && c.slug === city)
  if (!ct) return { title: 'City Freight Terminal | Portlandia Logistics' }
  return {
    title: `${ct.name}, ${ct.stateAbbr} (${ct.primaryZip}) LTL & 26-Ft Box Truck Freight Terminal | Portlandia Logistics`,
    description: `Instant LTL pallet rates and ${ct.boxTruckDirectRateUsd ? `$${ct.boxTruckDirectRateUsd} Dedicated 26-Ft Straight Box Truck direct delivery` : 'guaranteed LTL service'} across ${ct.industrialParks.join(', ')}.`,
  }
}

export default async function CityTerminalPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state, city } = await params
  const ct = CITIES.find((c) => c.stateSlug === state && c.slug === city)
  if (!ct) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-xs text-slate-500 mb-3">
        <Link href="/locations" className="hover:underline">Locations</Link> /{' '}
        <Link href={`/locations/${ct.stateSlug}`} className="hover:underline">{ct.stateAbbr}</Link> /{' '}
        <span>{ct.name} ({ct.primaryZip})</span> · Published {ct.publishedAt} · Updated {ct.lastModified}
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
        {ct.name}, {ct.stateAbbr} ({ct.primaryZip}) LTL &amp; 26-Ft Straight Box Truck Freight
      </h1>
      <p className="text-slate-600 mt-3 max-w-3xl text-lg">
        Serving {ct.industrialParks.join(', ')} with instant wholesale LTL contract rates (WWEX/GTZ 65+ carriers) and{' '}
        {ct.boxTruckDirectRateUsd
          ? `Same-Day / Next-Day Dedicated 26-Ft Straight Box Truck turns starting at $${ct.boxTruckDirectRateUsd} (operated by Portlandia Electric Supply Fleet · USDOT #7728111).`
          : 'nationwide LTL and FTL dry-van coverage.'}
      </p>

      <InteractiveFreightMap />

      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Industrial Parks &amp; ZIP3 Coverage ({ct.zip3}xx)</h2>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5">
            {ct.industrialParks.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="border border-slate-200 rounded-xl p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Available Modes in {ct.name}, {ct.stateAbbr}</h2>
          <ul className="space-y-2 text-sm">
            {MODES.map((m) => (
              <li key={m.slug}>
                <Link href={`/modes/${m.slug}`} className="text-emerald-700 font-semibold hover:underline">
                  {m.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
