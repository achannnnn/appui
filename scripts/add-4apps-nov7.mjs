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
  Business: '仕事効率化',
  ビジネス: '仕事効率化',
  News: 'ニュース',
  ニュース: 'ニュース',
  Shopping: 'ショッピング',
  ショッピング: 'ショッピング',
  'Food & Drink': 'フード・ドリンク',
  'フード／ドリンク': 'フード・ドリンク',
  'フード/ドリンク': 'フード・ドリンク',
  Lifestyle: 'ライフスタイル',
  ライフスタイル: 'ライフスタイル',
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

async function ensureInbox(folderLabel) {
  const dir = path.join(ROOT, 'inbox', folderLabel)
  await fs.mkdir(dir, { recursive: true })
  const readme = path.join(dir, 'README.txt')
  try {
    await fs.access(readme)
  } catch {
    await fs.writeFile(readme, 'このフォルダにスクショ（PNG/JPG等）を入れてください\n', 'utf-8')
  }
  return `inbox/${folderLabel}/`
}

// Icon only — screenshots come from inbox later
async function createIconOnly({ trackId, displayName, folder, defaultComponents, categories }) {
  const app = await lookup(trackId)
  const dir = path.join(ROOT, 'public/appui-images', folder)
  const iconUrl = await saveWebpSet(dir, 'icon', await fetchBuffer(app.artworkUrl512))

  const entry = {
    id: `${folder}-${Date.now()}-${uid(4)}`,
    name: displayName,
    description: truncate(app.description),
    iconUrl,
    externalUrl: app.trackViewUrl,
    categories: categories ?? [mapGenre(app.primaryGenreName)],
    components: defaultComponents,
    sections: [],
  }

  return { entry, externalUrl: app.trackViewUrl, storeName: app.trackName }
}

const APPS = [
  {
    // ビズリーチ・キャンパス for Student（通称「キャンパス」）
    trackId: 1144836532,
    displayName: 'キャンパス',
    folder: 'campus',
    inbox: 'キャンパス',
    defaultComponents: [
      'オンボーディング',
      'ボタン',
      'ヘッダー',
      'フォーム',
      'リスト',
      'カード',
      '検索',
      'フィルター',
      'プロフィール',
      'ボトム ナビゲーション',
    ],
  },
  {
    trackId: 1635254205,
    displayName: '求人ボックス',
    folder: 'kyujin-box',
    inbox: '求人ボックス',
    defaultComponents: [
      'オンボーディング',
      'ボタン',
      'ヘッダー',
      'フォーム',
      'リスト',
      'カード',
      '検索',
      'フィルター',
      'タブ・セグメントコントロール',
      'ボトム ナビゲーション',
    ],
  },
  {
    trackId: 1516762850,
    displayName: 'スタンバイ',
    folder: 'standby',
    inbox: 'スタンバイ',
    defaultComponents: [
      'オンボーディング',
      'ボタン',
      'ヘッダー',
      'フォーム',
      'リスト',
      'カード',
      '検索',
      'フィルター',
      'タブ・セグメントコントロール',
      'ボトム ナビゲーション',
    ],
  },
  {
    trackId: 1523260652,
    displayName: 'さとふる',
    folder: 'satofuru',
    inbox: 'さとふる',
    defaultComponents: [
      'オンボーディング',
      'ボタン',
      'ヘッダー',
      'カード',
      'リスト',
      '検索',
      'フィルター',
      'タブ・セグメントコントロール',
      'ボトム ナビゲーション',
      'フォーム',
    ],
  },
]

const current = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const existingExternalUrls = new Set((current || []).map((a) => a.externalUrl))
const existingNames = new Set((current || []).map((a) => a.name))

const created = []
const inboxPaths = []

for (const spec of APPS) {
  inboxPaths.push(await ensureInbox(spec.inbox))

  const app = await lookup(spec.trackId)
  if (existingExternalUrls.has(app.trackViewUrl) || existingNames.has(spec.displayName)) {
    console.log(`skip (exists) ${spec.displayName}`)
    continue
  }

  const { entry, storeName } = await createIconOnly(spec)
  current.push(entry)
  existingExternalUrls.add(entry.externalUrl)
  existingNames.add(entry.name)
  created.push({
    name: entry.name,
    id: entry.id,
    folder: spec.folder,
    inbox: `inbox/${spec.inbox}/`,
    storeName,
  })
  console.log(`created ${entry.name} ← ${storeName}`)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(current, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ totalApps: current.length, created, inboxPaths }, null, 2))
