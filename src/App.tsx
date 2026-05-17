import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import SchedulePage from './pages/SchedulePage'
import MyTrainingsPage from './pages/MyTrainingsPage'
import AttendancePage from './pages/AttendancePage'
import UnitsPage from './pages/UnitsPage'
import StudentsPage from './pages/StudentsPage'
import FinancePage from './pages/FinancePage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import useMainStore, { StoreProvider } from './stores/useMainStore'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { ThemeProvider } from './components/ThemeProvider'

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) => {
  const { currentUser, loading } = useMainStore()
  const { user, loading: authLoading } = useAuth()

  if (authLoading || loading) return null

  if (!user) return <>{children}</>

  if (allowedRoles && currentUser?.role && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
          <TooltipProvider>
            <Toaster />
            <Sonner theme="dark" position="top-right" />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/cadastro" element={<div />} />
                <Route path="/agendar" element={<SchedulePage />} />
                <Route path="/meus-treinos" element={<MyTrainingsPage />} />
                <Route
                  path="/presenca"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <AttendancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/unidades"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UnitsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alunos"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <StudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/financeiro" element={<FinancePage />} />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
