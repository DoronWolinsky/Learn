import { collection, doc, getDocs, getDoc, addDoc, query, where, Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../../firebase.config'
import type { Difficulty, Visibility } from '../types'

export interface TextSummary {
    id: string
    title: string
    wordCount: number
    direction: string
    createdAt: string
    ownerId: string
    difficulty: Difficulty
    visibility: Visibility
}

export interface TextFull {
    id: string
    title: string
    body: string
    dir: 'ltr' | 'rtl'
    ownerId: string
    difficulty: Difficulty
    visibility: Visibility
    sharedWith: string[]
    questions: {
        question: string
        answers: { text: string; correct: boolean }[]
    }[]
}

export interface UploadPayload {
    title: string
    body: string
    direction: 'ltr' | 'rtl'
    ownerId: string
    difficulty: Difficulty
    visibility: Visibility
    sharedWith: string[]
    questions: {
        body: string
        answers: { body: string; isCorrect: boolean }[]
    }[]
}

function computeWordCount(body: string): number {
    return body.split(/\s+/).filter(Boolean).length
}

function toSummary(d: QueryDocumentSnapshot<DocumentData>): TextSummary {
    const data = d.data()
    return {
        id: d.id,
        title: data.title,
        wordCount: data.wordCount,
        direction: data.direction,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        ownerId: data.ownerId,
        difficulty: data.difficulty,
        visibility: data.visibility,
    }
}

export const textsApi = {
    list: async (uid: string): Promise<{ texts: TextSummary[] }> => {
        const textsRef = collection(db, 'texts')
        const [publicSnap, ownedSnap, sharedSnap] = await Promise.all([
            getDocs(query(textsRef, where('visibility', '==', 'public'))),
            getDocs(query(textsRef, where('ownerId', '==', uid))),
            getDocs(query(textsRef, where('sharedWith', 'array-contains', uid))),
        ])

        const byId = new Map<string, TextSummary>()
        for (const snap of [publicSnap, ownedSnap, sharedSnap]) {
            for (const d of snap.docs) {
                if (!byId.has(d.id)) byId.set(d.id, toSummary(d))
            }
        }

        return { texts: Array.from(byId.values()) }
    },

    listOwnedBy: async (uid: string): Promise<{ texts: TextSummary[] }> => {
        const snapshot = await getDocs(query(collection(db, 'texts'), where('ownerId', '==', uid)))
        return { texts: snapshot.docs.map(toSummary) }
    },

    get: async (id: string): Promise<TextFull> => {
        const snapshot = await getDoc(doc(db, 'texts', id))
        if (!snapshot.exists()) throw new Error('Text not found')
        const data = snapshot.data()
        return {
            id: snapshot.id,
            title: data.title,
            body: data.body,
            dir: data.direction as 'ltr' | 'rtl',
            ownerId: data.ownerId,
            difficulty: data.difficulty,
            visibility: data.visibility,
            sharedWith: data.sharedWith ?? [],
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
            ownerId: payload.ownerId,
            difficulty: payload.difficulty,
            visibility: payload.visibility,
            sharedWith: payload.sharedWith,
            questions: payload.questions,
        })
    },
}
