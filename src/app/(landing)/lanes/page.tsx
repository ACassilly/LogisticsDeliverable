import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import InteractiveFreightMap from '@/components/InteractiveFreightMap'
import { CORRIDORS } from '@/data/programmatic-seo-matrix'

export const metadata: Metadata = {
  title: 'Freight Corridors & Ungated Pallet Rate Tables (LTL vs. 26-Ft Box Truck) | Portlandia Logistics',
  description: 'Compare live 1 to 12 pallet freight rates across Louisville KY, Jeffersonville IN, Indianapolis IN, Cincinnati OH, Columbus OH, Nashville TN, St. Louis MO, and Chicago IL.',
}

export default function LanesIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
        Commercial Freight Corridors &amp; Ungated Pallet Rate Tables
      </h1>
      <p className="text-slate-600 mt-3 max-w-3xl text-lg">
        Transparent side-by-side pallet rate cards comparing 3PL LTL (WWEX/GTZ 65+ carriers) against Dedicated 26-Ft Straight Box Truck direct delivery.
      </p>
      <InteractiveFreightMap />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        {CORRIDORS.map((c) => (
          <Link key={c.slug} href={`/lanes/${c.slug}`} className="border border-slate-200 hover:border-emerald-500 rounded-xl p-5 bg-white block">
            <div className="text-lg font-bold text-slate-900">
              {c.originCity}, {c.originState} ({c.originZip}) → {c.destCity}, {c.destState} ({c.destZip})
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">
              {c.miles} Miles · Highway {c.highways} · Published {c.publishedAt}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
