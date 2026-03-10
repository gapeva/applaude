import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store'
import { Loader2 } from 'lucide-react'

export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const code = params.get('code')
    if (!code) {
      navigate('/login?error=no_code')
      return
    }

    authAPI.handleCallback(code)
      .then(({ user, token }) => {
        setAuth(user, token)
        navigate('/dashboard')
      })
      .catch(() => {
        navigate('/login?error=auth_failed')
      })
  }, [params, navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-applaude-navy">
      <div className="text-center">
        <Loader2 size={32} className="text-applaude-blue animate-spin mx-auto mb-4" />
        <p className="text-white/60 font-display">Authenticating with GitHub...</p>
      </div>
    </div>
  )
}
