export type ModelSpec = {
  display: string
  chip: string
  camera: string
  frontCamera: string
  battery: string
  design: string
  connectivity: string
  storage: string[]
}

export const MODEL_SPECS: Record<string, ModelSpec> = {
  'iPhone 17': {
    display: '6.1" Super Retina XDR OLED, 2556×1179, 460 ppi, 60 Hz',
    chip: 'Apple A19, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) + 12 MP ultrawide — 4K Cinematic, Smart HDR 6',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 26 hrs video playback · 20W wired · 25W MagSafe',
    design: 'Aluminium & glass, 71.5 × 149.6 × 7.8 mm, 170 g · Black, White, Teal, Pink, Ultramarine',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3), Emergency SOS via satellite',
    storage: ['128 GB', '256 GB', '512 GB'],
  },
  'iPhone 17 Pro': {
    display: '6.3" Super Retina XDR OLED ProMotion, 2622×1206, 460 ppi, 1–120 Hz',
    chip: 'Apple A19 Pro, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.78) + 48 MP ultrawide + 12 MP 5× tetraprism telephoto · ProRAW, ProRes 4K 120fps',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K ProRes video',
    battery: 'Up to 27 hrs video playback · 30W wired · 25W MagSafe',
    design: 'Grade 5 titanium & textured matte glass, 77.6 × 162.9 × 8.25 mm, 227 g · Black Titanium, White Titanium, Desert Titanium, Natural Titanium',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3 / Thunderbolt 4), Emergency SOS via satellite',
    storage: ['256 GB', '512 GB', '1 TB'],
  },
  'iPhone 17 Pro Max': {
    display: '6.9" Super Retina XDR OLED ProMotion, 2868×1320, 460 ppi, 1–120 Hz',
    chip: 'Apple A19 Pro, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.78) + 48 MP ultrawide + 12 MP 5× tetraprism telephoto · ProRAW, ProRes 4K 120fps',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K ProRes video',
    battery: 'Up to 34 hrs video playback · 30W wired · 25W MagSafe',
    design: 'Grade 5 titanium & textured matte glass, 77.6 × 163.0 × 8.25 mm, 251 g · Black Titanium, White Titanium, Desert Titanium, Natural Titanium',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3 / Thunderbolt 4), Emergency SOS via satellite',
    storage: ['256 GB', '512 GB', '1 TB'],
  },
}

export const SPEC_LABELS: { key: keyof ModelSpec; icon: string; label: string }[] = [
  { key: 'display',       icon: '📱', label: 'Display' },
  { key: 'chip',          icon: '⚡', label: 'Performance' },
  { key: 'camera',        icon: '📷', label: 'Rear camera' },
  { key: 'frontCamera',   icon: '🤳', label: 'Front camera' },
  { key: 'battery',       icon: '🔋', label: 'Battery' },
  { key: 'design',        icon: '🎨', label: 'Design' },
  { key: 'connectivity',  icon: '🔗', label: 'Connectivity' },
]
