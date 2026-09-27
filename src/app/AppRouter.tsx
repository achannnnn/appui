import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App'
import { DetailScreen } from './components/DetailScreen'
import { CompareTray, CompareView } from './components/ComparePanel'
import { Seo } from './components/Seo'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { RequestPage } from './pages/RequestPage'
import { decodeFilterSlug } from './lib/slug'
import {
  compareSlotCount,
  toggleCompareSlot,
  type CompareItem,
} from './lib/compare'
import type { AppData } from '../types/app'

const AdminRoute = import.meta.env.DEV
  ? lazy(() => import('./AdminRoute'))
  : null

function AppDetailRoute() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [compareSlots, setCompareSlots] = useState<[CompareItem | null, CompareItem | null]>([null, null])
  const [compareOpen, setCompareOpen] = useState(false)

  const compareKeys = new Set<string>()
  if (compareSlots[0]) compareKeys.add(compareSlots[0].key)
  if (compareSlots[1]) compareKeys.add(compareSlots[1].key)

  useEffect(() => {
    let canceled = false
    ;(async () => {
      setLoading(true)
      try {
        const indexRes = await fetch('/apps-index.json')
        const index = (await indexRes.json()) as AppData[]
        const hit = (Array.isArray(index) ? index : []).find((item) => item.slug === slug)
        if (!hit) {
          if (!canceled) {
            setApp(null)
            setLoading(false)
          }
          return
        }
        const detailRes = await fetch(`/apps-data/${encodeURIComponent(hit.id)}.json`)
        if (!detailRes.ok) throw new Error('detail missing')
        const detail = (await detailRes.json()) as AppData
        if (!canceled) setApp(detail)
      } catch {
        if (!canceled) setApp(null)
      } finally {
        if (!canceled) setLoading(false)
      }
    })()
    return () => {
      canceled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efede4] font-['Noto_Sans_JP:Medium',sans-serif] text-[#999]">
        読み込み中...
      </div>
    )
  }

  if (!app) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <Seo
        title={`${app.name}のUI`}
        description={app.description || `${app.name}のアプリUIギャラリー`}
        path={`/apps/${app.slug || slug}`}
        image={app.iconUrl}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: app.name,
          description: app.description,
          applicationCategory: app.categories?.[0] || 'MultimediaApplication',
          operatingSystem: 'iOS',
          image: app.iconUrl,
        }}
      />
      <DetailScreen
        app={app}
        compareKeys={compareKeys}
        onBack={() => navigate('/')}
        onToggleCompare={(item) => {
          setCompareSlots((previous) => {
            const next = toggleCompareSlot(previous, item)
            if (compareSlotCount(next) < 2) setCompareOpen(false)
            return next
          })
        }}
      />
      <CompareTray
        onClear={() => {
          setCompareSlots([null, null])
          setCompareOpen(false)
        }}
        onOpenCompare={() => setCompareOpen(true)}
        onRemove={(index) => {
          setCompareSlots((previous) => {
            const next: [CompareItem | null, CompareItem | null] = [previous[0], previous[1]]
            next[index] = null
            return next
          })
          setCompareOpen(false)
        }}
        slots={compareSlots}
      />
      {compareOpen && compareSlots[0] && compareSlots[1] && (
        <CompareView
          onClose={() => setCompareOpen(false)}
          onRemove={(index) => {
            setCompareSlots((previous) => {
              const next: [CompareItem | null, CompareItem | null] = [previous[0], previous[1]]
              next[index] = null
              return next
            })
            setCompareOpen(false)
          }}
          slots={[compareSlots[0], compareSlots[1]]}
        />
      )}
    </>
  )
}

function CategoryRoute() {
  const { slug = '' } = useParams()
  return <App initialCategory={decodeFilterSlug(slug)} />
}

function ComponentRoute() {
  const { slug = '' } = useParams()
  return <App initialComponent={decodeFilterSlug(slug)} />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/apps/:slug" element={<AppDetailRoute />} />
      <Route path="/category/:slug" element={<CategoryRoute />} />
      <Route path="/component/:slug" element={<ComponentRoute />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/request" element={<RequestPage />} />
      {import.meta.env.DEV && AdminRoute ? (
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminRoute />
            </Suspense>
          }
        />
      ) : null}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
