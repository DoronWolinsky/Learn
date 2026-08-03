
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider} from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAEh3TVc5MHKOhb6Ey9lLyVyY1fh5fcA5I",
    authDomain: "veloxlearn.firebaseapp.com",
    projectId: "veloxlearn",
    storageBucket: "veloxlearn.firebasestorage.app",
    messagingSenderId: "149683631793",
    appId: "1:149683631793:web:bc6f1e056529178c58d490",
    measurementId: "G-6DLEPPM02B"
}


const app = initializeApp(firebaseConfig)
getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()