import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import useMainStore from '@/stores/useMainStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, X, Search } from 'lucide-react'

const AttendancePage = () => {
  const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [search, setSearch] = useState('')
  const { bookings, users, markAttendance } = useMainStore()

  const todaysBookings = bookings.filter((b) => b.date === dateStr && b.status === 'booked')

  const studentsList = todaysBookings
    .map((b) => {
      const student = users.find((u) => u.id === b.studentId)
      return { ...b, student }
    })
    .filter((b) => b.student?.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Lista de Presença</h1>
          <p className="text-muted-foreground">Gerencie a frequência dos alunos.</p>
        </div>
        <Input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="w-full sm:w-auto bg-card border-border text-foreground"
        />
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="bg-muted/20 border-b border-border">
          <div className="flex items-center relative">
            <Search className="w-5 h-5 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {studentsList.length > 0 ? (
            <div className="divide-y divide-border">
              {studentsList.map(({ id, student, attendance }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={student?.avatar} />
                      <AvatarFallback>{student?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg">{student?.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {attendance === 'pending'
                          ? 'Aguardando'
                          : attendance === 'present'
                            ? 'Presente'
                            : 'Faltou'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant={attendance === 'present' ? 'default' : 'outline'}
                      className={`h-12 w-12 rounded-full ${attendance === 'present' ? 'bg-success hover:bg-success/90 text-white glow-green' : 'hover:bg-success/20 hover:text-success border-border'}`}
                      onClick={() => markAttendance(id, 'present')}
                    >
                      <Check className="h-6 w-6" />
                    </Button>
                    <Button
                      size="icon"
                      variant={attendance === 'absent' ? 'destructive' : 'outline'}
                      className={`h-12 w-12 rounded-full ${attendance === 'absent' ? 'glow-red' : 'hover:bg-destructive/20 hover:text-destructive border-border'}`}
                      onClick={() => markAttendance(id, 'absent')}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Nenhum aluno agendado para esta data ou filtro.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendancePage
