/**
 * ZIP Code Lookup Service
 *
 * Calls the free Zippopotam.us API to resolve a ZIP code to city/state.
 * Results are cached in memory to avoid duplicate network requests.
 */

interface ZipLookupResult {
  city: string
  stateCode: string
}

const cache = new Map<string, ZipLookupResult | null>()

/**
 * Look up a US ZIP code and return the city + 2-letter state code.
 * Returns `null` when the ZIP is not found (404) or on network errors.
 */
export async function lookupZip(zip: string): Promise<ZipLookupResult | null> {
  const trimmed = zip.trim()
  if (!/^\d{5}$/.test(trimmed)) return null

  if (cache.has(trimmed)) return cache.get(trimmed) ?? null

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${trimmed}`)
    if (!res.ok) {
      cache.set(trimmed, null)
      return null
    }

    const data = await res.json() as {
      places?: Array<{ "place name": string; "state abbreviation": string }>
    }

    const place = data?.places?.[0]
    if (!place) {
      cache.set(trimmed, null)
      return null
    }

    const result: ZipLookupResult = {
      city: place["place name"],
      stateCode: place["state abbreviation"],
    }

    cache.set(trimmed, result)
    return result
  } catch {
    cache.set(trimmed, null)
    return null
  }
}
