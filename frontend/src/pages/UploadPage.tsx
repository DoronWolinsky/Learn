import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { textsApi } from '../api/texts'
import type { UploadPayload } from '../api/texts'
import { usersApi } from '../api/users'
import type { Difficulty, Visibility } from '../types'

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

interface AnswerDraft {
    body: string
}

interface QuestionDraft {
    body: string
    answers: [AnswerDraft, AnswerDraft, AnswerDraft, AnswerDraft]
    correctIndex: number
}

function emptyQuestion(): QuestionDraft {
    return {
        body: '',
        answers: [{ body: '' }, { body: '' }, { body: '' }, { body: '' }],
        correctIndex: 0,
    }
}

function UploadPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
    const [visibility, setVisibility] = useState<Visibility>('public')
    const [sharedEmails, setSharedEmails] = useState('')
    const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    function updateQuestionBody(qi: number, value: string) {
        setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, body: value } : q))
    }

    function updateAnswerBody(qi: number, ai: number, value: string) {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qi) return q
            const answers = q.answers.map((a, j) => j === ai ? { body: value } : a) as QuestionDraft['answers']
            return { ...q, answers }
        }))
    }

    function setCorrect(qi: number, ai: number) {
        setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, correctIndex: ai } : q))
    }

    function addQuestion() {
        setQuestions(prev => [...prev, emptyQuestion()])
    }

    function removeQuestion(qi: number) {
        setQuestions(prev => prev.filter((_, i) => i !== qi))
    }

    async function handleSubmit() {
        setError(null)
        setSuccess(false)

        if (!user) return
        if (!title.trim()) { setError('Title is required.'); return }
        if (!body.trim()) { setError('Text body is required.'); return }
        if (questions.length === 0) { setError('Add at least one question.'); return }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            if (!q.body.trim()) { setError(`Question ${i + 1} is missing its text.`); return }
            for (let j = 0; j < q.answers.length; j++) {
                if (!q.answers[j].body.trim()) { setError(`Question ${i + 1}, answer ${j + 1} is empty.`); return }
            }
        }

        setLoading(true)

        let sharedWith: string[] = []
        if (visibility === 'shared') {
            const emails = sharedEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean)
            if (emails.length === 0) { setError('Add at least one email to share with.'); setLoading(false); return }
            const lookups = await Promise.all(emails.map(email => usersApi.lookupByEmail(email)))
            const unresolved = emails.filter((_, i) => !lookups[i])
            if (unresolved.length > 0) {
                setError(`No account found for: ${unresolved.join(', ')}`)
                setLoading(false)
                return
            }
            sharedWith = lookups.map(entry => entry!.uid)
        }

        const payload: UploadPayload = {
            title: title.trim(),
            body: body.trim(),
            direction,
            ownerId: user.uid,
            difficulty,
            visibility,
            sharedWith,
            questions: questions.map(q => ({
                body: q.body.trim(),
                answers: q.answers.map((a, i) => ({
                    body: a.body.trim(),
                    isCorrect: i === q.correctIndex,
                })),
            })),
        }

        try {
            await textsApi.upload(payload)
            setSuccess(true)
            setTitle('')
            setBody('')
            setSharedEmails('')
            setQuestions([emptyQuestion()])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full px-4 py-3 rounded-2xl border border-[#1a1a2e]/20 dark:border-white/10 bg-transparent focus:outline-none focus:border-[#7c3aed] transition-colors'

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center px-6 py-20 relative transition-colors duration-300">
            <button
                onClick={() => navigate('/setup')}
                className="absolute top-5 left-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                ← Back
            </button>

            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="w-full max-w-2xl flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-center">Upload a text</h1>

                <div className="flex flex-col gap-2">
                    <label className="text-sm uppercase tracking-widest opacity-50">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Text title"
                        className={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-sm uppercase tracking-widest opacity-50">Direction</label>
                    <div className="flex gap-6">
                        {(['ltr', 'rtl'] as const).map(dir => (
                            <label key={dir} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="direction"
                                    value={dir}
                                    checked={direction === dir}
                                    onChange={() => setDirection(dir)}
                                    className="accent-[#7c3aed]"
                                />
                                <span className="uppercase text-sm font-medium">{dir}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-sm uppercase tracking-widest opacity-50">Difficulty</label>
                    <div className="flex gap-6">
                        {DIFFICULTIES.map(level => (
                            <label key={level} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value={level}
                                    checked={difficulty === level}
                                    onChange={() => setDifficulty(level)}
                                    className="accent-[#7c3aed]"
                                />
                                <span className="capitalize text-sm font-medium">{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-sm uppercase tracking-widest opacity-50">Visibility</label>
                    <div className="flex gap-6">
                        {(['public', 'private', 'shared'] as const).map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value={v}
                                    checked={visibility === v}
                                    onChange={() => setVisibility(v)}
                                    className="accent-[#7c3aed]"
                                />
                                <span className="capitalize text-sm font-medium">{v}</span>
                            </label>
                        ))}
                    </div>
                    {visibility === 'shared' && (
                        <textarea
                            value={sharedEmails}
                            onChange={e => setSharedEmails(e.target.value)}
                            rows={3}
                            placeholder="Emails to share with, separated by commas or new lines"
                            className={`${inputClass} resize-y`}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm uppercase tracking-widest opacity-50">Text body</label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        dir={direction}
                        rows={10}
                        placeholder="Paste the full text here..."
                        className={`${inputClass} resize-y`}
                    />
                </div>

                <div className="flex flex-col gap-6">
                    <p className="text-sm uppercase tracking-widest opacity-50">Questions</p>

                    {questions.map((q, qi) => (
                        <div key={qi} className="flex flex-col gap-4 p-5 rounded-2xl border border-[#1a1a2e]/10 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold opacity-60">Question {qi + 1}</span>
                                {questions.length > 1 && (
                                    <button
                                        onClick={() => removeQuestion(qi)}
                                        className="text-xs opacity-40 hover:opacity-70 hover:text-red-500 transition-all"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                value={q.body}
                                onChange={e => updateQuestionBody(qi, e.target.value)}
                                dir={direction}
                                placeholder="Question"
                                className={inputClass}
                            />

                            <div className="flex flex-col gap-2">
                                {q.answers.map((a, ai) => (
                                    <div key={ai} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`correct-${qi}`}
                                            checked={q.correctIndex === ai}
                                            onChange={() => setCorrect(qi, ai)}
                                            className="accent-[#7c3aed] shrink-0"
                                        />
                                        <input
                                            type="text"
                                            value={a.body}
                                            onChange={e => updateAnswerBody(qi, ai, e.target.value)}
                                            dir={direction}
                                            placeholder={`Answer ${ai + 1}${q.correctIndex === ai ? ' (correct)' : ''}`}
                                            className={inputClass}
                                        />
                                    </div>
                                ))}
                                <p className="text-xs opacity-30 pl-7">Select the radio button next to the correct answer</p>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addQuestion}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-[#1a1a2e]/20 dark:border-white/10 text-sm opacity-50 hover:opacity-80 hover:border-[#7c3aed]/40 transition-all"
                    >
                        + Add question
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center">Text uploaded successfully!</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? 'Uploading...' : 'Upload text'}
                </button>
            </div>
        </div>
    )
}

export default UploadPage
