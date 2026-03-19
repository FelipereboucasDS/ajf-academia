import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import useMainStore from '@/stores/useMainStore'
import { MapPin, Star, AlertTriangle } from 'lucide-react'

const ProfilePage = () => {
  const { currentUser, units, toggleFavoriteUnit } = useMainStore()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Meu Perfil</h1>

      <Card className="border-border bg-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-background border-b border-border"></div>
        <CardContent className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-12 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-card bg-accent shadow-xl">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="text-3xl font-black">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="mb-2">
                <h2 className="text-2xl font-bold uppercase">{currentUser.name}</h2>
                <p className="text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-primary text-primary font-bold uppercase tracking-wider"
            >
              {currentUser.role === 'student'
                ? 'Goleiro'
                : currentUser.role === 'teacher'
                  ? 'Treinador'
                  : 'Administrador'}
            </Badge>
          </div>

          <div className="grid gap-8 mt-8">
            {currentUser.role === 'student' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase border-b border-border pb-2">
                  Unidade Favorita
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {units.map((unit) => {
                    const isFav = currentUser.favoriteUnitId === unit.id
                    return (
                      <div
                        key={unit.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${isFav ? 'border-yellow-500 bg-yellow-500/10' : 'border-border bg-background hover:border-primary/50'}`}
                        onClick={() => toggleFavoriteUnit(unit.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">{unit.name}</h4>
                          <Star
                            className={`w-5 h-5 ${isFav ? 'text-yellow-500 fill-yellow-500 glow-yellow' : 'text-muted-foreground'}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {unit.address}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-bold uppercase text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Zona de Perigo
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl">
                Solicitar inativação suspenderá sua conta e cancelará agendamentos futuros. Entre em
                contato com a administração para reativar.
              </p>
              <Button variant="destructive" className="font-bold">
                Solicitar Inativação da Conta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
