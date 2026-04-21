import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import useMainStore from '@/stores/useMainStore'
import { useSettings } from '@/hooks/use-settings'
import { QrCode, Copy, DollarSign, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMemo } from 'react'

const FinancePage = () => {
  const { currentUser, bookings, units } = useMainStore()
  const { settings, loading } = useSettings()

  const myBookings = useMemo(() => {
    if (currentUser.role === 'admin') {
      return bookings.filter((b: any) => b.status === 'booked' && b.attendance !== 'pending')
    }
    return bookings.filter(
      (b: any) =>
        b.studentId === currentUser.id && b.status === 'booked' && b.attendance !== 'pending',
    )
  }, [bookings, currentUser])

  const totalDue = myBookings.reduce((acc: number, b: any) => {
    const unit = units.find((u: any) => u.id === b.unitId)
    return acc + (unit?.price || 0)
  }, 0)

  const handleCopyPix = () => {
    if (!settings?.pix_key) {
      toast.error('Chave PIX não configurada pelo administrador.')
      return
    }
    navigator.clipboard.writeText(settings.pix_key)
    toast.success('Chave PIX copiada!')
  }

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (currentUser.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Financeiro Geral</h1>
          <p className="text-muted-foreground">
            Previsão de faturamento baseada nos agendamentos confirmados.
          </p>
        </div>

        <Card className="border-border bg-card overflow-hidden shadow-sm">
          <CardHeader className="bg-accent/30 border-b border-border pb-8">
            <CardTitle className="text-center text-muted-foreground uppercase text-sm tracking-widest mb-2">
              Faturamento Previsto
            </CardTitle>
            <div className="text-5xl font-black text-center text-success glow-green drop-shadow-sm">
              R$ {totalDue.toFixed(2)}
            </div>
          </CardHeader>
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Faturamento calculado considerando a regra de fechamento:{' '}
            <span className="font-bold text-foreground">
              {settings?.billing_cutoff_type === 'last_business_day'
                ? 'Último dia útil do mês'
                : `Dia ${settings?.billing_cutoff_day} do mês`}
            </span>
            .
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Fechamento mensal e pagamentos.</p>
      </div>

      <Card className="border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-accent/30 border-b border-border pb-8">
          <CardTitle className="text-center text-muted-foreground uppercase text-sm tracking-widest mb-2">
            Fatura Atual
          </CardTitle>
          <div className="text-5xl font-black text-center text-success glow-green drop-shadow-sm">
            R$ {totalDue.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold uppercase text-muted-foreground border-b border-border pb-2">
              Resumo de Aulas
            </h3>
            {myBookings.length > 0 ? (
              myBookings.map((b: any, i: number) => {
                const unit = units.find((u: any) => u.id === b.unitId)
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span className="text-muted-foreground font-mono">
                        {new Date(b.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        - {unit?.name}{' '}
                        <span className="text-muted-foreground">
                          ({b.timeSlot || 'Indefinido'})
                        </span>
                      </span>
                    </span>
                    <span className="font-medium text-success">
                      R$ {unit?.price?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma aula faturada neste período.</p>
            )}
          </div>

          <Separator className="bg-border" />

          <div className="space-y-4 pt-4">
            <h3 className="font-bold uppercase flex items-center gap-2">
              <QrCode className="w-5 h-5" /> Pagamento via PIX
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border border-border rounded-md p-3 font-mono text-xs text-muted-foreground truncate flex items-center">
                {settings?.pix_key || 'Chave PIX não configurada'}
              </div>
              <Button
                onClick={handleCopyPix}
                disabled={!settings?.pix_key}
                className="shrink-0 bg-primary text-primary-foreground font-bold"
              >
                <Copy className="w-4 h-4 mr-2" /> Copiar
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-accent/20 border-t border-border p-6 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-border hover:bg-accent transition-colors"
          >
            <DollarSign className="w-4 h-4" /> Pagar com Google Pay
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-border hover:bg-accent transition-colors"
          >
            <DollarSign className="w-4 h-4" /> Pagar com Apple Pay
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default FinancePage
