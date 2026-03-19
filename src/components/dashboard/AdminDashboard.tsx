import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Activity } from 'lucide-react'
import useMainStore from '@/stores/useMainStore'

export function AdminDashboard() {
  const { users, bookings, units } = useMainStore()

  const activeStudents = users.filter((u) => u.role === 'student' && u.status === 'active').length
  const totalRevenue = bookings
    .filter((b) => b.status === 'booked')
    .reduce((acc, b) => {
      const unit = units.find((u) => u.id === b.unitId)
      return acc + (unit?.price || 0)
    }, 0)

  const totalBookings = bookings.filter((b) => b.status === 'booked').length

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
            Alunos Ativos
          </CardTitle>
          <Users className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-foreground">{activeStudents}</div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
            Receita Prevista (Mês)
          </CardTitle>
          <DollarSign className="w-4 h-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-success">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalRevenue,
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
            Aulas Agendadas
          </CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-foreground">{totalBookings}</div>
        </CardContent>
      </Card>
    </div>
  )
}
