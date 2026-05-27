import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { RegisteredRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import ReaderPage from './pages/ReaderPage'
import ComprehensionPage from './pages/ComprehensionPage'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

                        <Route path="/"              element={<HomePage />} />
                        <Route path="/setup"         element={<SetupPage />} />
                        <Route path="/read"          element={<ReaderPage />} />
                        <Route path="/comprehension" element={<ComprehensionPage />} />
                        <Route path="/result"        element={<ResultPage />} />

                        <Route path="/upload" element={<RegisteredRoute><UploadPage /></RegisteredRoute>} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
