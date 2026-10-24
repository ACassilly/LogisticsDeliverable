import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import InteractiveFreightMap from '@/components/InteractiveFreightMap'
import { MODES } from '@/data/programmatic-seo-matrix'

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ mode: string }> }): Promise<Metadata> {
  const { mode } = await params
  const m = MODES.find((x) => x.slug === mode)
  if (!m) return { title: 'Freight Mode | Portlandia Logistics' }
  return {
    title: `${m.title} | Portlandia Logistics`,
    description: m.description,
  }
}

export default async function ModeDetailPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params
  const m = MODES.find((x) => x.slug === mode)
  if (!m) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-xs text-slate-500 mb-3">
        <Link href="/locations" className="hover:underline">Network</Link> / <span>{m.shortName}</span> · Published {m.publishedAt} · Updated {m.lastModified}
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">{m.title}</h1>
      <p className="text-xl text-emerald-700 font-semibold mt-2">{m.headline}</p>
      <p className="text-slate-600 mt-3 max-w-3xl text-lg">{m.description}</p>

      <div className="my-6 p-5 border border-slate-200 rounded-xl bg-white">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Ideal Shipment Profile (Max {m.maxPallets} Pallets / {m.maxWeightLbs.toLocaleString()} lbs)</h2>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {m.idealFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <InteractiveFreightMap />
    </div>
  )
}
