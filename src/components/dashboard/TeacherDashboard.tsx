import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import useMainStore from '@/stores/useMainStore'
import { format } from 'date-fns'

export function TeacherDashboard() {
  const { bookings, units, users } = useMainStore()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const todaysBookings = bookings.filter((b) => b.date === todayStr && b.status === 'booked')

  // Group by unit
  const unitsToday = Array.from(new Set(todaysBookings.map((b) => b.unitId)))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Resumo de Hoje</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {unitsToday.length > 0 ? (
          unitsToday.map((unitId) => {
            const unit = units.find((u) => u.id === unitId)
            const studentsCount = todaysBookings.filter((b) => b.unitId === unitId).length

            return (
              <Card
                key={unitId}
                className="border-border bg-card hover:border-primary/50 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold uppercase">{unit?.name}</CardTitle>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-foreground mb-4">
                    {studentsCount}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      alunos agendados
                    </span>
                  </div>
                  <Button asChild className="w-full font-bold">
                    <Link to={`/presenca?date=${todayStr}&unit=${unitId}`}>
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Fazer Chamada
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="col-span-full border-dashed border-border bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground font-medium">
                Nenhum treino agendado para hoje.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
