import { collection, doc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../../firebase.config'

export interface Assignment {
    id: string
    teacherId: string
    teacherName: string | null
    studentId: string
    textId: string
    textTitle: string
    wpm: number
    wordsPerWindow: number
    blurAmount: number
    createdAt: string
}

function toAssignment(d: QueryDocumentSnapshot<DocumentData>): Assignment {
    const data = d.data()
    return {
        id: d.id,
        teacherId: data.teacherId,
        teacherName: data.teacherName ?? null,
        studentId: data.studentId,
        textId: data.textId,
        textTitle: data.textTitle,
        wpm: data.wpm,
        wordsPerWindow: data.wordsPerWindow,
        blurAmount: data.blurAmount,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    }
}

export const assignmentsApi = {
    create: async (params: {
        teacherId: string
        teacherName: string | null
        studentId: string
        textId: string
        textTitle: string
        wpm: number
        wordsPerWindow: number
        blurAmount: number
    }): Promise<void> => {
        const { teacherId, teacherName, studentId, textId, textTitle, wpm, wordsPerWindow, blurAmount } = params
        await setDoc(doc(db, 'assignments', `${studentId}_${textId}`), {
            teacherId,
            teacherName,
            studentId,
            textId,
            textTitle,
            wpm,
            wordsPerWindow,
            blurAmount,
            createdAt: Timestamp.now(),
        })
    },

    listForStudent: async (studentId: string): Promise<Assignment[]> => {
        const snapshot = await getDocs(query(collection(db, 'assignments'), where('studentId', '==', studentId)))
        return snapshot.docs.map(toAssignment)
    },

    listForTeacher: async (teacherId: string): Promise<Assignment[]> => {
        const snapshot = await getDocs(query(collection(db, 'assignments'), where('teacherId', '==', teacherId)))
        return snapshot.docs.map(toAssignment)
    },
}
