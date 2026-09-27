import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AdminScreen } from './components/AdminScreen'
import { Seo } from './components/Seo'
import type { AppData } from '../types/app'

export default function AdminRoute() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<AppData[]>([])

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        const response = await fetch('/apps.json', { cache: 'no-store' })
        const data = (await response.json()) as AppData[]
        if (!canceled) setApps(Array.isArray(data) ? data : [])
      } catch {
        if (!canceled) setApps([])
      }
    })()
    return () => {
      canceled = true
    }
  }, [])

  return (
    <>
      <Seo title="管理画面" path="/admin" noindex description="管理画面" />
      <AdminScreen
        apps={apps}
        onBack={() => navigate('/')}
        onRegistered={() => {
          void fetch('/api/admin/split-apps', { method: 'POST' }).catch(() => {})
          navigate('/')
        }}
      />
    </>
  )
}
