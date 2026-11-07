import { useEffect } from 'react'
import { useLocation } from 'react-router'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || ''

function ensureGtag(id: string) {
  if (typeof window === 'undefined') return
  if (window.gtag) return

  window.dataLayer = window.dataLayer || []
  // gtag.js only runs commands pushed as an Arguments object, not a real Array.
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

export function Analytics() {
  const location = useLocation()

  useEffect(() => {
    if (!GA_ID) return
    ensureGtag(GA_ID)
  }, [])

  useEffect(() => {
    if (!GA_ID || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
    })
  }, [location.pathname, location.search])

  return null
}
