import { collection, doc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore'
import { db } from '../../firebase.config'
import { usersApi } from './users'

export interface Connection {
    teacherId: string
    studentId: string
    studentEmail: string
    studentName: string | null
    createdAt: string
}

export const connectionsApi = {
    createByEmail: async (teacherId: string, email: string): Promise<void> => {
        const entry = await usersApi.lookupByEmail(email)
        if (!entry) throw new Error('No account found for that email.')
        if (!entry.roles.includes('student')) throw new Error('That account is not registered as a student.')

        await setDoc(doc(db, 'connections', `${teacherId}_${entry.uid}`), {
            teacherId,
            studentId: entry.uid,
            studentEmail: email.trim().toLowerCase(),
            studentName: entry.name,
            createdAt: Timestamp.now(),
        })
    },

    listForTeacher: async (teacherId: string): Promise<Connection[]> => {
        const snapshot = await getDocs(query(collection(db, 'connections'), where('teacherId', '==', teacherId)))
        return snapshot.docs.map(d => {
            const data = d.data()
            return {
                teacherId: data.teacherId,
                studentId: data.studentId,
                studentEmail: data.studentEmail,
                studentName: data.studentName ?? null,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            }
        })
    },
}
