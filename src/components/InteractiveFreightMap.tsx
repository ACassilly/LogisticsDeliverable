"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { CITIES, CORRIDORS, STATES } from '@/data/programmatic-seo-matrix'

export default function InteractiveFreightMap() {
  const [selectedCorridorSlug, setSelectedCorridorSlug] = useState(CORRIDORS[0].slug)
  const [pallets, setPallets] = useState(6)
  const [weightPerPallet, setWeightPerPallet] = useState(1200)
  const [liftgate, setLiftgate] = useState(false)

  const selectedCorridor = CORRIDORS.find((c) => c.slug === selectedCorridorSlug) || CORRIDORS[0]
  const totalWeight = pallets * weightPerPallet
  const estLtlRate = Math.round(145 + pallets * 115 + (totalWeight / 100) * 4.2 + (liftgate ? 95 : 0))
  const isMetro = selectedCorridor.zone === 'METRO_LOCAL'
  const baseBox = isMetro ? 475 : 795
  const weightAdder = !isMetro && totalWeight > 5000 ? Math.round((totalWeight - 5000) * 0.04) : 0
  const estBoxTruckRate = baseBox + weightAdder + (liftgate ? 75 : 0)
  const boxTruckWins = pallets >= 4 || estBoxTruckRate <= estLtlRate

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 p-6 md:p-8 shadow-2xl my-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Interactive 3-Zone Coverage &amp; Dual-Lane Rate Map
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Compare 65+ Carrier LTL vs. Dedicated 26-Ft Straight Box Truck
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Ungated instant rate comparison — see why 4 to 12 pallets ship faster and cheaper on a direct 26-ft box truck with zero terminal cross-docking.
          </p>
        </div>
        <Link
          href="/quote"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition shrink-0"
        >
          Lock Instant Quote &amp; Print BOL →
        </Link>
      </div>

      {/* 3 Zone Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-4">
          <div className="text-xs font-bold uppercase text-emerald-400">Zone 1 · 0–50 Mile Metro Core</div>
          <div className="text-lg font-bold mt-1">Louisville KY ↔ River Ridge IN (47130)</div>
          <div className="text-sm text-slate-300 mt-1">
            <b>$475 Flat Direct 26-Ft Box Truck Turn</b> (1–12 Pallets · Same-Day 2–4 Hr Direct · Zero Cross-Dock · USDOT #7728111)
          </div>
        </div>
        <div className="bg-teal-950/50 border border-teal-500/40 rounded-xl p-4">
          <div className="text-xs font-bold uppercase text-teal-400">Zone 2 · 50–350 Mile Regional Overflow</div>
          <div className="text-lg font-bold mt-1">KY · IN · OH · TN · IL · MO · WV</div>
          <div className="text-sm text-slate-300 mt-1">
            <b>$795+ Dedicated 26-Ft Straight Truck</b> or <b>1-Day Regional LTL</b> across Indianapolis, Cincinnati, Columbus, Nashville, St. Louis &amp; Chicago.
          </div>
        </div>
        <div className="bg-blue-950/50 border border-blue-500/40 rounded-xl p-4">
          <div className="text-xs font-bold uppercase text-blue-400">Zone 3 · 48-State National 3PL Network</div>
          <div className="text-lg font-bold mt-1">WWEX &amp; GlobalTranz Tier-1 Tariffs</div>
          <div className="text-sm text-slate-300 mt-1">
            <b>65+ Contract LTL &amp; FTL Carriers</b> with automated NMFC density calculation, guaranteed transit windows, and live PRO# tracking.
          </div>
        </div>
      </div>

      {/* Interactive Corridor & Pallet Crossover Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">1. Select Corridor &amp; Pallet Count</h3>
            <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Freight Corridor</label>
            <select
              value={selectedCorridorSlug}
              onChange={(e) => setSelectedCorridorSlug(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white mb-4"
            >
              {CORRIDORS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.originCity}, {c.originState} ({c.originZip}) → {c.destCity}, {c.destState} ({c.destZip}) · {c.miles} mi
                </option>
              ))}
            </select>

            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Standard 48&quot;×40&quot; Pallets: <b className="text-emerald-400">{pallets} Pallets</b></span>
                <span className="text-slate-400">Max 12 on 26-Ft Box Truck</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={pallets}
                onChange={(e) => setPallets(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Avg Weight per Pallet: <b className="text-emerald-400">{weightPerPallet.toLocaleString()} lbs</b></span>
                <span className="text-slate-400">Total: {totalWeight.toLocaleString()} lbs</span>
              </div>
              <input
                type="range"
                min={400}
                max={1400}
                step={100}
                value={weightPerPallet}
                onChange={(e) => setWeightPerPallet(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={liftgate}
                onChange={(e) => setLiftgate(e.target.checked)}
                className="accent-emerald-400 w-4 h-4"
              />
              Require Hydraulic Liftgate Pickup / Delivery (+$75 Box Truck / +$95 LTL)
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-2 gap-3">
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <div className="text-xs text-slate-400">3PL LTL Estimate (WWEX/GTZ)</div>
              <div className="text-xl font-bold text-white mt-0.5">${estLtlRate.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">1–3 Days · Terminal Cross-Dock</div>
            </div>
            <div className={`rounded-lg p-3 border ${boxTruckWins ? 'bg-emerald-950/80 border-emerald-400' : 'bg-slate-900 border-slate-700'}`}>
              <div className="text-xs text-emerald-300 font-semibold">Dedicated 26-Ft Box Truck</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">${estBoxTruckRate.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-200">Same-Day / Next-AM Direct</div>
            </div>
          </div>
        </div>

        {/* SVG Hub & Corridor Map */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Hub Network Centered at Jeffersonville IN (47130) &amp; Louisville KY (40202)
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              Highway: {selectedCorridor.highways} ({selectedCorridor.miles} mi)
            </span>
          </div>
          <svg viewBox="0 0 640 320" className="w-full h-56 md:h-64 bg-slate-900/60 rounded-lg border border-slate-800">
            {/* Outer Zone 2 Regional Ring */}
            <circle cx="320" cy="170" r="135" fill="rgba(20, 184, 166, 0.08)" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="5 5" />
            {/* Inner Zone 1 Metro Core Ring */}
            <circle cx="320" cy="170" r="46" fill="rgba(16, 185, 129, 0.18)" stroke="#10b981" strokeWidth="2" />
            {/* Corridor Spokes from Louisville/Jeffersonville (320,170) */}
            <line x1="320" y1="170" x2="310" y2="82" stroke="#34d399" strokeWidth="2.5" />
            <line x1="320" y1="170" x2="405" y2="115" stroke="#34d399" strokeWidth="2.5" />
            <line x1="320" y1="170" x2="465" y2="95" stroke="#2dd4bf" strokeWidth="2" />
            <line x1="320" y1="170" x2="295" y2="265" stroke="#2dd4bf" strokeWidth="2" />
            <line x1="320" y1="170" x2="180" y2="145" stroke="#2dd4bf" strokeWidth="2" />
            <line x1="320" y1="170" x2="255" y2="40" stroke="#38bdf8" strokeWidth="2" />
            <line x1="320" y1="170" x2="375" y2="185" stroke="#34d399" strokeWidth="2" />

            {/* Hub Nodes */}
            <circle cx="320" cy="170" r="8" fill="#10b981" />
            <text x="332" y="174" fill="#ffffff" fontSize="11" fontWeight="bold">Louisville KY / River Ridge IN (47130)</text>

            <circle cx="310" cy="82" r="5" fill="#34d399" />
            <text x="225" y="85" fill="#e2e8f0" fontSize="10">Indianapolis IN (114 mi)</text>

            <circle cx="405" cy="115" r="5" fill="#34d399" />
            <text x="414" y="119" fill="#e2e8f0" fontSize="10">Cincinnati OH (100 mi)</text>

            <circle cx="465" cy="95" r="5" fill="#2dd4bf" />
            <text x="474" y="99" fill="#cbd5e1" fontSize="10">Columbus OH (206 mi)</text>

            <circle cx="295" cy="265" r="5" fill="#2dd4bf" />
            <text x="305" y="269" fill="#cbd5e1" fontSize="10">Nashville TN (175 mi)</text>

            <circle cx="180" cy="145" r="5" fill="#2dd4bf" />
            <text x="85" y="148" fill="#cbd5e1" fontSize="10">St. Louis MO (261 mi)</text>

            <circle cx="255" cy="40" r="5" fill="#38bdf8" />
            <text x="155" y="44" fill="#cbd5e1" fontSize="10">Chicago IL (297 mi)</text>

            <circle cx="375" cy="185" r="4.5" fill="#34d399" />
            <text x="384" y="190" fill="#cbd5e1" fontSize="10">Lexington KY (78 mi)</text>
          </svg>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {STATES.slice(0, 8).map((s) => (
              <Link
                key={s.slug}
                href={`/locations/${s.slug}`}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md"
              >
                {s.name} ({s.abbr}) →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
