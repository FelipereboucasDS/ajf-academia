import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Edit, Plus, Clock, CalendarDays } from 'lucide-react'
import { getUnitsWithSchedules } from '@/services/units'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnitDialog } from '@/components/UnitDialog'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

const DAYS_MAP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [isAdmin, setIsAdmin] = useState(false)
  const [dialogState, setDialogState] = useState<{ open: boolean; unit: any | null }>({
    open: false,
    unit: null,
  })
  const { user } = useAuth()

  const load = async () => {
    const { data } = await getUnitsWithSchedules()
    if (data) setUnits(data)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setIsAdmin(data?.role === 'admin')
        })
    }
  }, [user])

  const filtered = units.filter((u) => (filter === 'all' ? true : u.status === filter))

  const formatDays = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return 'Nenhum dia'
    return schedules
      .map((s) => s.day_of_week)
      .sort()
      .map((d) => DAYS_MAP[d])
      .join(', ')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Unidades AJF</h1>
          <p className="text-muted-foreground">Gerencie locais, preços e configurações.</p>
        </div>
        {isAdmin && (
          <Button
            className="font-bold shrink-0"
            onClick={() => setDialogState({ open: true, unit: null })}
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Unidade
          </Button>
        )}
      </div>

      <div className="flex justify-start">
        <Tabs
          value={filter}
          onValueChange={(v: any) => setFilter(v)}
          className="w-full sm:w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="inactive">Inativas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((unit) => (
          <Card key={unit.id} className="border-border bg-card overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={unit.photo}
                alt={unit.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90" />
              <div className="absolute top-4 right-4">
                <Badge
                  variant={unit.status === 'active' ? 'default' : 'secondary'}
                  className="font-bold"
                >
                  {unit.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-black uppercase text-foreground drop-shadow-md">
                  {unit.name}
                </h2>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">{unit.address}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CalendarDays className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">{formatDays(unit.schedules)}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">
                  {(unit.available_hours || []).join(', ') || 'Nenhum horário'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground mr-2" />
                  <span className="font-bold">{unit.capacity}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                  <span className="font-bold text-success">R$ {unit.price.toFixed(2)}</span>
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent text-foreground mt-2"
                  onClick={() => setDialogState({ open: true, unit })}
                >
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhuma unidade encontrada para este filtro.
          </div>
        )}
      </div>

      <UnitDialog
        unit={dialogState.unit}
        isOpen={dialogState.open}
        onClose={() => setDialogState({ open: false, unit: null })}
        onSaved={load}
      />
    </div>
  )
}
