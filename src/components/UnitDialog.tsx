import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createUnit, updateUnit } from '@/services/units'
import { supabase } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'

const DAYS = [
  { id: 0, l: 'Dom' },
  { id: 1, l: 'Seg' },
  { id: 2, l: 'Ter' },
  { id: 3, l: 'Qua' },
  { id: 4, l: 'Qui' },
  { id: 5, l: 'Sex' },
  { id: 6, l: 'Sáb' },
]

const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  address: z.string().min(1, 'Obrigatório'),
  capacity: z.coerce.number().min(1, 'Inválido'),
  price: z.coerce.number().min(0, 'Inválido'),
  photo: z.string().min(1, 'Foto obrigatória'),
  status: z.boolean(),
  available_hours: z.array(z.string()),
  days_of_week: z.array(z.number()),
})

const getAvailableHoursArray = (hours: any): string[] => {
  if (Array.isArray(hours)) return hours
  if (typeof hours === 'string') {
    try {
      const parsed = JSON.parse(hours)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return hours
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }
  return []
}

export function UnitDialog({ unit, isOpen, onClose, onSaved }: any) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      capacity: 20,
      price: 0,
      photo: '',
      status: true,
      available_hours: [],
      days_of_week: [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        form.reset({
          name: unit.name,
          address: unit.address,
          capacity: unit.capacity,
          price: unit.price,
          photo: unit.photo,
          status: unit.status === 'active',
          available_hours: getAvailableHoursArray(unit.available_hours),
          days_of_week: unit.schedules?.map((s: any) => s.day_of_week) || [],
        })
      } else {
        form.reset({
          name: '',
          address: '',
          capacity: 20,
          price: 0,
          photo: '',
          status: true,
          available_hours: [],
          days_of_week: [],
        })
      }
      setNewStart('')
      setNewEnd('')
    }
  }, [isOpen, unit, form])

  const timeToMins = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const addSlot = () => {
    if (!newStart || !newEnd)
      return toast({ title: 'Preencha início e fim', variant: 'destructive' })
    const startMins = timeToMins(newStart)
    const endMins = timeToMins(newEnd)
    if (startMins >= endMins)
      return toast({ title: 'Início deve ser antes do fim', variant: 'destructive' })

    const currentSlots = form.getValues('available_hours')
    const hasOverlap = currentSlots.some((slot) => {
      const [s, e] = slot.split(' - ')
      if (!s || !e) return false
      return startMins < timeToMins(e) && endMins > timeToMins(s)
    })

    if (hasOverlap)
      return toast({ title: 'Conflito com um horário já cadastrado', variant: 'destructive' })

    const newSlot = `${newStart} - ${newEnd}`
    form.setValue('available_hours', [...currentSlots, newSlot].sort(), { shouldValidate: true })
    setNewStart('')
    setNewEnd('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const { error } = await supabase.storage.from('unit-photos').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('unit-photos').getPublicUrl(fileName)
      form.setValue('photo', data.publicUrl, { shouldValidate: true })
      toast({ title: 'Foto enviada com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (vals: z.infer<typeof schema>) => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: vals.name,
        address: vals.address,
        capacity: vals.capacity,
        price: vals.price,
        photo: vals.photo,
        status: vals.status ? 'active' : 'inactive',
        available_hours: vals.available_hours,
      }
      const { error } = unit
        ? await updateUnit(unit.id, payload, vals.days_of_week)
        : await createUnit(payload, vals.days_of_week)
      if (error) throw error
      toast({ title: 'Sucesso', description: unit ? 'Unidade atualizada!' : 'Unidade criada!' })
      onSaved()
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const photoUrl = form.watch('photo')

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{unit ? 'Editar' : 'Nova'} Unidade</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photo"
              render={() => (
                <FormItem>
                  <FormLabel>Foto do Local</FormLabel>
                  <div className="flex items-center gap-4">
                    {photoUrl && (
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="cursor-pointer"
                      />
                    </div>
                    {isUploading && (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available_hours"
              render={({ field }) => (
                <FormItem className="border p-3 rounded-md">
                  <FormLabel>Horários Disponíveis (Sem sobreposição)</FormLabel>
                  <div className="flex gap-2 items-end mb-3">
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">Início</Label>
                      <Input
                        type="time"
                        value={newStart}
                        onChange={(e) => setNewStart(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">Fim</Label>
                      <Input
                        type="time"
                        value={newEnd}
                        onChange={(e) => setNewEnd(e.target.value)}
                      />
                    </div>
                    <Button type="button" variant="secondary" onClick={addSlot}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((slot) => (
                      <Badge
                        key={slot}
                        variant="outline"
                        className="flex items-center gap-1 bg-accent"
                      >
                        {slot}
                        <button
                          type="button"
                          onClick={() =>
                            form.setValue(
                              'available_hours',
                              field.value.filter((s) => s !== slot),
                              { shouldValidate: true },
                            )
                          }
                          className="text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {field.value.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Nenhum horário cadastrado.
                      </span>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="days_of_week"
              render={() => (
                <FormItem>
                  <FormLabel>Dias de Funcionamento</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {DAYS.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="days_of_week"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.id)}
                                onCheckedChange={(c) =>
                                  c
                                    ? field.onChange([...field.value, day.id])
                                    : field.onChange(field.value?.filter((v) => v !== day.id))
                                }
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{day.l}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Unidade Ativa</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar Unidade
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
