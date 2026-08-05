import { doc, getDoc, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase.config'
import type { UserRole } from '../types'

export interface EmailIndexEntry {
    uid: string
    roles: UserRole[]
}

export const usersApi = {
    completeOnboarding: async (uid: string, params: { name: string | null; email: string; roles: UserRole[] }): Promise<void> => {
        const { name, email, roles } = params
        const normalizedEmail = email.trim().toLowerCase()

        const batch = writeBatch(db)
        batch.set(doc(db, 'users', uid), {
            name,
            email,
            roles,
            isAnonymous: false,
            createdAt: Timestamp.now(),
        })
        batch.set(doc(db, 'emailIndex', normalizedEmail), {
            uid,
            roles,
        })
        await batch.commit()
    },

    lookupByEmail: async (email: string): Promise<EmailIndexEntry | null> => {
        const normalizedEmail = email.trim().toLowerCase()
        const snapshot = await getDoc(doc(db, 'emailIndex', normalizedEmail))
        if (!snapshot.exists()) return null
        const data = snapshot.data()
        return { uid: data.uid, roles: data.roles as UserRole[] }
    },
}
