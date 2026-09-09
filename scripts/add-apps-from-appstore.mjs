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
  // Japanese (existing mapping)
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

  // English (ours for these apps)
  Book: 'エンターテインメント',
  ブック: 'エンターテインメント',
  Education: '教育',
  'Health & Fitness': '健康・フィットネス',
  'Photo & Video': 'エンターテインメント',
  Weather: 'ライフスタイル',
  天気: 'ライフスタイル',
  Business: '仕事効率化',
  ビジネス: '仕事効率化',
  Finance: '金融',
  ファイナンス: '金融',
}

function mapGenre(genre) {
  const g = genre?.trim()
  return GENRE_TO_CATEGORY[g] ?? g ?? 'ライフスタイル'
}

function uid(len = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[(Math.random() * chars.length) | 0]
  return s
}

function hiResUrl(url) {
  // iTunes artwork URLs are often like .../123x123bb.jpg
  return url.replace(/\/\d+x\d+[a-z]*\.(jpg|jpeg|png|webp)$/i, '/2000x2000bb.$1')
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
  await fs.writeFile(path.join(dir, `${baseName}.webp`), master)
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

  const name = displayName ?? app.trackName
  const entry = {
    id: `${folder}-${Date.now()}-${uid(4)}`,
    name,
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

  return { entry, screenshotCount: images.length, externalUrl: app.trackViewUrl }
}

const APPS = [
  {
    trackId: 6448085073,
    displayName: 'キャリタス',
    folder: 'careertas',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
  },
  {
    trackId: 1177334573,
    displayName: 'WEBGYM',
    folder: 'webgym',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タブ', 'グラフ'],
  },
  {
    trackId: 6744937056,
    displayName: 'Roughly',
    folder: 'roughly',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'グラフ', 'フォーム'],
  },
  {
    trackId: 445850671,
    displayName: 'Zaim',
    folder: 'zaim',
    defaultComponents: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'グラフ', 'タブ'],
  },
]

const current = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const existingExternalUrls = new Set((current || []).map((a) => a.externalUrl))

const created = []
for (const spec of APPS) {
  const app = await lookup(spec.trackId)
  if (existingExternalUrls.has(app.trackViewUrl)) {
    console.log(`skip (exists) ${spec.displayName}`)
    continue
  }

  const { entry, screenshotCount } = await createFromAppStore(spec)
  current.push(entry)
  created.push({ name: entry.name, id: entry.id, folder: spec.folder, screenshots: screenshotCount })
  console.log(`created ${entry.name} (${screenshotCount} store images)`)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(current, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ totalApps: current.length, created }, null, 2))

