const FALLBACK_SITE_URL = 'http://localhost:5173'

export function getSiteUrl(): string {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim()
  const base = raw && raw.length > 0 ? raw : FALLBACK_SITE_URL
  return base.replace(/\/$/, '')
}

export function absoluteUrl(pathname = '/'): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${getSiteUrl()}${path}`
}

export const SITE_NAME = 'アプリUI図鑑'
export const SITE_TAGLINE = 'アプリデザインの参考になるギャラリーサイト'
export const DEFAULT_DESCRIPTION =
  '日本の人気アプリの実機UIを集めたデザイン参考ギャラリー。カテゴリやコンポーネントで探し、画面構成のアイデアを素早く比較できます。'
