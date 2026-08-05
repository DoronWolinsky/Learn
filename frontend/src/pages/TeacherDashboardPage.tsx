import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { connectionsApi } from '../api/connections'
import type { Connection } from '../api/connections'

function TeacherDashboardPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()

    const [students, setStudents] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        loadStudents(user.uid)
    }, [user])

    function loadStudents(teacherId: string) {
        setLoading(true)
        connectionsApi.listForTeacher(teacherId)
            .then(setStudents)
            .catch(() => setError('Could not load your students. Please try again.'))
            .finally(() => setLoading(false))
    }

    async function handleAddStudent() {
        if (!user || !email.trim()) return
        setAdding(true)
        setError(null)
        try {
            await connectionsApi.createByEmail(user.uid, email.trim())
            setEmail('')
            loadStudents(user.uid)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not add that student.')
        } finally {
            setAdding(false)
        }
    }

    const inputClass = 'w-full px-4 py-3 rounded-2xl border border-[#1a1a2e]/20 dark:border-white/10 bg-transparent focus:outline-none focus:border-[#7c3aed] transition-colors'

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center px-6 py-20 relative transition-colors duration-300">
            <button
                onClick={() => navigate('/')}
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

            <div className="w-full max-w-2xl flex flex-col gap-10">
                <h1 className="text-3xl font-bold text-center">Teacher dashboard</h1>

                <div className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-widest opacity-50">Add a student</p>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="student@example.com"
                            className={inputClass}
                        />
                        <button
                            onClick={handleAddStudent}
                            disabled={adding || !email.trim()}
                            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-widest opacity-50">My students</p>

                    {loading && <p className="text-center opacity-40 text-sm">Loading students...</p>}
                    {!loading && students.length === 0 && (
                        <p className="text-center opacity-40 text-sm">No students yet. Add one by email above.</p>
                    )}

                    <div className="flex flex-col gap-3">
                        {students.map(student => (
                            <div
                                key={student.studentId}
                                className="p-4 rounded-2xl border border-[#1a1a2e]/10 dark:border-white/10 flex flex-col gap-1"
                            >
                                <span className="font-semibold text-sm">{student.studentName ?? student.studentEmail}</span>
                                <span className="text-xs opacity-50">{student.studentEmail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherDashboardPage
