import useMainStore from '@/stores/useMainStore'
import { StudentDashboard } from '@/components/dashboard/StudentDashboard'
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'

const Index = () => {
  const { currentUser } = useMainStore()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
          Olá, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground text-lg">Bem-vindo à AJF Academia de Goleiros.</p>
      </div>

      {currentUser.role === 'student' && <StudentDashboard />}
      {currentUser.role === 'teacher' && <TeacherDashboard />}
      {currentUser.role === 'admin' && <AdminDashboard />}
    </div>
  )
}

export default Index
