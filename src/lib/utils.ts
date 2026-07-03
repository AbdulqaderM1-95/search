import type { Product } from '@/lib/types'

export function cleanModelName(m: Product): string {
  let name = m.model_name
  name = name.replace(/\s+(?:smart\s+)?(?:phone|smartphone)\b.*/i, '').trim()
  name = name.replace(/\s+(?:5G|4G\s*LTE|4G|LTE)\b/gi, '').trim()
  name = name.replace(/\s+\d+\.\d+(?:-inch)?\b/gi, '').trim()
  name = name.replace(/\s+\d{2,4}GB\b/g, '').trim()
  name = name.replace(/\s+A\d+\s+Chip\b/gi, '').trim()
  name = name.replace(/\s+(?:Black|White|Pink|Blue|Silver|Gold|Green|Purple|Yellow|Red|Titanium|Desert|Natural|Ultramarine|Teal|Coral|Midnight|Starlight|Alpine)\s*$/i, '').trim()
  return name
}
