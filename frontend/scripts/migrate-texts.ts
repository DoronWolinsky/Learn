import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Expects a gitignored Firebase Admin service-account key at frontend/service-account.json
// (download from Firebase console: Project settings -> Service accounts -> Generate new private key).
const serviceAccount = JSON.parse(readFileSync(path.join(__dirname, '..', 'service-account.json'), 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function main() {
    const snapshot = await db.collection('texts').get()
    let migrated = 0

    for (const doc of snapshot.docs) {
        const data = doc.data()
        const updates: Record<string, unknown> = {}
        if (data.visibility === undefined) updates.visibility = 'public'
        if (data.difficulty === undefined) updates.difficulty = 'beginner'
        if (data.ownerId === undefined) updates.ownerId = 'legacy'
        if (data.sharedWith === undefined) updates.sharedWith = []

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates)
            migrated++
        }
    }

    console.log(`Migrated ${migrated} of ${snapshot.size} texts.`)
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
