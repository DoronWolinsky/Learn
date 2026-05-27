import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export function RegisteredRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user || user.isAnonymous) return <Navigate to="/login" replace />

    return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (user && !user.isAnonymous) return <Navigate to="/" replace />

    return <>{children}</>
}
