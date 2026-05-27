import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase.config'

function LoginPage() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleGoogleSignIn() {
        setError(null)
        setLoading(true)
        try {
            await signInWithPopup(auth, googleProvider)
            navigate('/')
        } catch {
            setError('Sign in failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center justify-center px-6 transition-colors duration-300">
            <div className="w-full max-w-sm flex flex-col gap-8">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">
                        VeloxLearn
                    </h1>
                    <p className="text-sm opacity-50 uppercase tracking-widest">Welcome back</p>
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in…' : 'Sign in with Google'}
                </button>
            </div>
        </div>
    )
}

export default LoginPage
