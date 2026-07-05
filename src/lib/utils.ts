import type { Product } from '@/lib/types'
import { MODEL_SPECS } from '@/lib/specs'

export function cleanModelName(m: Product): string {
  let name = m.model_name
  name = name.replace(/\s+(?:smart\s+)?(?:phone|smartphone)\b.*/i, '').trim()
  name = name.replace(/\s+(?:5G|4G\s*LTE|4G|LTE|3G|2G)\b/gi, '').trim()
  name = name.replace(/\s+\d+\.\d+(?:-inch)?\b/gi, '').trim()
  name = name.replace(/\s+\d{2,4}GB\b/g, '').trim()
  name = name.replace(/\s+\d+MB\b/g, '').trim()
  name = name.replace(/\s+A\d+\s+Chip\b/gi, '').trim()
  name = name.replace(/\s+(?:Black|White|Pink|Blue|Silver|Gold|Green|Purple|Yellow|Red|Titanium|Desert|Natural|Ultramarine|Teal|Coral|Midnight|Starlight|Alpine)\s*$/i, '').trim()
  return name
}

type ParsedSpecs = {
  network: string | null
  ram: string | null
  screen_size: string | null
}

function parseSpecsFromName(modelName: string, storageOptions: string[]): ParsedSpecs {
  // Network: 5G, 4G LTE, 4G, LTE, 3G, 2G
  const networkMatch = modelName.match(/\b(5G|4G\s*LTE|4G|LTE|3G|2G)\b/i)
  const network = networkMatch ? networkMatch[1].replace(/\s+/g, '').toUpperCase() : null

  // Screen size: decimal number in phone range 4.5–8.5 inches, optionally followed by -inch/inch
  let screen_size: string | null = null
  const screenMatches = [...modelName.matchAll(/\b(\d+\.\d{1,2})(?:-?inch)?\b/gi)]
  for (const m of screenMatches) {
    const val = parseFloat(m[1])
    if (val >= 4.5 && val <= 8.5) {
      screen_size = `${m[1]}"`
      break
    }
  }

  // RAM: distinguish from storage by finding the smaller GB value
  // Pattern 1: explicit "XGB RAM" keyword
  const explicitRam = modelName.match(/\b(\d{1,2})GB\s+RAM\b/i)
  if (explicitRam) {
    return { network, ram: `${explicitRam[1]}GB`, screen_size }
  }

  // Pattern 2: multiple GB values in the name — smallest that is ≤24 is RAM
  const allGb = [...modelName.matchAll(/\b(\d+)GB\b/gi)].map(m => parseInt(m[1]))
  if (allGb.length >= 2) {
    const sorted = [...allGb].sort((a, b) => a - b)
    if (sorted[0] <= 24) {
      return { network, ram: `${sorted[0]}GB`, screen_size }
    }
  }

  // Pattern 3: single GB value that is NOT a known storage option → it's RAM
  if (allGb.length === 1 && allGb[0] <= 24) {
    const isStorage = storageOptions.some(s => s.toUpperCase() === `${allGb[0]}GB`)
    if (!isStorage) {
      return { network, ram: `${allGb[0]}GB`, screen_size }
    }
  }

  return { network, ram: null, screen_size }
}

/** Returns specs for a product — DB columns → MODEL_SPECS (Apple) → parsed from name */
export function getModelSpecs(m: Product): ParsedSpecs {
  // 1. DB columns take priority when populated
  if (m.network || m.ram || m.screen_size) {
    return { network: m.network, ram: m.ram, screen_size: m.screen_size }
  }

  // 2. Known Apple models — extract screen size and network from rich specs
  const richSpecs = MODEL_SPECS[m.model_name]
  if (richSpecs) {
    const screenMatch = richSpecs.display.match(/^(\d+\.?\d*)"/)
    const screen_size = screenMatch ? `${screenMatch[1]}"` : null
    const network = /\b5G\b/.test(richSpecs.connectivity) ? '5G' : null
    return { network, ram: null, screen_size }
  }

  // 3. All other models — parse from the model name string
  return parseSpecsFromName(m.model_name, m.storage_options)
}
