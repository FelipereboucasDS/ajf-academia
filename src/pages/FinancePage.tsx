import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import useMainStore from '@/stores/useMainStore'
import { QrCode, Copy, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

const FinancePage = () => {
  const { currentUser, bookings, units } = useMainStore()

  // Simplified calculation for demo: past month total
  const myBookings = bookings.filter(
    (b) => b.studentId === currentUser.id && b.status === 'booked' && b.attendance !== 'pending',
  )

  const totalDue = myBookings.reduce((acc, b) => {
    const unit = units.find((u) => u.id === b.unitId)
    return acc + (unit?.price || 0)
  }, 0)

  const handleCopyPix = () => {
    navigator.clipboard.writeText(
      '00020126360014br.gov.bcb.pix0114+55119999999995204000053039865802BR5922AJF ACADEMIA GOLEIROS6009SAO PAULO62070503***6304FC3C',
    )
    toast.success('Chave PIX copiada!')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Fechamento mensal e pagamentos.</p>
      </div>

      <Card className="border-border bg-card overflow-hidden">
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
              myBookings.map((b, i) => {
                const unit = units.find((u) => u.id === b.unitId)
                return (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span>
                      {new Date(b.date).toLocaleDateString('pt-BR')} - {unit?.name}
                    </span>
                    <span className="font-medium">R$ {unit?.price.toFixed(2)}</span>
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
                00020126360014br.gov.bcb.pix...
              </div>
              <Button
                onClick={handleCopyPix}
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
            className="w-full flex items-center justify-center gap-2 border-border"
          >
            <DollarSign className="w-4 h-4" /> Pagar com Google Pay
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-border"
          >
            <DollarSign className="w-4 h-4" /> Pagar com Apple Pay
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default FinancePage
