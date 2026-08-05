import { doc, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase.config'
import type { UserRole } from '../types'

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
}
