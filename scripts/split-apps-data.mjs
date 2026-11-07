import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
const INDEX_JSON = path.join(ROOT, 'public/apps-index.json')
const COMPONENTS_JSON = path.join(ROOT, 'public/apps-components.json')
const DATA_DIR = path.join(ROOT, 'public/apps-data')

function folderFromIconUrl(iconUrl = '') {
  const match = String(iconUrl).match(/\/appui-images\/([^/]+)\//)
  return match?.[1] || ''
}

function slugifyLabel(value, fallback = 'item') {
  const cleaned = String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/[\/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || fallback
}

function ensureAppSlug(app, used) {
  if (app.slug && !used.has(app.slug)) {
    used.add(app.slug)
    return app.slug
  }
  const fromFolder = folderFromIconUrl(app.iconUrl)
  let base = slugifyLabel(fromFolder || app.name || app.id, 'app').toLowerCase()
  if (!base) base = 'app'
  let slug = base
  let n = 2
  while (used.has(slug)) {
    const suffix = String(app.id || '').split('-').pop() || String(n)
    slug = `${base}-${suffix}`
    n += 1
  }
  used.add(slug)
  return slug
}

function toIndexEntry(app) {
  const store = (app.sections || []).find((s) => s.title === 'ストア画像') || (app.sections || [])[0]
  const previewImages = ((store && store.images) || []).slice(0, 3)
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    description: app.description,
    iconUrl: app.iconUrl,
    externalUrl: app.externalUrl,
    categories: app.categories || [],
    components: app.components || [],
    sections: store
      ? [
          {
            id: store.id,
            title: store.title,
            images: previewImages,
          },
        ]
      : [],
  }
}

export async function splitAppsData() {
  const raw = await fs.readFile(APPS_JSON, 'utf-8')
  const parsed = JSON.parse(raw)
  const apps = Array.isArray(parsed) ? parsed : []
  const used = new Set()

  const withSlugs = apps.map((app) => {
    const slug = ensureAppSlug(app, used)
    return { ...app, slug }
  })

  await fs.mkdir(DATA_DIR, { recursive: true })

  // Clear stale per-app files
  const existing = await fs.readdir(DATA_DIR).catch(() => [])
  await Promise.all(
    existing
      .filter((name) => name.endsWith('.json'))
      .map((name) => fs.unlink(path.join(DATA_DIR, name)).catch(() => {})),
  )

  const index = []
  const componentImages = []

  for (const app of withSlugs) {
    await fs.writeFile(path.join(DATA_DIR, `${app.id}.json`), `${JSON.stringify(app, null, 2)}\n`, 'utf-8')
    if (app.hidden) continue
    index.push(toIndexEntry(app))
    for (const section of app.sections || []) {
      for (const image of section.images || []) {
        componentImages.push({
          appId: app.id,
          appSlug: app.slug,
          appName: app.name,
          sectionId: section.id,
          sectionTitle: section.title || 'セクション未設定',
          imageId: image.id,
          src: image.src,
          components: image.components || [],
        })
      }
    }
  }

  // Keep apps.json in sync with slugs
  await fs.writeFile(APPS_JSON, `${JSON.stringify(withSlugs, null, 2)}\n`, 'utf-8')
  await fs.writeFile(INDEX_JSON, `${JSON.stringify(index, null, 2)}\n`, 'utf-8')
  await fs.writeFile(COMPONENTS_JSON, `${JSON.stringify(componentImages)}\n`, 'utf-8')

  return {
    apps: withSlugs.length,
    indexBytes: Buffer.byteLength(JSON.stringify(index)),
    componentsBytes: Buffer.byteLength(JSON.stringify(componentImages)),
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const result = await splitAppsData()
  console.log(JSON.stringify({ ok: true, ...result }, null, 2))
}
