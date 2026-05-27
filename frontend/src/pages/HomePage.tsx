import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

function HomePage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { user, logout } = useAuth()

    return (
        <div className="min-h-screen bg-[#f5f4f0] dark:bg-[#0f0f18] flex flex-col items-center justify-center relative transition-colors duration-300">
            <div className="absolute top-5 right-5 flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 text-[#1a1a2e] dark:text-[#e8e8f0] hover:opacity-70 transition-opacity"
                >
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                {user && !user.isAnonymous ? (
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 text-[#1a1a2e] dark:text-[#e8e8f0] hover:opacity-70 transition-opacity"
                    >
                        Sign out
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="px-4 py-2 rounded-full text-sm font-medium border border-[#1a1a2e]/20 dark:border-white/10 text-[#1a1a2e] dark:text-[#e8e8f0] hover:opacity-70 transition-opacity"
                    >
                        Sign in
                    </Link>
                )}
            </div>

            <div className="flex flex-col items-center gap-6">
                {user && !user.isAnonymous && user.name && (
                    <p className="text-sm opacity-50 uppercase tracking-widest text-[#1a1a2e] dark:text-[#e8e8f0]">
                        Welcome back, {user.name}
                    </p>
                )}
                <h1 className="text-5xl md:text-9xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">
                    VeloxLearn
                </h1>
                <p className="text-lg tracking-widest text-[#1a1a2e]/50 dark:text-[#e8e8f0]/50 uppercase">
                    Read faster. Think deeper.
                </p>
                <button
                    onClick={() => navigate('/setup')}
                    className="mt-6 px-12 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-[#7c3aed]/30"
                >
                    Start
                </button>
            </div>
        </div>
    )
}

export default HomePage
