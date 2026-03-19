import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Edit } from 'lucide-react'
import useMainStore from '@/stores/useMainStore'

const UnitsPage = () => {
  const { units } = useMainStore()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Unidades AJF</h1>
          <p className="text-muted-foreground">Gerencie locais, preços e capacidades.</p>
        </div>
        <Button className="font-bold">Nova Unidade</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <Card key={unit.id} className="border-border bg-card overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={unit.photo}
                alt={unit.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
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
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vagas</span>
                </div>
                <span className="font-bold">{unit.capacity}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Valor</span>
                <span className="font-bold text-success">R$ {unit.price.toFixed(2)}</span>
              </div>
              <Button
                variant="outline"
                className="w-full border-border hover:bg-accent text-foreground"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar Unidade
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default UnitsPage
