import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../../firebase.config'
import type { UserRole } from '../types'

export interface AuthUser {
    uid: string
    name: string | null
    email: string | null
    isAnonymous: boolean
    roles: UserRole[] | null
}

interface AuthContextType {
    user: AuthUser | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubscribeUserDoc: (() => void) | null = null

        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            unsubscribeUserDoc?.()
            unsubscribeUserDoc = null

            if (!firebaseUser) {
                signInAnonymously(auth)
                return
            }

            if (firebaseUser.isAnonymous) {
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    isAnonymous: true,
                    roles: null,
                })
                setLoading(false)
                return
            }

            unsubscribeUserDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
                const data = snapshot.data()
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    isAnonymous: false,
                    roles: (data?.roles as UserRole[] | undefined) ?? null,
                })
                setLoading(false)
            })
        })

        return () => {
            unsubscribeUserDoc?.()
            unsubscribeAuth()
        }
    }, [])

    async function logout() {
        await signOut(auth)
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
