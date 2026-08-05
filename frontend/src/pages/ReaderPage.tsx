import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

interface TextData {
    id: string
    title: string
    body: string
    dir: 'ltr' | 'rtl'
}

interface LocationState {
    text: TextData
    wpm: number
    wordsPerWindow: number
    blurAmount: number
}

interface Chunk {
    globalStart: number
    globalEnd: number
}

interface ParagraphData {
    words: string[]
    startIndex: number
}

function buildParagraphs(body: string): { paragraphs: ParagraphData[], totalWords: number } {
    const paragraphTexts = body.split(/\n\n+/)
    const paragraphs: ParagraphData[] = []
    let globalIndex = 0

    for (const para of paragraphTexts) {
        const words = para.split(/\s+/).filter(Boolean)
        paragraphs.push({ words, startIndex: globalIndex })
        globalIndex += words.length
    }

    return { paragraphs, totalWords: globalIndex }
}

function ReaderPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { state } = useLocation() as { state: LocationState | null }

    if (!state) {
        navigate('/')
        return null
    }

    const { text, wpm, wordsPerWindow, blurAmount } = state

    const { paragraphs, totalWords } = useRef(buildParagraphs(text.body)).current
    const wordRefs = useRef<(HTMLSpanElement | null)[]>(new Array(totalWords).fill(null))

    const [chunks, setChunks] = useState<Chunk[]>([])
    const [index, setIndex] = useState(0)
    const [done, setDone] = useState(false)

    const currentChunk = chunks[index]
    const progress = chunks.length > 0 ? Math.round((index / chunks.length) * 100) : 0
    const blurStyle = { filter: `blur(${blurAmount}px)` }

    useEffect(() => {
        const spans = wordRefs.current
        const newChunks: Chunk[] = []
        let chunkStart = 0
        let wordsInChunk = 0
        let currentLineTop: number | null = null

        for (let i = 0; i < spans.length; i++) {
            const span = spans[i]
            if (!span) continue
            const top = Math.round(span.getBoundingClientRect().top)

            if (currentLineTop === null) {
                currentLineTop = top
                wordsInChunk = 1
                continue
            }

            const newLine = top !== currentLineTop

            if (newLine || wordsInChunk >= wordsPerWindow) {
                newChunks.push({ globalStart: chunkStart, globalEnd: i - 1 })
                chunkStart = i
                wordsInChunk = 1
                currentLineTop = top
            } else {
                wordsInChunk++
            }
        }

        if (spans.length > 0) {
            newChunks.push({ globalStart: chunkStart, globalEnd: spans.length - 1 })
        }

        setChunks(newChunks)
    }, [])

    useEffect(() => {
        if (!currentChunk) return
        wordRefs.current[currentChunk.globalStart]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, [index, currentChunk])

    useEffect(() => {
        if (done || !currentChunk) return
        const chunkSize = currentChunk.globalEnd - currentChunk.globalStart + 1
        const delay = (chunkSize / wpm) * 60 * 1000

        const timer = setTimeout(() => {
            if (index + 1 >= chunks.length) {
                setDone(true)
            } else {
                setIndex(prev => prev + 1)
            }
        }, delay)

        return () => clearTimeout(timer)
    }, [index, done, currentChunk, chunks.length, wpm])

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col transition-colors duration-300">
            <div className="w-full h-1 bg-[#1a1a2e]/10 dark:bg-white/10 shrink-0">
                <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <button
                onClick={() => navigate('/setup')}
                className="absolute top-5 left-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity z-10"
            >
                ← Back
            </button>

            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity z-10"
            >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            {done ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <p className="text-xl opacity-50">You finished the text.</p>
                    <button
                        onClick={() => navigate('/comprehension', { state: { text } })}
                        className="px-12 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30"
                    >
                        Test Yourself
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-8 py-24 flex justify-center">
                    <div dir={text.dir} className="max-w-2xl w-full text-xl leading-relaxed">
                        {paragraphs.map((para, pIdx) => (
                            <p key={pIdx} className="mb-6">
                                {para.words.map((word, wIdx) => {
                                    const globalIdx = para.startIndex + wIdx
                                    const isActive = currentChunk &&
                                        globalIdx >= currentChunk.globalStart &&
                                        globalIdx <= currentChunk.globalEnd

                                    return (
                                        <span
                                            key={wIdx}
                                            ref={el => { wordRefs.current[globalIdx] = el }}
                                            className={isActive ? 'bg-[#7c3aed]/15 text-[#7c3aed]' : 'opacity-20'}
                                            style={!isActive ? blurStyle : undefined}
                                        >
                                            {word}{' '}
                                        </span>
                                    )
                                })}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReaderPage