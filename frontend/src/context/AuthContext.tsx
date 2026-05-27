import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase.config'

export interface AuthUser {
    uid: string
    name: string | null
    email: string | null
    isAnonymous: boolean
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                await signInAnonymously(auth)
                return
            }

            if (!firebaseUser.isAnonymous) {
                const ref = doc(db, 'users', firebaseUser.uid)
                const snapshot = await getDoc(ref)
                if (!snapshot.exists()) {
                    await setDoc(ref, {
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        isAnonymous: false,
                        createdAt: new Date(),
                    })
                }
            }

            setUser({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                isAnonymous: firebaseUser.isAnonymous,
            })

            setLoading(false)
        })

        return unsubscribe
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
