import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import InteractiveFreightMap from '@/components/InteractiveFreightMap'
import { CORRIDORS } from '@/data/programmatic-seo-matrix'

export function generateStaticParams() {
  return CORRIDORS.map((c) => ({ corridor: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ corridor: string }> }): Promise<Metadata> {
  const { corridor } = await params
  const c = CORRIDORS.find((x) => x.slug === corridor)
  if (!c) return { title: 'Freight Corridor | Portlandia Logistics' }
  return {
    title: `${c.originCity}, ${c.originState} to ${c.destCity}, ${c.destState} LTL & 26-Ft Box Truck Freight Rates | Portlandia Logistics`,
    description: `Instant ungated pallet rates from ${c.originCity}, ${c.originState} (${c.originZip}) to ${c.destCity}, ${c.destState} (${c.destZip}) (${c.miles} mi via ${c.highways}). Compare 1–12 pallet LTL vs. Dedicated 26-Ft Straight Box Truck direct turns.`,
  }
}

export default async function CorridorDetailPage({ params }: { params: Promise<{ corridor: string }> }) {
  const { corridor } = await params
  const c = CORRIDORS.find((x) => x.slug === corridor)
  if (!c) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-xs text-slate-500 mb-3">
        <Link href="/lanes" className="hover:underline">Corridors</Link> / <span>{c.originCity} to {c.destCity}</span> · Published {c.publishedAt} · Updated {c.lastModified}
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
        {c.originCity}, {c.originState} ({c.originZip}) → {c.destCity}, {c.destState} ({c.destZip}) Estimated Lane Planning Rate Card
      </h1>
      <p className="text-slate-600 mt-3 max-w-3xl text-lg">
        {c.miles} miles via {c.highways}. Compare standard 3PL LTL hub-and-spoke pricing against our Same-Day / Next-AM Dedicated 26-Ft Straight Box Truck overflow lane (zero terminal cross-docking).
      </p>

      <div className="my-8 overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-3.5">Pallets &amp; Weight</th>
              <th className="p-3.5">3PL LTL Rate (WWEX/GTZ)</th>
              <th className="p-3.5">Dedicated 26-Ft Box Truck Direct</th>
              <th className="p-3.5">Recommended Dual-Lane Selection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {c.sampleRates.map((r) => (
              <tr key={r.pallets} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">{r.pallets} Pallet(s) · {r.weightLbs.toLocaleString()} lbs</td>
                <td className="p-3.5">${r.ltlRateUsd.toLocaleString()} ({r.ltlTransitDays})</td>
                <td className="p-3.5 font-bold text-emerald-700">
                  {r.boxTruckRateUsd ? `$${r.boxTruckRateUsd.toLocaleString()} (${r.boxTruckTransitDays})` : 'LTL / FTL Only'}
                </td>
                <td className="p-3.5 text-slate-700">{r.recommendedLane}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InteractiveFreightMap />
    </div>
  )
}
