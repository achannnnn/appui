/**
 * Prepend App Store screenshots for the 5 apps added on Nov 7.
 * node scripts/add-store-screens-5apps.mjs
 */
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
const LIST = 600
const DETAIL = 1200
const Q = 90

const TARGETS = [
  { id: 'campus-1794033030755-by3t', trackId: 1144836532, folder: 'campus' },
  { id: 'kyujin-box-1794033031436-6ji1', trackId: 1635254205, folder: 'kyujin-box' },
  { id: 'standby-1794033032183-3g2e', trackId: 1516762850, folder: 'standby' },
  { id: 'satofuru-1794033032669-11tz', trackId: 1523260652, folder: 'satofuru' },
  { id: null, name: 'クラウドワークス', trackId: 1013797155, folder: 'crowdworks' },
]

function uid(len = 7) {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += c[(Math.random() * c.length) | 0]
  return s
}

function hiResUrl(url) {
  return url.replace(/\/\d+x\d+[a-z]*\.(jpg|jpeg|png|webp)$/i, '/2000x2000bb.$1')
}

async function toMasterWebp(buffer) {
  return sharp(buffer, { animated: false })
    .rotate()
    .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function toDisplayWebp(buffer, maxWidth) {
  return sharp(buffer, { animated: false })
    .resize({ width: maxWidth, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .webp({ quality: Q, alphaQuality: Q, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function saveWebpSet(dir, baseName, buffer) {
  const master = await toMasterWebp(buffer)
  await fs.writeFile(path.join(dir, `${baseName}.webp`), master)
  await fs.writeFile(path.join(dir, `${baseName}.list.webp`), await toDisplayWebp(master, LIST))
  await fs.writeFile(path.join(dir, `${baseName}.detail.webp`), await toDisplayWebp(master, DETAIL))
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

const apps = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const report = []

for (const spec of TARGETS) {
  const idx = apps.findIndex((app) => (spec.id && app.id === spec.id) || app.name === spec.name)
  if (idx < 0) {
    console.warn(`missing ${spec.folder}`)
    continue
  }
  const app = apps[idx]
  const store = await lookup(spec.trackId)
  const shots = store.screenshotUrls || []
  const dir = path.join(ROOT, 'public/appui-images', spec.folder)
  await fs.mkdir(dir, { recursive: true })
  const images = []
  for (let i = 0; i < shots.length; i++) {
    const num = String(i + 1).padStart(2, '0')
    const src = await saveWebpSet(dir, `screen-${num}`, await fetchBuffer(shots[i]))
    images.push({
      id: uid(),
      src,
      filename: `screen-${num}.webp`,
      components: (app.components || []).slice(0, 5),
    })
    process.stdout.write(`\r${app.name} ${i + 1}/${shots.length}   `)
  }
  process.stdout.write('\n')
  const storeSection = {
    id: uid(),
    title: 'ストア画像',
    images,
  }
  app.sections = [storeSection, ...(app.sections || []).filter((section) => section.title !== 'ストア画像')]
  report.push({ name: app.name, screenshots: images.length })
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify(report, null, 2))
