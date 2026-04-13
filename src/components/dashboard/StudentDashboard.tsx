import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, MapPin, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import useMainStore from '@/stores/useMainStore'
import { format, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export function StudentDashboard() {
  const { currentUser, bookings, units } = useMainStore()
  const today = startOfDay(new Date())

  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.studentId === currentUser.id && b.status === 'booked' && isAfter(new Date(b.date), today),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const nextBooking = upcomingBookings[0]
  const nextUnit = nextBooking ? units.find((u) => u.id === nextBooking.unitId) : null

  const myBookings = bookings.filter((b) => b.studentId === currentUser.id && b.status === 'booked')
  const presentCount = myBookings.filter((b) => b.attendance === 'present').length
  const absentCount = myBookings.filter((b) => b.attendance === 'absent').length
  const pendingCount = myBookings.filter((b) => b.attendance === 'pending').length

  const chartData = [
    { name: 'Presente', value: presentCount, fill: 'hsl(var(--success))' },
    { name: 'Falta', value: absentCount, fill: 'hsl(var(--destructive))' },
    { name: 'Pendente', value: pendingCount, fill: 'hsl(var(--muted))' },
  ]

  const chartConfig = {
    presente: { label: 'Presente', color: 'hsl(var(--success))' },
    falta: { label: 'Falta', color: 'hsl(var(--destructive))' },
    pendente: { label: 'Pendente', color: 'hsl(var(--muted))' },
  }

  const favUnit = units.find((u) => u.id === currentUser.favoriteUnitId)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-card to-zinc-900 border-border shadow-glow-white">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" /> Próximo Treino
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextBooking && nextUnit ? (
            <div className="space-y-4">
              <div className="text-4xl font-black text-foreground uppercase tracking-tight">
                {format(new Date(nextBooking.date), "dd 'de' MMMM", { locale: ptBR })}
              </div>
              <div className="flex items-center text-muted-foreground gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                {nextUnit.name}
                {nextBooking.timeSlot && ` • ${nextBooking.timeSlot}`}
              </div>
              <Button asChild size="lg" className="w-full sm:w-auto mt-4 font-bold text-md">
                <Link to="/meus-treinos">Ver Detalhes</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4 text-lg">Nenhum treino agendado.</p>
              <Button asChild size="lg" className="font-bold">
                <Link to="/agendar">Agendar Agora</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <TrendingUp className="w-5 h-5" /> Meu Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px]">
          {myBookings.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center">Sem dados suficientes.</p>
          )}
        </CardContent>
      </Card>

      {favUnit && (
        <Card className="col-span-full border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Star className="w-5 h-5 text-yellow-500" /> Unidade Favorita
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={favUnit.photo}
                alt={favUnit.name}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
              <div>
                <h3 className="font-bold text-lg">{favUnit.name}</h3>
                <p className="text-muted-foreground text-sm">{favUnit.address}</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/agendar">Agendar Aqui</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
