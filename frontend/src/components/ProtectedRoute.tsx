import { Navigate, useLocation } from 'react-router-dom'
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

export function TeacherRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user || user.isAnonymous || !user.roles?.includes('teacher')) return <Navigate to="/" replace />

    return <>{children}</>
}

export function StudentRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user || user.isAnonymous || !user.roles?.includes('student')) return <Navigate to="/" replace />

    return <>{children}</>
}

export function OnboardingGate({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <>{children}</>

    const onOnboardingPage = location.pathname === '/onboarding'
    const needsOnboarding = !!user && !user.isAnonymous && user.roles === null

    if (needsOnboarding && !onOnboardingPage) return <Navigate to="/onboarding" replace />
    if (!needsOnboarding && onOnboardingPage) return <Navigate to="/" replace />

    return <>{children}</>
}
