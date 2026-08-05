import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { RegisteredRoute, PublicOnlyRoute, OnboardingGate, TeacherRoute } from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import ReaderPage from './pages/ReaderPage'
import ComprehensionPage from './pages/ComprehensionPage'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <OnboardingGate>
                        <Routes>
                            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                            <Route path="/onboarding" element={<OnboardingPage />} />

                            <Route path="/"              element={<HomePage />} />
                            <Route path="/setup"         element={<SetupPage />} />
                            <Route path="/read"          element={<ReaderPage />} />
                            <Route path="/comprehension" element={<ComprehensionPage />} />
                            <Route path="/result"        element={<ResultPage />} />

                            <Route path="/upload" element={<RegisteredRoute><UploadPage /></RegisteredRoute>} />
                            <Route path="/teacher" element={<TeacherRoute><TeacherDashboardPage /></TeacherRoute>} />
                        </Routes>
                    </OnboardingGate>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
