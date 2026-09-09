const GLOBAL_FAVORITES_KEY = 'ui-zukan:favorite-apps'

export function readFavoriteAppIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GLOBAL_FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function writeFavoriteAppIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GLOBAL_FAVORITES_KEY, JSON.stringify([...new Set(ids)]))
}

export function isAppFavorited(appId: string): boolean {
  return readFavoriteAppIds().includes(appId)
}

export function setAppFavorited(appId: string, favorited: boolean) {
  const current = readFavoriteAppIds()
  if (favorited) {
    writeFavoriteAppIds([...current, appId])
  } else {
    writeFavoriteAppIds(current.filter((id) => id !== appId))
  }
}
