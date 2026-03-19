import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import { StoreProvider } from './stores/useMainStore'

const App = () => (
  <StoreProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/agendar" element={<SchedulePage />} />
            <Route path="/meus-treinos" element={<MyTrainingsPage />} />
            <Route path="/presenca" element={<AttendancePage />} />
            <Route path="/unidades" element={<UnitsPage />} />
            <Route path="/alunos" element={<StudentsPage />} />
            <Route path="/financeiro" element={<FinancePage />} />
            <Route
              path="/configuracoes"
              element={<div className="p-8 text-center text-muted-foreground">Em construção</div>}
            />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </StoreProvider>
)

export default App
