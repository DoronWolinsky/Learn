import { doc, getDoc, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase.config'
import type { UserRole } from '../types'

export interface EmailIndexEntry {
    uid: string
    name: string | null
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
        // Mirrors `name`/`roles` here (not just uid) because Firestore rules only let a user read
        // their own `users/{uid}` doc — this is the only doc a teacher is allowed to read to find
        // a student's name/eligibility by email.
        batch.set(doc(db, 'emailIndex', normalizedEmail), {
            uid,
            name,
            roles,
        })
        await batch.commit()
    },

    lookupByEmail: async (email: string): Promise<EmailIndexEntry | null> => {
        const normalizedEmail = email.trim().toLowerCase()
        const snapshot = await getDoc(doc(db, 'emailIndex', normalizedEmail))
        if (!snapshot.exists()) return null
        const data = snapshot.data()
        return { uid: data.uid, name: data.name ?? null, roles: data.roles as UserRole[] }
    },
}
