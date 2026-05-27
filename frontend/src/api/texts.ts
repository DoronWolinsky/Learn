import { collection, doc, getDocs, getDoc, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase.config'

export interface TextSummary {
    id: string
    title: string
    wordCount: number
    direction: string
    createdAt: string
}

export interface TextFull {
    title: string
    body: string
    dir: 'ltr' | 'rtl'
    questions: {
        question: string
        answers: { text: string; correct: boolean }[]
    }[]
}

export interface UploadPayload {
    title: string
    body: string
    direction: 'ltr' | 'rtl'
    questions: {
        body: string
        answers: { body: string; isCorrect: boolean }[]
    }[]
}

function computeWordCount(body: string): number {
    return body.split(/\s+/).filter(Boolean).length
}

export const textsApi = {
    list: async (): Promise<{ texts: TextSummary[] }> => {
        const snapshot = await getDocs(collection(db, 'texts'))
        const texts = snapshot.docs.map(d => {
            const data = d.data()
            return {
                id: d.id,
                title: data.title,
                wordCount: data.wordCount,
                direction: data.direction,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            }
        })
        return { texts }
    },

    get: async (id: string): Promise<TextFull> => {
        const snapshot = await getDoc(doc(db, 'texts', id))
        if (!snapshot.exists()) throw new Error('Text not found')
        const data = snapshot.data()
        return {
            title: data.title,
            body: data.body,
            dir: data.direction as 'ltr' | 'rtl',
            questions: data.questions.map((q: { body: string; answers: { body: string; isCorrect: boolean }[] }) => ({
                question: q.body,
                answers: q.answers.map(a => ({
                    text: a.body,
                    correct: a.isCorrect,
                })),
            })),
        }
    },

    upload: async (payload: UploadPayload): Promise<void> => {
        await addDoc(collection(db, 'texts'), {
            title: payload.title,
            body: payload.body,
            direction: payload.direction,
            wordCount: computeWordCount(payload.body),
            createdAt: Timestamp.now(),
            questions: payload.questions,
        })
    },
}
