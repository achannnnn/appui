import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const appsPath = path.join(root, 'public/apps.json')
const imagesRoot = path.join(root, 'public/appui-images')

const MIME_EXT = {
  'image/webp': '.webp',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

function sanitizeSegment(value, fallback = 'item') {
  const cleaned = String(value || '')
    .normalize('NFKC')
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || fallback
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl)
  if (!match) return null
  const mime = (match[1] || 'application/octet-stream').toLowerCase()
  const isBase64 = Boolean(match[2])
  const payload = match[3] || ''
  const buffer = isBase64
    ? Buffer.from(payload, 'base64')
    : Buffer.from(decodeURIComponent(payload), 'utf8')
  return { mime, buffer }
}

function extensionFor(mime, filename) {
  const fromName = path.extname(filename || '').toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  return MIME_EXT[mime] || '.bin'
}

async function uniquePath(dir, filename) {
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  let candidate = path.join(dir, filename)
  let i = 2
  while (true) {
    try {
      await fs.access(candidate)
      candidate = path.join(dir, `${base}-${i}${ext}`)
      i += 1
    } catch {
      return candidate
    }
  }
}

async function extractOne(dataUrl, appDir, preferredName) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return null
  const filename = sanitizeSegment(preferredName || `image${extensionFor(parsed.mime)}`, `image${extensionFor(parsed.mime)}`)
  const withExt = path.extname(filename) ? filename : `${filename}${extensionFor(parsed.mime)}`
  const filePath = await uniquePath(appDir, withExt)
  await fs.writeFile(filePath, parsed.buffer)
  const rel = path.relative(path.join(root, 'public'), filePath).split(path.sep).join('/')
  return `/${rel}`
}

async function main() {
  const raw = await fs.readFile(appsPath, 'utf8')
  const apps = JSON.parse(raw)
  if (!Array.isArray(apps)) {
    throw new Error('apps.json must be an array')
  }

  await fs.mkdir(imagesRoot, { recursive: true })

  let converted = 0
  let skipped = 0

  for (const app of apps) {
    if (!app || typeof app !== 'object') continue
    const appId = sanitizeSegment(app.id || app.name || 'app', 'app')
    const appDir = path.join(imagesRoot, appId)
    await fs.mkdir(appDir, { recursive: true })

    if (typeof app.iconUrl === 'string' && app.iconUrl.startsWith('data:')) {
      const url = await extractOne(app.iconUrl, appDir, 'icon.webp')
      if (url) {
        app.iconUrl = url
        converted += 1
      } else {
        skipped += 1
      }
    }

    for (const section of app.sections || []) {
      for (const image of section.images || []) {
        if (typeof image?.src !== 'string' || !image.src.startsWith('data:')) {
          skipped += 1
          continue
        }
        const preferred = image.filename || `${image.id || 'image'}.webp`
        const url = await extractOne(image.src, appDir, preferred)
        if (url) {
          image.src = url
          converted += 1
        } else {
          skipped += 1
        }
      }
    }
  }

  await fs.writeFile(appsPath, `${JSON.stringify(apps, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify({ converted, skipped, apps: apps.length }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
