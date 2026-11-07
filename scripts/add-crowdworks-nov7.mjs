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
  Business: '仕事効率化',
  ビジネス: '仕事効率化',
  Lifestyle: 'ライフスタイル',
  ライフスタイル: 'ライフスタイル',
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

const SPEC = {
  trackId: 1013797155,
  displayName: 'クラウドワークス',
  folder: 'crowdworks',
  inbox: 'クラウドワークス',
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
}

const inboxDir = path.join(ROOT, 'inbox', SPEC.inbox)
await fs.mkdir(inboxDir, { recursive: true })
await fs.writeFile(path.join(inboxDir, '.gitkeep'), '', 'utf-8')
await fs.writeFile(
  path.join(inboxDir, 'README.txt'),
  'このフォルダにスクショ（PNG/JPG等）を入れてください\n',
  'utf-8',
)

const current = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const exists = (current || []).some(
  (a) => a.name === SPEC.displayName || (a.externalUrl || '').includes(`id${SPEC.trackId}`),
)
if (exists) {
  console.log('skip (exists) クラウドワークス')
  process.exit(0)
}

const app = await lookup(SPEC.trackId)
const dir = path.join(ROOT, 'public/appui-images', SPEC.folder)
const iconUrl = await saveWebpSet(dir, 'icon', await fetchBuffer(app.artworkUrl512))
const entry = {
  id: `${SPEC.folder}-${Date.now()}-${uid(4)}`,
  name: SPEC.displayName,
  description: truncate(app.description),
  iconUrl,
  externalUrl: app.trackViewUrl,
  categories: [mapGenre(app.primaryGenreName)],
  components: SPEC.defaultComponents,
  sections: [],
}

current.push(entry)
await fs.writeFile(APPS_JSON, `${JSON.stringify(current, null, 2)}\n`, 'utf-8')
console.log(
  JSON.stringify(
    {
      created: {
        name: entry.name,
        id: entry.id,
        folder: SPEC.folder,
        inbox: `inbox/${SPEC.inbox}/`,
        storeName: app.trackName,
      },
    },
    null,
    2,
  ),
)
