import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import LoginPage    from './pages/LoginPage'
import OnboardPage  from './pages/OnboardPage'
import AppShell     from './pages/AppShell'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-grape-50">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">🍇</div>
          <div className="spinner" />
          <p className="font-display text-grape-600 text-lg">GrapeGuard</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={!user ? <LoginPage />   : <Navigate to="/" />} />
        <Route path="/onboard"  element={!user ? <OnboardPage /> : <Navigate to="/" />} />
        <Route path="/*"        element={ user ? <AppShell />    : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

