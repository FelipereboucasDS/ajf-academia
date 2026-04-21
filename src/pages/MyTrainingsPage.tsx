import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import useMainStore from '@/stores/useMainStore'
import { useSettings } from '@/hooks/use-settings'
import { format, differenceInCalendarDays, parseISO, startOfDay, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, MapPin, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function MyTrainingsPage() {
  const { bookings, units, currentUser, fetchBookings } = useMainStore()
  const { settings } = useSettings()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    if (fetchBookings) fetchBookings()
  }, [fetchBookings])

  const myBookings = bookings
    .filter((b: any) => b.studentId === currentUser.id)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleCancelClick = (booking: any) => {
    if (!settings) return
    const bookingDate = parseISO(booking.date)
    const today = new Date()
    const isTomorrow = differenceInCalendarDays(bookingDate, today) === 1

    let isPastCutoff = false
    if (isTomorrow) {
      const now = new Date()
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes()
      const [cutoffHour, cutoffMinute] = settings.booking_cutoff_time.split(':').map(Number)
      const cutoffTotalMinutes = cutoffHour * 60 + cutoffMinute
      if (currentTotalMinutes >= cutoffTotalMinutes) {
        isPastCutoff = true
      }
    }

    if (isPastCutoff || differenceInCalendarDays(bookingDate, today) <= 0) {
      setErrorModalOpen(true)
    } else {
      setSelectedBooking(booking)
      setCancelModalOpen(true)
    }
  }

  const confirmCancel = async () => {
    if (!selectedBooking) return
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', selectedBooking.id)
    if (!error) {
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tight">Meus Treinos</h1>
        <p className="text-muted-foreground">Acompanhe seu histórico e próximos agendamentos.</p>
      </div>

      <div className="grid gap-4">
        {myBookings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card shadow-sm">
            Nenhum treino agendado.
          </div>
        )}
        {myBookings.map((booking: any) => {
          const unit = units.find((u: any) => u.id === booking.unitId)
          const dateObj = parseISO(booking.date)
          const todayStart = startOfDay(new Date())
          const isPast = isBefore(dateObj, todayStart)

          return (
            <Card key={booking.id} className="overflow-hidden border-border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 bg-accent/50 flex sm:flex-col items-center justify-center p-4 gap-2 border-r border-border">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="text-sm uppercase font-bold text-muted-foreground">
                      {format(dateObj, 'MMM', { locale: ptBR })}
                    </div>
                    <div className="text-2xl font-black">{format(dateObj, 'dd')}</div>
                  </div>
                </div>
                <CardContent className="flex-1 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl uppercase">
                      {unit?.name || 'Unidade não encontrada'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {booking.timeSlot || 'Horário indefinido'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {unit?.address}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <Badge
                      variant={
                        booking.status === 'cancelled'
                          ? 'destructive'
                          : isPast
                            ? 'secondary'
                            : 'default'
                      }
                      className="uppercase w-full sm:w-auto justify-center"
                    >
                      {booking.status === 'cancelled'
                        ? 'Cancelado'
                        : isPast
                          ? 'Concluído'
                          : 'Agendado'}
                    </Badge>
                    {booking.status === 'booked' && !isPast && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleCancelClick(booking)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aviso</DialogTitle>
            <DialogDescription className="text-base text-foreground mt-2">
              Infelizmente não é possível realizar o cancelamento por conta do horário, qualquer
              dúvida entre em contato com alguém da nossa equipe!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorModalOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>Tem certeza que deseja cancelar este treino?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
