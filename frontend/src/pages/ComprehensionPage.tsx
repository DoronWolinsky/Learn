import {useEffect, useRef, useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

interface AnswerData {
    text: string
    correct: boolean
}

interface QuestionData {
    question: string
    answers: AnswerData[]
}

interface TextData {
    id: string
    title: string
    questions: QuestionData[]
    dir: 'ltr' | 'rtl'
}

interface LocationState {
    text: TextData
}

function buildData(text: TextData): QuestionData[] {
    return [...text.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(q => ({ ...q, answers: [...q.answers].sort(() => Math.random() - 0.5) }))
}

function ComprehensionPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { state } = useLocation() as { state: LocationState | null }

    if (!state) {
        navigate('/')
        return null
    }

    const { text } = state
    const questions = useRef(buildData(text)).current
    const [questionIndex, setQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [score, setScore] = useState(0)

    function handleSelect(index: number) {
        if (selectedAnswer !== null) return
        setSelectedAnswer(index)
        if (questions[questionIndex].answers[index].correct) {
            setScore(prev => prev + 1)
        }
    }

    function handleNext() {
        setQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
    }

    function getAnswerStyle(index: number): string {
        if (selectedAnswer === null) return 'border-[#1a1a2e]/10 dark:border-white/10 hover:border-[#7c3aed]/40'
        if (questions[questionIndex].answers[index].correct) return 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
        if (index === selectedAnswer) return 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
        return 'border-[#1a1a2e]/10 dark:border-white/10 opacity-30'
    }

    useEffect(() => {
        if (selectedAnswer === null) return
        const delay = 900
        const timer = setTimeout(() => {
            if (questionIndex + 1 >= questions.length) {
                navigate('/result', {state: {score, total: questions.length, textId: text.id, textTitle: text.title}})
            }
        }, delay)
        return () => clearTimeout(timer)
    }, [selectedAnswer])

    const currentQuestion = questions[questionIndex]

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center justify-center px-6 py-12 relative transition-colors duration-300">
            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="w-full max-w-xl flex flex-col gap-8">
                <p className="text-sm uppercase tracking-widest opacity-50 text-center">
                    Question {questionIndex + 1} of {questions.length}
                </p>

                <h2 dir={text.dir} className="text-2xl font-bold text-center leading-snug">
                    {currentQuestion.question}
                </h2>

                <div className="flex flex-col gap-3">
                    {currentQuestion.answers.map((answer, index) => (
                        <button
                            key={index}
                            dir={text.dir}
                            onClick={() => handleSelect(index)}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-150 ${getAnswerStyle(index)}`}
                        >
                            {answer.text}
                        </button>
                    ))}
                </div>

                {selectedAnswer !== null && questionIndex + 1 < questions.length && (
                    <button
                        onClick={handleNext}
                        className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    )
}

export default ComprehensionPage