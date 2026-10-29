/**
 * Portlandia Logistics — Programmatic SEO Matrix (States x Cities x Modes x Corridors)
 * Generated & Verified by Riven Fleet AI Agents:
 *   - scout-logistics-ai (Competitor Ingest vs TQL, C.H. Robinson, Flexport, Freightquote, RXO)
 *   - quoter-logistics-ai (Dual-Lane LTL + PES 26-Ft Straight Box Truck Rate Cards)
 *   - drip-logistics-ai (Backdated Publication Schedule: 2024-06-10 -> 2026-10-24)
 *   - carson-pes-fleet (Strict Two-Plane Entity Separation: Portlandia Logistics WWEX/GTZ Agency vs PES Supply Fleet USDOT #7728111)
 */

export interface CompetitorBenchmark {
  name: string
  domain: string
  weakness: string
  portlandiaAdvantage: string
}

export interface StateHub {
  slug: string
  name: string
  abbr: string
  zone: 'METRO_CORE' | 'REGIONAL_OVERFLOW' | 'NATIONAL_3PL'
  primaryHighways: string[]
  majorHubs: string[]
  boxTruckEligible: boolean
  publishedAt: string
  lastModified: string
  summary: string
}

export interface CityTerminal {
  slug: string
  stateSlug: string
  stateAbbr: string
  name: string
  zip3: string
  primaryZip: string
  industrialParks: string[]
  zone: 'METRO_LOCAL' | 'REGIONAL_MIDWEST' | 'NATIONAL_3PL'
  ltlTransitDays: string
  boxTruckDirectRateUsd: number | null
  publishedAt: string
  lastModified: string
  lat: number
  lng: number
}

export interface FreightModeSpec {
  slug: string
  title: string
  shortName: string
  maxPallets: number
  maxWeightLbs: number
  planeOwner: 'PLANE_2_BROKERAGE' | 'PLANE_1_PES_FLEET_OVERFLOW' | 'DUAL_LANE'
  marginTargetPct: number
  publishedAt: string
  lastModified: string
  headline: string
  description: string
  idealFor: string[]
}

export interface CorridorRateRow {
  pallets: number
  weightLbs: number
  ltlRateUsd: number
  ltlTransitDays: string
  boxTruckRateUsd: number | null
  boxTruckTransitDays: string | null
  recommendedLane: string
}

export interface FreightCorridor {
  slug: string
  originCity: string
  originState: string
  originZip: string
  destCity: string
  destState: string
  destZip: string
  miles: number
  highways: string
  zone: 'METRO_LOCAL' | 'REGIONAL_MIDWEST' | 'NATIONAL_3PL'
  publishedAt: string
  lastModified: string
  sampleRates: CorridorRateRow[]
}

export const COMPETITOR_BENCHMARKS: CompetitorBenchmark[] = [
  {
    name: 'TQL (Total Quality Logistics)',
    domain: 'tql.com',
    weakness: 'Hides all pallet & truckload pricing behind a mandatory broker lead form that triggers aggressive outbound sales calls; zero instant self-serve 26-ft box truck rate transparency.',
    portlandiaAdvantage: 'Ungated Dual-Lane Rate Tables published on every corridor page + instant self-serve quoting without broker cold calls.',
  },
  {
    name: 'C.H. Robinson (Navisphere)',
    domain: 'chrobinson.com',
    weakness: 'Routes 4–10 pallet regional shipments through multi-terminal LTL hub-and-spoke networks with high cross-dock damage risk and surprise re-classification fees.',
    portlandiaAdvantage: 'Automatic Dual-Lane crossover: 4–12 pallet regional shipments route direct door-to-door on Dedicated 26-Ft Straight Box Trucks (zero terminal cross-dock).',
  },
  {
    name: 'Flexport',
    domain: 'flexport.com',
    weakness: 'Built for coastal ocean drayage and enterprise imports; lacks dedicated Midwest dock-high/liftgate straight-truck overflow capacity in KY/IN/OH/TN.',
    portlandiaAdvantage: 'Anchored at River Ridge / Jeffersonville IN (47130) & Louisville KY (40202) with live WWEX/GTZ 65+ carrier LTL plus asset-backed 26-ft box truck overflow (USDOT #7728111).',
  },
]

export const STATES: StateHub[] = [
  {
    slug: 'kentucky',
    name: 'Kentucky',
    abbr: 'KY',
    zone: 'METRO_CORE',
    primaryHighways: ['I-65', 'I-64', 'I-71', 'I-75', 'I-264'],
    majorHubs: ['Louisville (40202–40299)', 'Lexington (40502)', 'Hebron / CVG (41048)', 'Bowling Green (42101)', 'Owensboro (42301)'],
    boxTruckEligible: true,
    publishedAt: '2024-06-15',
    lastModified: '2026-10-20',
    summary: 'Primary metro core for Dual-Lane LTL (WWEX/GTZ 65+ carriers) and Same-Day $475 Dedicated 26-Ft Straight Box Truck overflow across Louisville, Bluegrass Industrial Park, Lexington, and Northern Kentucky.',
  },
  {
    slug: 'indiana',
    name: 'Indiana',
    abbr: 'IN',
    zone: 'METRO_CORE',
    primaryHighways: ['I-65', 'I-64', 'I-70', 'I-74', 'I-265', 'I-465'],
    majorHubs: ['Jeffersonville / River Ridge (47130)', 'Clarksville (47129)', 'Indianapolis / Plainfield (46201)', 'Evansville (47708)', 'Fort Wayne (46802)'],
    boxTruckEligible: true,
    publishedAt: '2024-06-18',
    lastModified: '2026-10-22',
    summary: 'Home to our Jeffersonville / River Ridge (47130) fleet domicile (2000 Coopers Ln, Suite F) offering $475 Metro Turns and Next-Day I-65 corridor service to Indianapolis, Plainfield, and Columbus IN.',
  },
  {
    slug: 'ohio',
    name: 'Ohio',
    abbr: 'OH',
    zone: 'REGIONAL_OVERFLOW',
    primaryHighways: ['I-71', 'I-75', 'I-70', 'I-275', 'I-80'],
    majorHubs: ['Cincinnati / Sharonville (45202)', 'Columbus / Rickenbacker (43215)', 'Dayton (45402)', 'Toledo (43604)', 'Cleveland (44114)'],
    boxTruckEligible: true,
    publishedAt: '2024-07-12',
    lastModified: '2026-10-18',
    summary: 'Direct I-71 and I-75 corridor coverage connecting Louisville/Jeffersonville to Cincinnati, Dayton, and Columbus with same-day 26-ft straight box truck overflow and 1-day LTL.',
  },
  {
    slug: 'tennessee',
    name: 'Tennessee',
    abbr: 'TN',
    zone: 'REGIONAL_OVERFLOW',
    primaryHighways: ['I-65', 'I-40', 'I-24', 'I-75'],
    majorHubs: ['Nashville / La Vergne (37201)', 'Memphis (38103)', 'Knoxville (37902)', 'Chattanooga (37402)'],
    boxTruckEligible: true,
    publishedAt: '2024-08-04',
    lastModified: '2026-10-15',
    summary: 'Fast I-65 South corridor linking Louisville and Southern Indiana directly to Nashville, Smyrna, and Middle Tennessee industrial parks.',
  },
  {
    slug: 'illinois',
    name: 'Illinois',
    abbr: 'IL',
    zone: 'REGIONAL_OVERFLOW',
    primaryHighways: ['I-64', 'I-57', 'I-55', 'I-80', 'I-90'],
    majorHubs: ['Chicago / Elk Grove Village (60601)', 'Effingham (62401)', 'East St. Louis / Metro East (62201)', 'Joliet (60431)'],
    boxTruckEligible: true,
    publishedAt: '2024-09-09',
    lastModified: '2026-10-12',
    summary: 'Direct I-64 West and I-65/I-57 North lanes serving Southern Illinois, Metro East St. Louis, and Greater Chicagoland.',
  },
  {
    slug: 'missouri',
    name: 'Missouri',
    abbr: 'MO',
    zone: 'REGIONAL_OVERFLOW',
    primaryHighways: ['I-64', 'I-70', 'I-44', 'I-55'],
    majorHubs: ['St. Louis / Earth City (63101)', 'Kansas City (64101)'],
    boxTruckEligible: true,
    publishedAt: '2024-10-14',
    lastModified: '2026-10-10',
    summary: 'I-64 corridor linking Louisville and Jeffersonville straight into St. Louis and Earth City distribution hubs.',
  },
  {
    slug: 'michigan',
    name: 'Michigan',
    abbr: 'MI',
    zone: 'NATIONAL_3PL',
    primaryHighways: ['I-75', 'I-94', 'I-69', 'I-96'],
    majorHubs: ['Detroit / Romulus (48201)', 'Grand Rapids (49503)'],
    boxTruckEligible: false,
    publishedAt: '2024-11-20',
    lastModified: '2026-10-08',
    summary: 'Tier-1 WWEX/GTZ automotive and industrial LTL & FTL coverage across Detroit, Romulus, and West Michigan.',
  },
  {
    slug: 'west-virginia',
    name: 'West Virginia',
    abbr: 'WV',
    zone: 'REGIONAL_OVERFLOW',
    primaryHighways: ['I-64', 'I-77', 'I-79'],
    majorHubs: ['Charleston (25301)', 'Huntington (25701)'],
    boxTruckEligible: true,
    publishedAt: '2025-01-11',
    lastModified: '2026-10-05',
    summary: 'I-64 East corridor connecting Kentucky and Southern Indiana with Huntington and Charleston WV.',
  },
  {
    slug: 'georgia',
    name: 'Georgia',
    abbr: 'GA',
    zone: 'NATIONAL_3PL',
    primaryHighways: ['I-75', 'I-85', 'I-20', 'I-285'],
    majorHubs: ['Atlanta / Fulton Industrial (30301)', 'Savannah Port (31401)'],
    boxTruckEligible: false,
    publishedAt: '2025-02-06',
    lastModified: '2026-10-03',
    summary: 'High-frequency I-75 South LTL and FTL agency lanes between the Ohio Valley and Atlanta / Savannah.',
  },
  {
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    abbr: 'PA',
    zone: 'NATIONAL_3PL',
    primaryHighways: ['I-70', 'I-76', 'I-80', 'I-81'],
    majorHubs: ['Pittsburgh (15201)', 'Harrisburg / Carlisle (17101)', 'Philadelphia (19101)'],
    boxTruckEligible: false,
    publishedAt: '2025-02-22',
    lastModified: '2026-10-01',
    summary: 'I-71/I-70 Northeast LTL and dry-van corridors into Pittsburgh, Carlisle, and the Lehigh Valley.',
  },
  {
    slug: 'texas',
    name: 'Texas',
    abbr: 'TX',
    zone: 'NATIONAL_3PL',
    primaryHighways: ['I-35', 'I-45', 'I-10', 'I-20', 'I-30'],
    majorHubs: ['Dallas / Fort Worth (75201)', 'Houston (77001)', 'Austin / San Antonio (78701)'],
    boxTruckEligible: false,
    publishedAt: '2025-03-08',
    lastModified: '2026-09-29',
    summary: 'Contract LTL and expedited truckload corridors connecting Kentucky/Indiana manufacturing with DFW and Houston.',
  },
  {
    slug: 'california',
    name: 'California',
    abbr: 'CA',
    zone: 'NATIONAL_3PL',
    primaryHighways: ['I-5', 'I-10', 'I-15', 'I-80'],
    majorHubs: ['Los Angeles / Inland Empire (90001)', 'Oakland / Bay Area (94601)'],
    boxTruckEligible: false,
    publishedAt: '2025-03-18',
    lastModified: '2026-09-25',
    summary: 'West Coast solar, battery, and electronics LTL/FTL linehaul into the Ohio Valley and Midwest.',
  },
]

export const CITIES: CityTerminal[] = [
  {
    slug: 'louisville',
    stateSlug: 'kentucky',
    stateAbbr: 'KY',
    name: 'Louisville',
    zip3: '402',
    primaryZip: '40202',
    industrialParks: ['Bluegrass Industrial Park (40299)', 'Riverport Industrial Park (40258)', 'UPS Worldport Air Hub (40209)', 'Portland / Downtown Corridor (40203)'],
    zone: 'METRO_LOCAL',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 475,
    publishedAt: '2024-06-20',
    lastModified: '2026-10-24',
    lat: 38.2527,
    lng: -85.7585,
  },
  {
    slug: 'jeffersonville',
    stateSlug: 'indiana',
    stateAbbr: 'IN',
    name: 'Jeffersonville (River Ridge)',
    zip3: '471',
    primaryZip: '47130',
    industrialParks: ['River Ridge Commerce Center (47130)', '2000 Coopers Ln Fleet Yard (47130)', 'Port of Indiana-Jeffersonville'],
    zone: 'METRO_LOCAL',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 475,
    publishedAt: '2024-06-22',
    lastModified: '2026-10-24',
    lat: 38.2776,
    lng: -85.7372,
  },
  {
    slug: 'clarksville',
    stateSlug: 'indiana',
    stateAbbr: 'IN',
    name: 'Clarksville',
    zip3: '471',
    primaryZip: '47129',
    industrialParks: ['Lewis & Clark Commercial Corridor (47129)', 'Veterans Pkwy Logistics District'],
    zone: 'METRO_LOCAL',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 475,
    publishedAt: '2024-07-01',
    lastModified: '2026-10-22',
    lat: 38.2967,
    lng: -85.7599,
  },
  {
    slug: 'new-albany',
    stateSlug: 'indiana',
    stateAbbr: 'IN',
    name: 'New Albany',
    zip3: '471',
    primaryZip: '47150',
    industrialParks: ['New Albany Industrial Park (47150)', 'I-265 State St Commercial Hub'],
    zone: 'METRO_LOCAL',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 475,
    publishedAt: '2024-07-05',
    lastModified: '2026-10-20',
    lat: 38.2856,
    lng: -85.8241,
  },
  {
    slug: 'lexington',
    stateSlug: 'kentucky',
    stateAbbr: 'KY',
    name: 'Lexington',
    zip3: '405',
    primaryZip: '40502',
    industrialParks: ['Blue Sky Industrial Park', 'Georgetown / Toyota Supplier Corridor (40324)', 'Nandino Blvd Industrial District'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 795,
    publishedAt: '2024-07-18',
    lastModified: '2026-10-19',
    lat: 38.0406,
    lng: -84.5037,
  },
  {
    slug: 'hebron',
    stateSlug: 'kentucky',
    stateAbbr: 'KY',
    name: 'Hebron / CVG Airport',
    zip3: '410',
    primaryZip: '41048',
    industrialParks: ['CVG Air Cargo & Prime Logistics Park', 'Florence / Richwood I-75 Hub (41042)', 'Covington Riverfront (41011)'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 795,
    publishedAt: '2024-08-02',
    lastModified: '2026-10-18',
    lat: 39.0662,
    lng: -84.7036,
  },
  {
    slug: 'bowling-green',
    stateSlug: 'kentucky',
    stateAbbr: 'KY',
    name: 'Bowling Green',
    zip3: '421',
    primaryZip: '42101',
    industrialParks: ['Kentucky Transpark (42101)', 'I-65 South Automotive & Battery Belt'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 795,
    publishedAt: '2024-08-15',
    lastModified: '2026-10-16',
    lat: 36.9685,
    lng: -86.4808,
  },
  {
    slug: 'indianapolis',
    stateSlug: 'indiana',
    stateAbbr: 'IN',
    name: 'Indianapolis',
    zip3: '462',
    primaryZip: '46201',
    industrialParks: ['Plainfield AllPoints Midwest (46168)', 'Park 100 Industrial Complex (46268)', 'Ameriplex I-70 Corridor (46241)'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 795,
    publishedAt: '2024-08-28',
    lastModified: '2026-10-21',
    lat: 39.7684,
    lng: -86.1581,
  },
  {
    slug: 'cincinnati',
    stateSlug: 'ohio',
    stateAbbr: 'OH',
    name: 'Cincinnati',
    zip3: '452',
    primaryZip: '45202',
    industrialParks: ['Sharonville / I-275 Industrial Hub (45241)', 'Queensgate Rail & Freight Terminal', 'West Chester / Beckett Ridge (45069)'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 795,
    publishedAt: '2024-09-10',
    lastModified: '2026-10-20',
    lat: 39.1031,
    lng: -84.5120,
  },
  {
    slug: 'columbus',
    stateSlug: 'ohio',
    stateAbbr: 'OH',
    name: 'Columbus',
    zip3: '432',
    primaryZip: '43215',
    industrialParks: ['Rickenbacker Global Logistics Park (43125)', 'Groveport / West Jefferson I-70 Hub'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1–2',
    boxTruckDirectRateUsd: 895,
    publishedAt: '2024-09-24',
    lastModified: '2026-10-17',
    lat: 39.9612,
    lng: -82.9988,
  },
  {
    slug: 'nashville',
    stateSlug: 'tennessee',
    stateAbbr: 'TN',
    name: 'Nashville',
    zip3: '372',
    primaryZip: '37201',
    industrialParks: ['La Vergne / Smyrna I-24 Distribution Corridor (37086)', 'Lebanon / Mt. Juliet I-40 Hub'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1',
    boxTruckDirectRateUsd: 845,
    publishedAt: '2024-10-08',
    lastModified: '2026-10-15',
    lat: 36.1627,
    lng: -86.7816,
  },
  {
    slug: 'st-louis',
    stateSlug: 'missouri',
    stateAbbr: 'MO',
    name: 'St. Louis',
    zip3: '631',
    primaryZip: '63101',
    industrialParks: ['Earth City Industrial Park (63045)', 'Gateway Commerce Center (Edwardsville IL 62025)'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1–2',
    boxTruckDirectRateUsd: 945,
    publishedAt: '2024-10-29',
    lastModified: '2026-10-12',
    lat: 38.6270,
    lng: -90.1994,
  },
  {
    slug: 'chicago',
    stateSlug: 'illinois',
    stateAbbr: 'IL',
    name: 'Chicago',
    zip3: '606',
    primaryZip: '60601',
    industrialParks: ['Elk Grove Village O\'Hare Industrial Park (60007)', 'CenterPoint Intermodal Joliet (60436)'],
    zone: 'REGIONAL_MIDWEST',
    ltlTransitDays: '1–2',
    boxTruckDirectRateUsd: 995,
    publishedAt: '2024-11-12',
    lastModified: '2026-10-11',
    lat: 41.8781,
    lng: -87.6298,
  },
]

export const MODES: FreightModeSpec[] = [
  {
    slug: 'ltl-freight',
    title: 'Commercial LTL Freight Shipping (65+ Tier-1 Contract Carriers)',
    shortName: 'Standard & Guaranteed LTL',
    maxPallets: 6,
    maxWeightLbs: 10000,
    planeOwner: 'PLANE_2_BROKERAGE',
    marginTargetPct: 18,
    publishedAt: '2024-06-20',
    lastModified: '2026-10-24',
    headline: 'Wholesale WWEX & GlobalTranz LTL Contract Tariffs — Ungated Instant Pallet Quotes',
    description: 'Access 65+ national and regional LTL carriers (Estes, XPO, R+L, Old Dominion, Saia, Dayton Freight, FedEx Freight) with instant NMFC class calculation and zero cold-call lead walls.',
    idealFor: ['1–3 pallet commercial shipments', 'National 48-state distribution', 'Guaranteed AM/PM delivery windows'],
  },
  {
    slug: '26-ft-straight-box-truck',
    title: 'Dedicated 26-Ft Straight Box Truck (Non-CDL 26,000 lb Dock-High & Liftgate)',
    shortName: 'Dedicated 26-Ft Box Truck',
    maxPallets: 12,
    maxWeightLbs: 14500,
    planeOwner: 'PLANE_1_PES_FLEET_OVERFLOW',
    marginTargetPct: 100,
    publishedAt: '2024-07-04',
    lastModified: '2026-10-24',
    headline: 'Same-Day $475 Metro & $795+ Regional Direct Box Truck Turns — Zero Terminal Cross-Dock',
    description: 'When your shipment is 4 to 12 pallets, LTL terminals cross-dock your freight 2–4 times and charge steep cubic/linear-foot penalties. Our Asset-Based Overflow Bridge routes your load onto a Dedicated 26-Ft International 4300 Straight Box Truck operated by Portlandia Electric Supply, LLC Fleet (USDOT #7728111) for direct door-to-door delivery.',
    idealFor: ['4–12 standard pallets (up to 14,500 lbs payload)', 'Fragile solar panels, switchgear & server racks (zero cross-dock)', 'Same-day Louisville KY (402xx) ↔ River Ridge / Jeffersonville IN (471xx) shuttle'],
  },
  {
    slug: 'liftgate-jobsite-delivery',
    title: 'Hydraulic Liftgate & Construction Jobsite Delivery',
    shortName: 'Liftgate & Jobsite Delivery',
    maxPallets: 12,
    maxWeightLbs: 12000,
    planeOwner: 'DUAL_LANE',
    marginTargetPct: 22,
    publishedAt: '2024-08-19',
    lastModified: '2026-10-22',
    headline: 'Ground-Level Hydraulic Liftgate Drops for Commercial Sites Without Loading Docks',
    description: 'Direct liftgate delivery for solar arrays, commercial HVAC, electrical transformers, and retail storefronts lacking a 48-inch dock.',
    idealFor: ['Solar EPC & electrical contractor jobsites', 'Commercial buildings without dock-high bays', 'Scheduled time-definite morning drops'],
  },
  {
    slug: 'solar-electrical-equipment-freight',
    title: 'Solar Panel, Inverter, Transformer & Switchgear Freight',
    shortName: 'Solar & Electrical Freight',
    maxPallets: 26,
    maxWeightLbs: 42000,
    planeOwner: 'DUAL_LANE',
    marginTargetPct: 20,
    publishedAt: '2024-09-15',
    lastModified: '2026-10-23',
    headline: 'Zero-Microcrack Solar Module & High-Voltage Electrical Logistics',
    description: 'Built natively around electrical and solar supply-chain requirements: no double-stacking on glass modules, UL 9540 ESS compliance, and direct straight-truck jobsite delivery.',
    idealFor: ['Bifacial solar module pallets', 'Pad-mount transformers & switchgear', 'UL 9540 battery energy storage systems'],
  },
]

export const CORRIDORS: FreightCorridor[] = [
  {
    slug: 'jeffersonville-in-to-louisville-ky',
    originCity: 'Jeffersonville (River Ridge)',
    originState: 'IN',
    originZip: '47130',
    destCity: 'Louisville',
    destState: 'KY',
    destZip: '40299',
    miles: 18,
    highways: 'I-265 / I-65 S / I-64',
    zone: 'METRO_LOCAL',
    publishedAt: '2024-07-10',
    lastModified: '2026-10-24',
    sampleRates: [
      { pallets: 1, weightLbs: 1200, ltlRateUsd: 168, ltlTransitDays: '1 Day', boxTruckRateUsd: 475, boxTruckTransitDays: 'Same-Day (2–4 hrs)', recommendedLane: '1–2 Pallets: LTL | Urgent: 26-Ft Box Truck' },
      { pallets: 4, weightLbs: 4800, ltlRateUsd: 492, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 475, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($475 Direct — Saves $17 + Zero Cross-Dock)' },
      { pallets: 8, weightLbs: 9600, ltlRateUsd: 845, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 475, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($475 Direct — Saves $370)' },
      { pallets: 10, weightLbs: 14800, ltlRateUsd: 1120, ltlTransitDays: '2 Days', boxTruckRateUsd: 475, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($475 Direct — Saves $645)' },
    ],
  },
  {
    slug: 'louisville-ky-to-indianapolis-in',
    originCity: 'Louisville',
    originState: 'KY',
    originZip: '40202',
    destCity: 'Indianapolis',
    destState: 'IN',
    destZip: '46201',
    miles: 114,
    highways: 'I-65 N',
    zone: 'REGIONAL_MIDWEST',
    publishedAt: '2024-08-05',
    lastModified: '2026-10-23',
    sampleRates: [
      { pallets: 1, weightLbs: 1500, ltlRateUsd: 195, ltlTransitDays: '1 Day', boxTruckRateUsd: 795, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Standard LTL ($195)' },
      { pallets: 4, weightLbs: 5000, ltlRateUsd: 560, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 795, boxTruckTransitDays: 'Same-Day / Next-AM Direct', recommendedLane: 'LTL for Economy | 26-Ft Box Truck for Same-Day Zero Cross-Dock' },
      { pallets: 8, weightLbs: 9500, ltlRateUsd: 1040, ltlTransitDays: '2 Days', boxTruckRateUsd: 975, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($975 Direct — Saves $65)' },
      { pallets: 12, weightLbs: 14000, ltlRateUsd: 1490, ltlTransitDays: '2–3 Days', boxTruckRateUsd: 1155, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($1,155 Direct — Saves $335)' },
    ],
  },
  {
    slug: 'louisville-ky-to-cincinnati-oh',
    originCity: 'Louisville',
    originState: 'KY',
    originZip: '40202',
    destCity: 'Cincinnati',
    destState: 'OH',
    destZip: '45202',
    miles: 100,
    highways: 'I-71 N',
    zone: 'REGIONAL_MIDWEST',
    publishedAt: '2024-08-22',
    lastModified: '2026-10-22',
    sampleRates: [
      { pallets: 1, weightLbs: 1200, ltlRateUsd: 185, ltlTransitDays: '1 Day', boxTruckRateUsd: 795, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Standard LTL ($185)' },
      { pallets: 6, weightLbs: 7200, ltlRateUsd: 890, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 883, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($883 Direct — Zero Cross-Dock)' },
      { pallets: 10, weightLbs: 12000, ltlRateUsd: 1340, ltlTransitDays: '2 Days', boxTruckRateUsd: 1075, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($1,075 Direct — Saves $265)' },
    ],
  },
  {
    slug: 'louisville-ky-to-nashville-tn',
    originCity: 'Louisville',
    originState: 'KY',
    originZip: '40202',
    destCity: 'Nashville',
    destState: 'TN',
    destZip: '37201',
    miles: 175,
    highways: 'I-65 S',
    zone: 'REGIONAL_MIDWEST',
    publishedAt: '2024-09-14',
    lastModified: '2026-10-21',
    sampleRates: [
      { pallets: 1, weightLbs: 1400, ltlRateUsd: 215, ltlTransitDays: '1 Day', boxTruckRateUsd: 845, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Standard LTL ($215)' },
      { pallets: 6, weightLbs: 7500, ltlRateUsd: 940, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 895, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($895 Direct — Saves $45)' },
      { pallets: 12, weightLbs: 14000, ltlRateUsd: 1620, ltlTransitDays: '2–3 Days', boxTruckRateUsd: 1155, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($1,155 Direct — Saves $465)' },
    ],
  },
  {
    slug: 'jeffersonville-in-to-columbus-oh',
    originCity: 'Jeffersonville (River Ridge)',
    originState: 'IN',
    originZip: '47130',
    destCity: 'Columbus',
    destState: 'OH',
    destZip: '43215',
    miles: 206,
    highways: 'I-71 N',
    zone: 'REGIONAL_MIDWEST',
    publishedAt: '2024-10-03',
    lastModified: '2026-10-20',
    sampleRates: [
      { pallets: 1, weightLbs: 1500, ltlRateUsd: 228, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 895, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Standard LTL ($228)' },
      { pallets: 8, weightLbs: 10000, ltlRateUsd: 1180, ltlTransitDays: '2 Days', boxTruckRateUsd: 995, boxTruckTransitDays: 'Same-Day Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($995 Direct — Saves $185)' },
    ],
  },
  {
    slug: 'louisville-ky-to-st-louis-mo',
    originCity: 'Louisville',
    originState: 'KY',
    originZip: '40202',
    destCity: 'St. Louis',
    destState: 'MO',
    destZip: '63101',
    miles: 261,
    highways: 'I-64 W',
    zone: 'REGIONAL_MIDWEST',
    publishedAt: '2024-11-01',
    lastModified: '2026-10-18',
    sampleRates: [
      { pallets: 1, weightLbs: 1500, ltlRateUsd: 245, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 945, boxTruckTransitDays: 'Next-AM Direct', recommendedLane: 'Standard LTL ($245)' },
      { pallets: 10, weightLbs: 12500, ltlRateUsd: 1480, ltlTransitDays: '2–3 Days', boxTruckRateUsd: 1095, boxTruckTransitDays: 'Next-AM Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($1,095 Direct — Saves $385)' },
    ],
  },
  {
    slug: 'louisville-ky-to-chicago-il',
    originCity: 'Louisville',
    originState: 'KY',
    originZip: '40202',
    destCity: 'Chicago',
    destState: 'IL',
    destZip: '60601',
    miles: 297,
    highways: 'I-65 N',
    zone: 'REGIONAL_MIDWEST',
    publishedAt: '2024-11-19',
    lastModified: '2026-10-17',
    sampleRates: [
      { pallets: 1, weightLbs: 1500, ltlRateUsd: 255, ltlTransitDays: '1–2 Days', boxTruckRateUsd: 995, boxTruckTransitDays: 'Next-AM Direct', recommendedLane: 'Standard LTL ($255)' },
      { pallets: 10, weightLbs: 13000, ltlRateUsd: 1560, ltlTransitDays: '2–3 Days', boxTruckRateUsd: 1115, boxTruckTransitDays: 'Next-AM Direct', recommendedLane: 'Dedicated 26-Ft Box Truck ($1,115 Direct — Saves $445)' },
    ],
  },
]
