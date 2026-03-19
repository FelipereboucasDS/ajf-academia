import useMainStore from '@/stores/useMainStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Calendar, XCircle, CheckCircle } from 'lucide-react'

const MyTrainingsPage = () => {
  const { currentUser, bookings, units, cancelBooking } = useMainStore()
  const today = startOfDay(new Date())

  const myBookings = bookings
    .filter((b) => b.studentId === currentUser.id && b.status === 'booked')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const upcoming = myBookings.filter((b) => !isBefore(new Date(b.date), today))
  const past = myBookings.filter((b) => isBefore(new Date(b.date), today))

  const TrainingCard = ({ booking, isPast }: { booking: any; isPast: boolean }) => {
    const unit = units.find((u) => u.id === booking.unitId)
    if (!unit) return null

    return (
      <Card
        className={`border-border bg-card overflow-hidden ${!isPast ? 'hover:border-primary/50 transition-colors' : 'opacity-70'}`}
      >
        <CardContent className="p-0 sm:flex items-stretch">
          <div className="w-full sm:w-32 bg-accent p-4 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r border-border">
            <span className="text-sm font-bold text-muted-foreground uppercase">
              {format(new Date(booking.date), 'MMM', { locale: ptBR })}
            </span>
            <span className="text-4xl font-black text-foreground">
              {format(new Date(booking.date), 'dd')}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(booking.date), 'EEEE', { locale: ptBR }).split('-')[0]}
            </span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{unit.name}</h3>
                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {unit.address}
                </p>
              </div>
              {isPast && (
                <Badge
                  variant={
                    booking.attendance === 'present'
                      ? 'default'
                      : booking.attendance === 'absent'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className={
                    booking.attendance === 'present' ? 'bg-success hover:bg-success/80' : ''
                  }
                >
                  {booking.attendance === 'present'
                    ? 'Presente'
                    : booking.attendance === 'absent'
                      ? 'Falta'
                      : 'Pendente'}
                </Badge>
              )}
            </div>
            {!isPast && (
              <div className="flex justify-end mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                  onClick={() => cancelBooking(booking.id)}
                >
                  Cancelar Reserva
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Meus Treinos</h1>
        <p className="text-muted-foreground">
          Gerencie seus agendamentos e histórico de participação.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-primary">
          <Calendar className="w-5 h-5" /> Próximos Treinos
        </h2>
        {upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((b) => (
              <TrainingCard key={b.id} booking={b} isPast={false} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground p-8 text-center border border-dashed border-border rounded-lg bg-card/50">
            Você não tem treinos agendados.
          </p>
        )}
      </div>

      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="w-5 h-5" /> Histórico
        </h2>
        {past.length > 0 ? (
          <div className="grid gap-4">
            {past.map((b) => (
              <TrainingCard key={b.id} booking={b} isPast={true} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum histórico encontrado.</p>
        )}
      </div>
    </div>
  )
}

export default MyTrainingsPage
