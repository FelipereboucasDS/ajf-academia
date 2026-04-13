import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Edit, Plus, Loader2 } from 'lucide-react'
import useMainStore from '@/stores/useMainStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { updateUnit, createUnit } from '@/services/units'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tables } from '@/lib/supabase/types'

type Unit = Tables<'units'>

const unitSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  capacity: z.coerce.number().min(1, 'Capacidade deve ser maior que 0'),
  price: z.coerce.number().min(0, 'Preço inválido'),
  photo: z.string().url('URL da foto inválida').or(z.literal('')),
})

type UnitFormValues = z.infer<typeof unitSchema>

const UnitsPage = () => {
  const { units: storeUnits } = useMainStore()
  const [units, setUnits] = useState<Unit[]>([])
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (storeUnits?.length) {
      setUnits(storeUnits)
    }
  }, [storeUnits])

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      address: '',
      capacity: 20,
      price: 0,
      photo: '',
    },
  })

  const openEditDialog = (unit: Unit) => {
    setEditingUnit(unit)
    form.reset({
      name: unit.name,
      address: unit.address,
      capacity: unit.capacity,
      price: unit.price,
      photo: unit.photo,
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingUnit(null)
    form.reset({
      name: '',
      address: '',
      capacity: 20,
      price: 0,
      photo: 'https://img.usecurling.com/p/600/400?q=gym&color=black',
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: UnitFormValues) => {
    setIsSubmitting(true)
    try {
      if (editingUnit) {
        const { data, error } = await updateUnit(editingUnit.id, values)
        if (error) throw error
        if (data) {
          setUnits((prev) => prev.map((u) => (u.id === data.id ? data : u)))
          toast({ title: 'Sucesso', description: 'Unidade atualizada com sucesso!' })
        }
      } else {
        const { data, error } = await createUnit(values)
        if (error) throw error
        if (data) {
          setUnits((prev) => [...prev, data])
          toast({ title: 'Sucesso', description: 'Unidade criada com sucesso!' })
        }
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar a unidade.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Unidades AJF</h1>
          <p className="text-muted-foreground">Gerencie locais, preços e capacidades.</p>
        </div>
        <Button className="font-bold" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" /> Nova Unidade
        </Button>
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
                onClick={() => openEditDialog(unit)}
              >
                <Edit className="w-4 h-4 mr-2" /> Editar Unidade
              </Button>
            </CardContent>
          </Card>
        ))}
        {units.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhuma unidade encontrada.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Unidade Centro" {...field} />
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
                      <Input placeholder="Rua Exemplo, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                    <FormLabel>URL da Foto</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full font-bold">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingUnit ? 'Salvar Alterações' : 'Criar Unidade'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UnitsPage
