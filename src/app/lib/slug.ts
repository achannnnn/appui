import type { AppData } from '../../types/app'

export function folderFromIconUrl(iconUrl = ''): string {
  const match = String(iconUrl).match(/\/appui-images\/([^/]+)\//)
  return match?.[1] || ''
}

export function slugifyLabel(value: string, fallback = 'item'): string {
  const cleaned = String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/[\/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || fallback
}

export function ensureAppSlug(app: Pick<AppData, 'id' | 'name' | 'iconUrl' | 'slug'>, used = new Set<string>()): string {
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

export function encodeFilterSlug(label: string): string {
  return encodeURIComponent(String(label || '').trim())
}

export function decodeFilterSlug(slug: string): string {
  try {
    return decodeURIComponent(String(slug || ''))
  } catch {
    return String(slug || '')
  }
}
