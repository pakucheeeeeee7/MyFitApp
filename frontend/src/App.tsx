import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Profile from './pages/Profile'
import { Toaster } from 'sonner'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  // 認証チェック中はローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* 未認証時はログインページのみアクセス可能 */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          /* 認証済み時は全てのページにアクセス可能 */
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
      <Toaster />
    </>
  )
}

export default App