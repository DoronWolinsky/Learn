import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { textsApi } from '../api/texts'
import type { TextSummary, TextFull } from '../api/texts'
import { resultsApi } from '../api/results'

function SetupPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()

    const [progress, setProgress] = useState<Record<string, { score: number; total: number }>>({})

    useEffect(() => {
        if (user && !user.isAnonymous) {
            resultsApi.listForUser(user.uid).then(setProgress)
        } else {
            const stored: Record<string, { score: number; total: number }> =
                JSON.parse(localStorage.getItem('textProgress') || '{}')
            setProgress(stored)
        }
    }, [user])

    const [wpm, setWpm] = useState(200)
    const [wordsPerWindow, setWordsPerWindow] = useState(3)
    const [blurAmount, setBlurAmount] = useState(2)

    const [texts, setTexts] = useState<TextSummary[]>([])
    const [selectedSummary, setSelectedSummary] = useState<TextSummary | null>(null)
    const [selectedFull, setSelectedFull] = useState<TextFull | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        textsApi.list(user.uid)
            .then(data => {
                setTexts(data.texts)
                if (data.texts.length > 0) handleSelectText(data.texts[0])
            })
            .catch(() => setError('Could not load texts. Please try again.'))
            .finally(() => setLoading(false))
    }, [user])

    async function handleSelectText(summary: TextSummary) {
        setSelectedSummary(summary)
        setSelectedFull(null)
        const full = await textsApi.get(summary.id)
        setSelectedFull(full)
    }

    const changeWpm = (delta: number) => setWpm(prev => Math.min(900, Math.max(20, prev + delta)))
    const changeWordsPerWindow = (delta: number) => setWordsPerWindow(prev => Math.min(10, Math.max(1, prev + delta)))

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center justify-center px-6 py-12 relative transition-colors duration-300">
            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <button
                onClick={() => navigate('/')}
                className="absolute top-5 left-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                ← Back
            </button>

            <div className="w-full max-w-xl flex flex-col gap-12">
                <h2 className="text-3xl font-bold text-center">Set up your session</h2>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm uppercase tracking-widest opacity-50">Words per minute</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => changeWpm(-10)} className="w-10 h-10 rounded-full border border-[#1a1a2e]/20 dark:border-white/10 text-xl font-bold hover:opacity-70 transition-opacity">−</button>
                        <span className="text-6xl font-bold w-36 text-center tabular-nums">{wpm}</span>
                        <button onClick={() => changeWpm(10)} className="w-10 h-10 rounded-full border border-[#1a1a2e]/20 dark:border-white/10 text-xl font-bold hover:opacity-70 transition-opacity">+</button>
                    </div>
                    <input type="range" min={20} max={900} step={10} value={wpm} onChange={e => setWpm(Number(e.target.value))} className="w-full accent-[#7c3aed]" />
                </div>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm uppercase tracking-widest opacity-50">Words per window</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => changeWordsPerWindow(-1)} className="w-10 h-10 rounded-full border border-[#1a1a2e]/20 dark:border-white/10 text-xl font-bold hover:opacity-70 transition-opacity">−</button>
                        <span className="text-6xl font-bold w-36 text-center tabular-nums">{wordsPerWindow}</span>
                        <button onClick={() => changeWordsPerWindow(1)} className="w-10 h-10 rounded-full border border-[#1a1a2e]/20 dark:border-white/10 text-xl font-bold hover:opacity-70 transition-opacity">+</button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm uppercase tracking-widest opacity-50">Background blur</p>
                    <div className="w-full flex items-center gap-4">
                        <span className="text-xs opacity-40">None</span>
                        <input type="range" min={0} max={4} step={1} value={blurAmount} onChange={e => setBlurAmount(Number(e.target.value))} className="flex-1 accent-[#7c3aed]" />
                        <span className="text-xs opacity-40">Max</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-widest opacity-50 text-center">Choose a text</p>

                    {loading && <p className="text-center opacity-40 text-sm">Loading texts...</p>}
                    {error && <p className="text-center text-red-500 text-sm">{error}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        {texts.map(text => {
                            const minutes = Math.ceil(text.wordCount / wpm)
                            const isSelected = selectedSummary?.id === text.id
                            const entry = user && !user.isAnonymous ? progress[text.id] : progress[text.title]
                            const progressBorder = entry
                                ? entry.score === entry.total
                                    ? 'border-green-500'
                                    : 'border-orange-400'
                                : 'border-[#1a1a2e]/10 dark:border-white/10 hover:border-[#7c3aed]/40'
                            return (
                                <button
                                    key={text.id}
                                    onClick={() => handleSelectText(text)}
                                    dir={text.direction as 'ltr' | 'rtl'}
                                    className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all duration-150 ${
                                        isSelected ? 'border-[#7c3aed] shadow-lg shadow-[#7c3aed]/20' : progressBorder
                                    }`}
                                >
                                    <span className="font-semibold text-sm leading-snug">{text.title}</span>
                                    <span className="text-xs opacity-50">{text.wordCount} words · ~{minutes} min</span>
                                    <span className="text-xs uppercase tracking-wider opacity-40">{text.direction}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button
                    disabled={!selectedFull}
                    onClick={() => navigate('/read', { state: { text: selectedFull, wpm, wordsPerWindow, blurAmount } })}
                    className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Start Reading
                </button>

                <button
                    onClick={() => navigate('/upload')}
                    className="w-full py-3 rounded-2xl text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
                >
                    Upload a new text
                </button>
            </div>
        </div>
    )
}

export default SetupPage
