import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useMainStore from '@/stores/useMainStore'
import { format, isBefore, startOfDay, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Users } from 'lucide-react'

const SchedulePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { currentUser, units, schedules, bookings, bookTraining } = useMainStore()

  const today = startOfDay(new Date())

  const selectedUnit = useMemo(() => {
    if (!date) return null
    const dayOfWeek = getDay(date)
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek)
    if (!schedule) return null
    return units.find((u) => u.id === schedule.unitId) || null
  }, [date, schedules, units])

  const dateStr = date ? format(date, 'yyyy-MM-dd') : ''
  const isPast = date ? isBefore(date, today) : true

  const currentBookingsCount = bookings.filter(
    (b) => b.date === dateStr && b.unitId === selectedUnit?.id && b.status === 'booked',
  ).length
  const isFull = selectedUnit ? currentBookingsCount >= selectedUnit.capacity : false
  const alreadyBooked = bookings.some(
    (b) => b.date === dateStr && b.studentId === currentUser.id && b.status === 'booked',
  )

  const handleBook = () => {
    if (dateStr && selectedUnit) {
      bookTraining(dateStr, selectedUnit.id)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tight">Agendar Treino</h1>
        <p className="text-muted-foreground">
          Selecione uma data para visualizar a unidade e reservar sua vaga.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border bg-card flex flex-col items-center p-6 shadow-none">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            disabled={(d) => isBefore(d, today)}
            className="rounded-md border border-border shadow-sm p-4 bg-background w-full flex justify-center"
            classNames={{
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
            }}
          />
        </Card>

        <div className="space-y-6">
          {selectedUnit ? (
            <Card
              className={`border-border transition-all duration-300 ${alreadyBooked ? 'bg-primary/5 border-primary' : 'bg-card'}`}
            >
              <CardHeader>
                <img
                  src={selectedUnit.photo}
                  alt={selectedUnit.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4 opacity-80"
                />
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold uppercase">
                      {selectedUnit.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2 text-md">
                      <MapPin className="w-4 h-4" /> {selectedUnit.address}
                    </CardDescription>
                  </div>
                  {alreadyBooked && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Reservado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Vagas Restantes</span>
                  </div>
                  <span
                    className={`text-2xl font-black ${isFull ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {Math.max(0, selectedUnit.capacity - currentBookingsCount)} /{' '}
                    {selectedUnit.capacity}
                  </span>
                </div>

                <Button
                  className={`w-full font-bold text-lg h-14 ${alreadyBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isPast || isFull || alreadyBooked}
                  onClick={handleBook}
                  variant={isFull && !alreadyBooked ? 'destructive' : 'default'}
                >
                  {isPast
                    ? 'Data Indisponível'
                    : alreadyBooked
                      ? 'Treino Reservado'
                      : isFull
                        ? 'Turma Lotada'
                        : 'Confirmar Reserva'}
                </Button>
              </CardContent>
            </Card>
          ) : date ? (
            <Card className="border-border bg-card border-dashed flex items-center justify-center h-full min-h-[300px]">
              <CardContent className="text-center text-muted-foreground">
                Não há treinos programados para este dia da semana.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SchedulePage
