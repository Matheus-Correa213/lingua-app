import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getProfile } from '../lib/storage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const profile = getProfile()
    if (profile) {
      router.push('/app')
    } else {
      router.push('/onboarding')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
        <div style={{ color: 'var(--muted)', fontSize: 16 }}>Carregando Língua...</div>
      </div>
    </div>
  )
}
