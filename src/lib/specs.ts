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
  'iPhone 13': {
    display: '6.1" Super Retina XDR OLED, 2532×1170, 460 ppi, 60 Hz',
    chip: 'Apple A15 Bionic, 6-core CPU, 4-core GPU, 16-core Neural Engine',
    camera: '12 MP main (f/1.6) + 12 MP ultrawide — 4K Cinematic mode',
    frontCamera: '12 MP TrueDepth, f/2.2, 4K video',
    battery: 'Up to 19 hrs video playback · 20W wired · 15W MagSafe',
    design: 'Aluminium & glass, 71.5 × 146.7 × 7.65 mm, 174 g · Black, White, Pink, Blue, Green, Red',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, Lightning, Emergency SOS',
    storage: ['128GB', '256GB', '512GB'],
  },
  'iPhone 14': {
    display: '6.1" Super Retina XDR OLED, 2532×1170, 460 ppi, 60 Hz',
    chip: 'Apple A15 Bionic, 6-core CPU, 5-core GPU, 16-core Neural Engine',
    camera: '12 MP main (f/1.5) + 12 MP ultrawide — 4K Cinematic, Action mode',
    frontCamera: '12 MP TrueDepth, f/1.9, autofocus, 4K video',
    battery: 'Up to 20 hrs video playback · 20W wired · 15W MagSafe',
    design: 'Aluminium & glass, 71.5 × 146.7 × 7.80 mm, 172 g · Blue, Purple, Midnight, Starlight, Red, Yellow',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, Lightning, Emergency SOS via satellite',
    storage: ['128GB', '256GB', '512GB'],
  },
  'iPhone 16': {
    display: '6.1" Super Retina XDR OLED, 2556×1179, 460 ppi, 60 Hz',
    chip: 'Apple A18, 6-core CPU, 5-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) + 12 MP ultrawide — 4K Cinematic, Camera Control',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 22 hrs video playback · 25W wired · 25W MagSafe',
    design: 'Aluminium & glass, 71.6 × 147.6 × 7.80 mm, 170 g · Black, White, Pink, Teal, Ultramarine',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 2), Emergency SOS via satellite',
    storage: ['128GB', '256GB', '512GB'],
  },
  'iPhone 16 Plus': {
    display: '6.7" Super Retina XDR OLED, 2796×1290, 460 ppi, 60 Hz',
    chip: 'Apple A18, 6-core CPU, 5-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) + 12 MP ultrawide — 4K Cinematic, Camera Control',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 27 hrs video playback · 25W wired · 25W MagSafe',
    design: 'Aluminium & glass, 77.8 × 160.9 × 7.80 mm, 223 g · Black, White, Pink, Teal, Ultramarine',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 2), Emergency SOS via satellite',
    storage: ['128GB', '256GB', '512GB'],
  },
  'iPhone 16e': {
    display: '6.1" Super Retina XDR OLED, 2532×1170, 460 ppi, 60 Hz',
    chip: 'Apple A16 Bionic, 6-core CPU, 5-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) — 4K video, Smart HDR 5',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 26 hrs video playback · 20W wired · 25W MagSafe',
    design: 'Aluminium & glass, 71.5 × 147.6 × 7.80 mm, 167 g · Black, White',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, USB-C (USB 2), Emergency SOS via satellite',
    storage: ['128GB'],
  },
  'iPhone 17': {
    display: '6.3" Super Retina XDR OLED, 2556×1179, 460 ppi, 60 Hz',
    chip: 'Apple A19, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) + 12 MP ultrawide — 4K Cinematic, Smart HDR 6',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 26 hrs video playback · 20W wired · 25W MagSafe',
    design: 'Aluminium & glass, 71.5 × 149.6 × 7.8 mm, 170 g · Black, White, Teal, Pink, Ultramarine',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3), Emergency SOS via satellite',
    storage: ['128GB', '256GB', '512GB'],
  },
  'iPhone 17 Air': {
    display: '6.6" Super Retina XDR OLED, 2796×1290, 460 ppi, 60 Hz',
    chip: 'Apple A18, 6-core CPU, 5-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) + 12 MP ultrawide — 4K Cinematic, Smart HDR 6',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 22 hrs video playback · 20W wired · 25W MagSafe',
    design: 'Aluminium & glass (thinnest iPhone), 77.4 × 158.7 × 5.65 mm, 145 g · Black, White, Blue',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3), Emergency SOS via satellite',
    storage: ['128GB', '256GB', '512GB', '1TB'],
  },
  'iPhone 17 Pro': {
    display: '6.3" Super Retina XDR OLED ProMotion, 2622×1206, 460 ppi, 1–120 Hz',
    chip: 'Apple A19 Pro, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.78) + 48 MP ultrawide + 12 MP 5× tetraprism telephoto · ProRAW, ProRes 4K 120fps',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K ProRes video',
    battery: 'Up to 27 hrs video playback · 30W wired · 25W MagSafe',
    design: 'Grade 5 titanium & textured matte glass, 77.6 × 162.9 × 8.25 mm, 227 g · Black Titanium, White Titanium, Desert Titanium, Natural Titanium',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3 / Thunderbolt 4), Emergency SOS via satellite',
    storage: ['256GB', '512GB', '1TB'],
  },
  'iPhone 17 Pro Max': {
    display: '6.9" Super Retina XDR OLED ProMotion, 2868×1320, 460 ppi, 1–120 Hz',
    chip: 'Apple A19 Pro, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.78) + 48 MP ultrawide + 12 MP 5× tetraprism telephoto · ProRAW, ProRes 4K 120fps',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K ProRes video',
    battery: 'Up to 34 hrs video playback · 30W wired · 25W MagSafe',
    design: 'Grade 5 titanium & textured matte glass, 77.6 × 163.0 × 8.25 mm, 251 g · Black Titanium, White Titanium, Desert Titanium, Natural Titanium',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3 / Thunderbolt 4), Emergency SOS via satellite',
    storage: ['256GB', '512GB', '1TB', '2TB'],
  },
  'iPhone 17E': {
    display: '6.1" Super Retina XDR OLED, 2532×1170, 460 ppi, 60 Hz',
    chip: 'Apple A19, 6-core CPU, 6-core GPU, 16-core Neural Engine',
    camera: '48 MP main (f/1.6) — 4K video, Smart HDR 6',
    frontCamera: '12 MP TrueDepth, f/1.9, 4K video',
    battery: 'Up to 26 hrs video playback · 20W wired · 25W MagSafe',
    design: 'Aluminium & glass, 71.5 × 138.8 × 7.8 mm, 167 g · Black, White, Pink',
    connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3), Emergency SOS via satellite',
    storage: ['256GB', '512GB'],
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
