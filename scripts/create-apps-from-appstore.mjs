import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
const LIST_MAX_WIDTH = 600
const DETAIL_MAX_WIDTH = 1200
const DISPLAY_WEBP_QUALITY = 90

const GENRE_TO_CATEGORY = {
  'ソーシャルネットワーキング': 'ソーシャル ネットワーキング',
  'Social Networking': 'ソーシャル ネットワーキング',
  Utilities: '仕事効率化',
  ユーティリティ: '仕事効率化',
  Productivity: '仕事効率化',
  仕事効率化: '仕事効率化',
  News: 'ニュース',
  ニュース: 'ニュース',
  Shopping: 'ショッピング',
  ショッピング: 'ショッピング',
  'Food & Drink': 'フード・ドリンク',
  'フード／ドリンク': 'フード・ドリンク',
  'フード/ドリンク': 'フード・ドリンク',
  Lifestyle: 'ライフスタイル',
  ライフスタイル: 'ライフスタイル',
}

const APPS = [
  {
    trackId: 344381719,
    displayName: 'アーバンリサーチ',
    folder: 'urban-research',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
  },
  {
    trackId: 544644739,
    displayName: 'ユナイテッドアロウズ',
    folder: 'united-arrows',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
  },
  {
    trackId: 290033990,
    displayName: 'ホットペッパー',
    folder: 'hotpepper',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', '地図', 'フィルター'],
  },
  {
    trackId: 413618155,
    displayName: 'マクドナルド',
    folder: 'mcdonalds',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'ボトム ナビゲーション'],
  },
  {
    trackId: 955641819,
    displayName: 'ミスタードーナッツ',
    folder: 'mister-donut',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'ボトム ナビゲーション'],
  },
]

function uid(len = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[(Math.random() * chars.length) | 0]
  return s
}

function hiResUrl(url) {
  return url.replace(/\/\d+x\d+[a-z]*\.(jpg|jpeg|png|webp)$/i, '/2000x2000bb.$1')
}

function mapGenre(genre) {
  return GENRE_TO_CATEGORY[genre?.trim()] ?? genre?.trim() ?? 'ライフスタイル'
}

function truncate(text, max = 120) {
  const n = String(text || '').replace(/\s+/g, ' ').trim()
  if (n.length <= max) return n
  return `${n.slice(0, max).trim()}…`
}

async function toMasterWebp(buffer) {
  return sharp(buffer, { animated: false })
    .rotate()
    .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function toDisplayWebp(buffer, maxWidth) {
  return sharp(buffer, { animated: false })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .webp({ quality: DISPLAY_WEBP_QUALITY, alphaQuality: DISPLAY_WEBP_QUALITY, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function saveWebpSet(dir, baseName, buffer) {
  await fs.mkdir(dir, { recursive: true })
  const master = await toMasterWebp(buffer)
  const masterPath = path.join(dir, `${baseName}.webp`)
  await fs.writeFile(masterPath, master)
  await fs.writeFile(path.join(dir, `${baseName}.list.webp`), await toDisplayWebp(master, LIST_MAX_WIDTH))
  await fs.writeFile(path.join(dir, `${baseName}.detail.webp`), await toDisplayWebp(master, DETAIL_MAX_WIDTH))
  return `/appui-images/${path.basename(dir)}/${baseName}.webp`
}

async function fetchBuffer(url) {
  const res = await fetch(hiResUrl(url))
  if (!res.ok) throw new Error(`fetch failed ${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function lookup(trackId) {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${trackId}&country=jp&lang=ja_jp`)
  const data = await res.json()
  const app = data.results?.[0]
  if (!app) throw new Error(`lookup failed for ${trackId}`)
  return app
}

async function createFromAppStore({ trackId, displayName, folder, defaultComponents }) {
  const app = await lookup(trackId)
  const dir = path.join(ROOT, 'public/appui-images', folder)
  const iconUrl = await saveWebpSet(dir, 'icon', await fetchBuffer(app.artworkUrl512))

  const screenshots = app.screenshotUrls || []
  const images = []
  for (let i = 0; i < screenshots.length; i++) {
    const num = String(i + 1).padStart(2, '0')
    const src = await saveWebpSet(dir, `screen-${num}`, await fetchBuffer(screenshots[i]))
    images.push({
      id: uid(),
      src,
      filename: `screen-${num}.webp`,
      components: defaultComponents.slice(0, 5),
    })
  }

  const entry = {
    id: `${folder}-${Date.now()}-${uid(4)}`,
    name: displayName,
    description: truncate(app.description),
    iconUrl,
    externalUrl: app.trackViewUrl,
    categories: [mapGenre(app.primaryGenreName)],
    components: defaultComponents,
    sections: [
      {
        id: uid(),
        title: 'ストア画像',
        images,
      },
    ],
  }

  return { entry, screenshotCount: images.length }
}

async function createNicoiloPlaceholder() {
  const folder = 'nicoilo'
  const dir = path.join(ROOT, 'public/appui-images', folder)
  await fs.mkdir(dir, { recursive: true })

  // Simple branded placeholder icon (no official App Store app)
  const iconBuffer = await sharp({
    create: { width: 512, height: 512, channels: 3, background: { r: 45, g: 62, b: 48 } },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="72" font-weight="700">nicoilo</text></svg>`,
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer()

  const iconUrl = await saveWebpSet(dir, 'icon', iconBuffer)

  return {
    id: `${folder}-${Date.now()}-${uid(4)}`,
    name: 'Nicoilo',
    description: 'アウトドア・キャンプファッション専門店ニコイロ。App Storeに公式アプリはなく、Webショップで運営。',
    iconUrl,
    externalUrl: 'https://www.nicoilo.com/',
    categories: ['ショッピング'],
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    sections: [],
  }
}

const current = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const created = []

for (const spec of APPS) {
  const { entry, screenshotCount } = await createFromAppStore(spec)
  current.push(entry)
  created.push({ name: entry.name, id: entry.id, folder: spec.folder, screenshots: screenshotCount })
  console.log(`created ${entry.name} (${screenshotCount} store images)`)
}

const nicoilo = await createNicoiloPlaceholder()
current.push(nicoilo)
created.push({ name: nicoilo.name, id: nicoilo.id, folder: 'nicoilo', screenshots: 0, note: 'no App Store app' })
console.log('created Nicoilo (placeholder, no store images)')

await fs.writeFile(APPS_JSON, `${JSON.stringify(current, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ totalApps: current.length, created }, null, 2))
