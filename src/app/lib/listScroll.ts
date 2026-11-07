const STORAGE_KEY = 'appui-list-scroll'

type ScrollMap = Record<string, number>

function readMap(): ScrollMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as ScrollMap
  } catch {
    return {}
  }
}

export function saveListScroll(path: string, y: number) {
  const map = readMap()
  map[path] = Math.max(0, Math.round(y))
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function readListScroll(path: string): number | null {
  const y = readMap()[path]
  return typeof y === 'number' && Number.isFinite(y) ? y : null
}
