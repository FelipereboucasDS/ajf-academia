import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings()
  const { toast } = useToast()

  const [cutoffTime, setCutoffTime] = useState('22:00')
  const [billingType, setBillingType] = useState('last_business_day')
  const [billingDay, setBillingDay] = useState('1')
  const [pixKey, setPixKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setCutoffTime(settings.booking_cutoff_time.slice(0, 5))
      setBillingType(settings.billing_cutoff_type)
      setBillingDay(settings.billing_cutoff_day.toString())
      setPixKey(settings.pix_key)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateSettings({
      booking_cutoff_time: cutoffTime + ':00',
      billing_cutoff_type: billingType as any,
      billing_cutoff_day: parseInt(billingDay) || 1,
      pix_key: pixKey,
    })
    setSaving(false)
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Configurações salvas com sucesso!' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie regras de agendamento e informações financeiras.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="uppercase text-lg">Regras de Agendamento</CardTitle>
            <CardDescription>Defina os limites de horário para ações dos alunos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Horário de Corte (Agendar/Cancelar para o dia seguinte)</Label>
              <Input
                type="time"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ex: Se definido 22:00, alunos não poderão mais agendar ou cancelar treinos para o
                dia seguinte após este horário.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="uppercase text-lg">Fechamento Financeiro</CardTitle>
            <CardDescription>Opções para fechamento e pagamento da fatura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Corte do Mês</Label>
              <Select value={billingType} onValueChange={setBillingType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_business_day">Último dia útil do mês</SelectItem>
                  <SelectItem value="specific_day">Dia específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {billingType === 'specific_day' && (
              <div className="space-y-2 animate-fade-in">
                <Label>Dia de Fechamento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Label>Chave PIX (Para pagamento dos alunos)</Label>
              <Input
                placeholder="CNPJ, Email, Celular ou Aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto font-bold h-12 px-8"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
