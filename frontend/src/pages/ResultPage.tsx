import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { resultsApi } from '../api/results'

interface ResultState {
    score: number
    total: number
    textId: string
    textTitle: string
}

function ResultPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()
    const state = useLocation().state as ResultState | null

    if (!state) {
        navigate('/')
        return null
    }

    const { score, total, textId, textTitle } = state

    useEffect(() => {
        if (user && !user.isAnonymous) {
            resultsApi.record({ userId: user.uid, textId, textTitle, score, total })
            return
        }
        const existing = localStorage.getItem('textProgress')
        const parsed = existing ? JSON.parse(existing) : {}
        parsed[textTitle] = { score, total }
        localStorage.setItem('textProgress', JSON.stringify(parsed))
    }, [])

    const passed = score === total

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center justify-center px-6 py-12 relative transition-colors duration-300">
            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="flex flex-col items-center gap-8">
                <p className="text-sm uppercase tracking-widest opacity-50">Results</p>
                <h1 className="text-9xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent tabular-nums">
                    {score}/{total}
                </h1>
                <p className="text-xl opacity-60">
                    {passed ? 'Perfect score!' : `You answered ${score} out of ${total} correctly.`}
                </p>
                <button
                    onClick={() => navigate('/setup')}
                    className="mt-4 px-12 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30"
                >
                    Back to Setup
                </button>
            </div>
        </div>
    )
}

export default ResultPage
