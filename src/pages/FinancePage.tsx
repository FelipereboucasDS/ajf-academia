import { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useMainStore from '@/stores/useMainStore'
import { useSettings } from '@/hooks/use-settings'
import { useInvoices } from '@/hooks/use-invoices'
import { QrCode, Copy, Upload, Check, Loader2, Eye, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const FinancePage = () => {
  const { currentUser, bookings, units } = useMainStore()
  const { settings, loading: settingsLoading } = useSettings()
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const { invoices, loading: invoicesLoading, upsertInvoice } = useInvoices(selectedMonth)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const monthOptions = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = -6; i <= 3; i++) {
      const d = i < 0 ? subMonths(now, Math.abs(i)) : addMonths(now, i)
      months.push(format(d, 'yyyy-MM'))
    }
    return months.sort() // ascending
  }, [])

  // Helper to determine the billing period of a booking based on settings
  const getInvoicePeriod = (dateStr: string) => {
    if (!dateStr) return selectedMonth
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
    const localDate = new Date(year, month - 1, day)

    if (settings?.billing_cutoff_type === 'specific_day' && settings?.billing_cutoff_day) {
      if (localDate.getDate() > settings.billing_cutoff_day) {
        return format(addMonths(localDate, 1), 'yyyy-MM')
      }
    }
    return format(localDate, 'yyyy-MM')
  }

  // Admin logic
  const adminStudentTotals = useMemo(() => {
    if (currentUser?.role !== 'admin') return []

    const monthBookings = bookings.filter(
      (b: any) => b.status === 'booked' && getInvoicePeriod(b.date) === selectedMonth,
    )

    const totals: Record<string, { total: number; name: string; id: string }> = {}

    monthBookings.forEach((b: any) => {
      const unit = units.find((u: any) => u.id === b.unitId)
      if (!totals[b.studentId]) {
        totals[b.studentId] = {
          id: b.studentId,
          name: b.studentName || 'Aluno Desconhecido',
          total: 0,
        }
      }
      totals[b.studentId].total += unit?.price || 0
    })

    return Object.values(totals)
  }, [bookings, units, selectedMonth, currentUser, settings])

  // Student logic
  const studentBookings = useMemo(() => {
    if (currentUser?.role === 'admin') return []
    return bookings.filter(
      (b: any) =>
        b.studentId === currentUser?.id &&
        b.status === 'booked' &&
        getInvoicePeriod(b.date) === selectedMonth,
    )
  }, [bookings, currentUser, selectedMonth, settings])

  const studentTotalDue = useMemo(() => {
    return studentBookings.reduce((acc: number, b: any) => {
      const unit = units.find((u: any) => u.id === b.unitId)
      return acc + (unit?.price || 0)
    }, 0)
  }, [studentBookings, units])

  const currentInvoice = invoices.find((i) => i.student_id === currentUser?.id)

  const handleCopyPix = () => {
    if (!settings?.pix_key) {
      toast.error('Chave PIX não configurada pelo administrador.')
      return
    }
    navigator.clipboard.writeText(settings.pix_key)
    toast.success('Chave PIX copiada!')
  }

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUser.id}-${selectedMonth}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName)

      await upsertInvoice({
        student_id: currentUser.id,
        period: selectedMonth,
        status: 'under_review',
        receipt_url: publicUrlData.publicUrl,
        amount: studentTotalDue,
      })

      toast.success('Comprovante enviado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar comprovante. Tente novamente.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleStatusChange = async (
    studentId: string,
    status: 'pending' | 'under_review' | 'paid',
    amount: number,
  ) => {
    await upsertInvoice({
      student_id: studentId,
      period: selectedMonth,
      status,
      amount,
    })
    toast.success('Status atualizado com sucesso!')
  }

  if (settingsLoading || invoicesLoading || !currentUser) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatMonth = (yyyyMm: string) => {
    const [y, m] = yyyMm.split('-')
    const d = new Date(parseInt(y), parseInt(m) - 1, 1)
    return format(d, 'MMMM yyyy', { locale: ptBR })
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'under_review':
        return 'Em Análise'
      default:
        return 'Pendente'
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/20 text-success'
      case 'under_review':
        return 'bg-warning/20 text-warning'
      default:
        return 'bg-destructive/20 text-destructive'
    }
  }

  // Render Admin
  if (currentUser.role === 'admin') {
    const totalMonth = adminStudentTotals.reduce((acc, s) => acc + s.total, 0)

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Faturamento</h1>
            <p className="text-muted-foreground">
              Gestão de recebimentos por mês e validação de comprovantes.
            </p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px] capitalize font-medium">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m} value={m} className="capitalize">
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="border-border bg-card overflow-hidden shadow-sm">
          <CardHeader className="bg-accent/30 border-b border-border pb-8">
            <CardTitle className="text-center text-muted-foreground uppercase text-sm tracking-widest mb-2">
              Previsão de Faturamento ({formatMonth(selectedMonth)})
            </CardTitle>
            <div className="text-5xl font-black text-center text-success glow-green drop-shadow-sm">
              R$ {totalMonth.toFixed(2)}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {adminStudentTotals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Valor Devido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comprovante</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminStudentTotals.map((student) => {
                    const invoice = invoices.find((i) => i.student_id === student.id)
                    const status = invoice?.status || 'pending'

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="font-semibold text-foreground">
                          R$ {student.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-transparent ${statusColor(status)}`}
                          >
                            {translateStatus(status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice?.receipt_url ? (
                            <a
                              href={invoice.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sm text-primary font-medium hover:underline"
                            >
                              <Eye className="w-4 h-4 mr-1" /> Ver
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm flex items-center">
                              <XCircle className="w-3 h-3 mr-1" /> Não enviado
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status !== 'paid' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleStatusChange(student.id, 'paid', student.total)
                                }
                                className="bg-success text-success-foreground hover:bg-success/90 h-8 text-xs font-bold px-3"
                              >
                                <Check className="w-3 h-3 mr-1" /> Aprovar
                              </Button>
                            )}
                            {status === 'paid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusChange(student.id, 'pending', student.total)
                                }
                                className="text-muted-foreground hover:text-foreground h-8 text-xs px-3"
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Desfazer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>Nenhum agendamento de aluno encontrado para este mês.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-accent/10 border-t border-border p-4 text-xs text-muted-foreground justify-center">
            O mês de faturamento é calculado considerando a regra de fechamento:{' '}
            {settings?.billing_cutoff_type === 'last_business_day'
              ? 'Último dia útil'
              : `Dia ${settings?.billing_cutoff_day}`}
            .
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render Student
  const status = currentInvoice?.status || 'pending'

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Meu Financeiro</h1>
          <p className="text-muted-foreground">Acompanhe suas faturas e envie comprovantes.</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px] capitalize font-medium">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {formatMonth(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-accent/30 border-b border-border pb-8 relative">
          <div className="absolute top-4 right-4">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm font-semibold border-transparent ${statusColor(status)}`}
            >
              {translateStatus(status)}
            </Badge>
          </div>
          <CardTitle className="text-center text-muted-foreground uppercase text-sm tracking-widest mb-2 mt-4">
            Fatura de {formatMonth(selectedMonth)}
          </CardTitle>
          <div className="text-5xl font-black text-center text-success glow-green drop-shadow-sm">
            R$ {studentTotalDue.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold uppercase text-muted-foreground border-b border-border pb-2">
              Resumo de Aulas
            </h3>
            {studentBookings.length > 0 ? (
              studentBookings.map((b: any, i: number) => {
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
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma aula faturada neste período.
              </p>
            )}
          </div>

          {studentTotalDue > 0 && (
            <>
              <Separator className="bg-border" />
              {status !== 'paid' && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold uppercase flex items-center gap-2">
                    <QrCode className="w-5 h-5" /> Pagamento via PIX
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Realize o pagamento utilizando a chave abaixo e anexe o comprovante para
                    análise.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-background border border-border rounded-md p-3 font-mono text-sm text-muted-foreground truncate flex items-center">
                      {settings?.pix_key || 'Chave PIX não configurada'}
                    </div>
                    <Button
                      onClick={handleCopyPix}
                      disabled={!settings?.pix_key}
                      className="shrink-0 font-bold"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copiar
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="bg-accent/20 border-t border-border p-6 flex flex-col items-center gap-4">
          {studentTotalDue === 0 ? (
            <p className="text-sm text-muted-foreground">Não há valor a ser pago nesta fatura.</p>
          ) : status === 'paid' ? (
            <div className="flex items-center text-success font-bold text-lg">
              <Check className="w-6 h-6 mr-2" /> Fatura Paga e Confirmada
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUploadReceipt}
              />
              <Button
                size="lg"
                className="w-full sm:w-auto font-bold"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {currentInvoice?.receipt_url
                  ? 'Atualizar Comprovante'
                  : 'Anexar Comprovante de Pagamento'}
              </Button>
              {currentInvoice?.receipt_url && (
                <a
                  href={currentInvoice.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline flex items-center font-medium"
                >
                  <Eye className="w-4 h-4 mr-1" /> Ver comprovante enviado
                </a>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default FinancePage
