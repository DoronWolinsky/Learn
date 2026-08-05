import { collection, doc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore'
import { db } from '../../firebase.config'

export interface StudentResult {
    userId: string
    textId: string
    textTitle: string
    score: number
    total: number
    assignmentId: string | null
    completedAt: string
}

export const resultsApi = {
    record: async (params: {
        userId: string
        textId: string
        textTitle: string
        score: number
        total: number
        assignmentId?: string | null
        teacherId?: string | null
    }): Promise<void> => {
        const { userId, textId, textTitle, score, total, assignmentId = null, teacherId = null } = params
        await setDoc(doc(db, 'results', `${userId}_${textId}`), {
            userId,
            textId,
            textTitle,
            score,
            total,
            assignmentId,
            teacherId,
            completedAt: Timestamp.now(),
        })
    },

    listForUser: async (uid: string): Promise<Record<string, { score: number; total: number }>> => {
        const snapshot = await getDocs(query(collection(db, 'results'), where('userId', '==', uid)))
        const results: Record<string, { score: number; total: number }> = {}
        snapshot.docs.forEach(d => {
            const data = d.data()
            results[data.textId] = { score: data.score, total: data.total }
        })
        return results
    },

    listForTeacher: async (teacherId: string): Promise<StudentResult[]> => {
        const snapshot = await getDocs(query(collection(db, 'results'), where('teacherId', '==', teacherId)))
        return snapshot.docs.map(d => {
            const data = d.data()
            return {
                userId: data.userId,
                textId: data.textId,
                textTitle: data.textTitle,
                score: data.score,
                total: data.total,
                assignmentId: data.assignmentId ?? null,
                completedAt: (data.completedAt as Timestamp).toDate().toISOString(),
            }
        })
    },
}
