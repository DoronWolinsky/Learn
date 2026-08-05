import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/users'
import type { UserRole } from '../types'

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
    { value: 'individual', label: 'Individual', description: 'Read texts and track your own progress.' },
    { value: 'teacher', label: 'Teacher', description: 'Manage students and assign texts to them.' },
    { value: 'student', label: 'Student', description: 'Get texts assigned to you by a teacher.' },
]

function OnboardingPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()
    const [selected, setSelected] = useState<UserRole[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function toggleRole(role: UserRole) {
        setSelected(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
    }

    async function handleSubmit() {
        if (!user || selected.length === 0) return
        setSubmitting(true)
        setError(null)
        try {
            await usersApi.completeOnboarding(user.uid, { name: user.name, email: user.email ?? '', roles: selected })
            navigate('/')
        } catch {
            setError('Could not save your selection. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] text-[#1a1a2e] dark:text-[#e8e8f0] flex flex-col items-center justify-center px-6 py-12 relative transition-colors duration-300">
            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 hover:opacity-70 transition-opacity"
            >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="w-full max-w-xl flex flex-col gap-8">
                <div className="text-center flex flex-col gap-2">
                    <h2 className="text-3xl font-bold">Welcome to VeloxLearn</h2>
                    <p className="opacity-60">Choose how you'll use VeloxLearn — you can pick more than one.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {ROLE_OPTIONS.map(option => {
                        const isSelected = selected.includes(option.value)
                        return (
                            <button
                                key={option.value}
                                onClick={() => toggleRole(option.value)}
                                className={`p-5 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all duration-150 ${
                                    isSelected ? 'border-[#7c3aed] shadow-lg shadow-[#7c3aed]/20' : 'border-[#1a1a2e]/10 dark:border-white/10 hover:border-[#7c3aed]/40'
                                }`}
                            >
                                <span className="font-semibold">{option.label}</span>
                                <span className="text-sm opacity-60">{option.description}</span>
                            </button>
                        )
                    })}
                </div>

                {error && <p className="text-center text-red-500 text-sm">{error}</p>}

                <button
                    disabled={selected.length === 0 || submitting}
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}

export default OnboardingPage
