import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/Spinner'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <Spinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
