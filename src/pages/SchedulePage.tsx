import { useState, useMemo, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import useMainStore from '@/stores/useMainStore'
import { format, isBefore, startOfDay, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Users, Clock, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

const SchedulePage = () => {
  const navigate = useNavigate()

  // Persist state in sessionStorage to avoid losing data on accidental refresh
  const [date, setDate] = useState<Date | undefined>(() => {
    const saved = sessionStorage.getItem('schedule_date')
    return saved ? new Date(saved) : new Date()
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(() => {
    return sessionStorage.getItem('schedule_time_slot') || ''
  })

  const [isBooking, setIsBooking] = useState(false)

  const { currentUser, units, schedules, bookings, bookTraining } = useMainStore()
  const { toast } = useToast()

  useEffect(() => {
    if (date) sessionStorage.setItem('schedule_date', date.toISOString())
    else sessionStorage.removeItem('schedule_date')
  }, [date])

  useEffect(() => {
    if (selectedTimeSlot) sessionStorage.setItem('schedule_time_slot', selectedTimeSlot)
    else sessionStorage.removeItem('schedule_time_slot')
  }, [selectedTimeSlot])

  const today = startOfDay(new Date())

  const selectedUnit = useMemo(() => {
    if (!date) return null
    const dayOfWeek = getDay(date)
    const activeUnits = units.filter((u: any) => u.status === 'active')
    const schedule = schedules.find(
      (s) => s.dayOfWeek === dayOfWeek && activeUnits.some((au) => au.id === s.unitId),
    )
    if (!schedule) return null
    return activeUnits.find((u) => u.id === schedule.unitId) || null
  }, [date, schedules, units])

  const unitTimeSlots = useMemo(() => {
    const hours = (selectedUnit as any)?.available_hours
    if (!hours) return []
    let parsedHours = hours
    if (typeof hours === 'string') {
      try {
        parsedHours = JSON.parse(hours)
      } catch {
        parsedHours = hours.split(',').map((s: string) => s.trim())
      }
    }

    if (Array.isArray(parsedHours)) {
      return parsedHours.map((h) => {
        if (typeof h === 'string') return h
        if (h && typeof h === 'object') {
          if (h.start && h.end) return `${h.start} às ${h.end}`
          if (h.startTime && h.endTime) return `${h.startTime} às ${h.endTime}`
        }
        return JSON.stringify(h)
      })
    }
    return []
  }, [selectedUnit])

  // Set first slot as default when unit/date changes
  useEffect(() => {
    if (
      unitTimeSlots.length > 0 &&
      (!selectedTimeSlot || !unitTimeSlots.includes(selectedTimeSlot))
    ) {
      setSelectedTimeSlot(unitTimeSlots[0])
    }
  }, [unitTimeSlots, selectedTimeSlot])

  const dateStr = date ? format(date, 'yyyy-MM-dd') : ''
  const isPast = date ? isBefore(date, today) : true

  const alreadyBooked = bookings.some(
    (b) => b.date === dateStr && b.studentId === currentUser.id && b.status === 'booked',
  )

  const legacyBookingsCount = bookings.filter(
    (b: any) =>
      b.date === dateStr && b.unitId === selectedUnit?.id && b.status === 'booked' && !b.timeSlot,
  ).length

  const currentSlotBookingsCount = bookings.filter(
    (b: any) =>
      b.date === dateStr &&
      b.unitId === selectedUnit?.id &&
      b.status === 'booked' &&
      b.timeSlot === selectedTimeSlot,
  ).length

  const totalCurrentSlotCount = currentSlotBookingsCount + legacyBookingsCount
  const isFull = selectedUnit ? totalCurrentSlotCount >= selectedUnit.capacity : false

  const handleBook = async () => {
    if (!selectedTimeSlot) {
      toast({
        title: 'Horário não selecionado',
        description: 'Por favor, selecione um horário para agendar.',
        variant: 'destructive',
      })
      return
    }

    if (dateStr && selectedUnit && selectedTimeSlot) {
      setIsBooking(true)
      const res = await bookTraining(dateStr, selectedUnit.id, selectedTimeSlot)

      if (!res?.success) {
        setIsBooking(false)
        return
      }

      sessionStorage.removeItem('schedule_date')
      sessionStorage.removeItem('schedule_time_slot')
      navigate('/meus-treinos')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
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
                  src={
                    selectedUnit.photo || 'https://img.usecurling.com/p/600/300?q=gym%20training'
                  }
                  alt={selectedUnit.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4 opacity-80"
                />
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold uppercase">
                      {selectedUnit.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-md">
                      <MapPin className="w-4 h-4" /> {selectedUnit.address}
                    </CardDescription>
                    {(selectedUnit as any).price != null && (
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <DollarSign className="w-4 h-4" />
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format((selectedUnit as any).price)}{' '}
                        / aula
                      </div>
                    )}
                  </div>
                  {alreadyBooked && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Reservado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Horário do Treino
                  </Label>
                  <RadioGroup
                    value={selectedTimeSlot}
                    onValueChange={setSelectedTimeSlot}
                    className="grid grid-cols-2 gap-4"
                    disabled={alreadyBooked || isPast || isBooking}
                  >
                    {unitTimeSlots.length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-2 p-2 bg-muted/50 rounded-md">
                        Nenhum horário cadastrado para esta unidade.
                      </p>
                    )}
                    {unitTimeSlots.map((slot: string) => {
                      const count =
                        bookings.filter(
                          (b: any) =>
                            b.date === dateStr &&
                            b.unitId === selectedUnit.id &&
                            b.status === 'booked' &&
                            b.timeSlot === slot,
                        ).length + legacyBookingsCount
                      const slotFull = count >= selectedUnit.capacity

                      return (
                        <div
                          key={slot}
                          className={`flex items-center space-x-2 border rounded-md p-3 transition-colors ${selectedTimeSlot === slot ? 'border-primary bg-primary/10' : 'border-border'} ${slotFull && selectedTimeSlot !== slot ? 'opacity-50' : ''}`}
                        >
                          <RadioGroupItem
                            value={slot}
                            id={slot}
                            disabled={slotFull && !alreadyBooked}
                          />
                          <Label
                            htmlFor={slot}
                            className={`flex-1 cursor-pointer ${slotFull && !alreadyBooked ? 'text-muted-foreground' : 'font-medium'}`}
                          >
                            {slot}
                            {slotFull && !alreadyBooked && (
                              <span className="block text-xs text-destructive mt-1">Esgotado</span>
                            )}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Vagas no Horário</span>
                  </div>
                  <span
                    className={`text-2xl font-black ${isFull ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {Math.max(0, selectedUnit.capacity - totalCurrentSlotCount)} /{' '}
                    {selectedUnit.capacity}
                  </span>
                </div>

                <Button
                  className={`w-full font-bold text-lg h-14 ${alreadyBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isPast || isFull || alreadyBooked || isBooking || !selectedTimeSlot}
                  onClick={handleBook}
                  variant={isFull && !alreadyBooked ? 'destructive' : 'default'}
                >
                  {isBooking
                    ? 'Agendando...'
                    : isPast
                      ? 'Data Indisponível'
                      : alreadyBooked
                        ? 'Treino Reservado'
                        : isFull
                          ? 'Horário Lotado'
                          : !selectedTimeSlot
                            ? 'Selecione um Horário'
                            : 'Confirmar Reserva'}
                </Button>
              </CardContent>
            </Card>
          ) : date ? (
            <Card className="border-border bg-card border-dashed flex items-center justify-center h-full min-h-[300px]">
              <CardContent className="text-center text-muted-foreground">
                Não há treinos ativos programados para este dia da semana.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SchedulePage
