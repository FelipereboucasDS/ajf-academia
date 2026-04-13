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
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createUnit, updateUnit } from '@/services/units'

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
  photo: z.string().url('URL inválida').or(z.literal('')),
  status: z.boolean(),
  available_hours: z.string(),
  days_of_week: z.array(z.number()),
})

export function UnitDialog({ unit, isOpen, onClose, onSaved }: any) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      capacity: 20,
      price: 0,
      photo: '',
      status: true,
      available_hours: '',
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
          available_hours: (unit.available_hours || []).join(', '),
          days_of_week: unit.schedules?.map((s: any) => s.day_of_week) || [],
        })
      } else {
        form.reset({
          name: '',
          address: '',
          capacity: 20,
          price: 0,
          photo: 'https://img.usecurling.com/p/600/400?q=gym&color=black',
          status: true,
          available_hours: '',
          days_of_week: [],
        })
      }
    }
  }, [isOpen, unit, form])

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
        available_hours: vals.available_hours
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
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

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="available_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horários (separados por vírgula)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 08:00, 10:00" {...field} />
                  </FormControl>
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
                <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-4">
                  <div className="space-y-0.5">
                    <FormLabel>Unidade Ativa</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
