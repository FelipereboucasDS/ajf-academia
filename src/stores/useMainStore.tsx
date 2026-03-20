import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react'
import { User, Unit, UnitSchedule, Booking } from '@/types'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface MainStoreState {
  currentUser: User
  users: User[]
  units: Unit[]
  schedules: UnitSchedule[]
  bookings: Booking[]
  loading: boolean
  initStore: (userId: string) => Promise<void>
  bookTraining: (date: string, unitId: string) => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  markAttendance: (bookingId: string, status: 'present' | 'absent') => Promise<void>
  toggleFavoriteUnit: (unitId: string) => Promise<void>
  setCurrentUser: (user: User) => void
}

const StoreContext = createContext<MainStoreState | undefined>(undefined)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>({} as User)
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [schedules, setSchedules] = useState<UnitSchedule[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  const initStore = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const [profilesRes, unitsRes, schedulesRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('units').select('*'),
        supabase.from('schedules').select('*'),
        supabase.from('bookings').select('*'),
      ])

      if (profilesRes.data) {
        const mappedUsers: User[] = profilesRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          status: p.status,
          favoriteUnitId: p.favorite_unit_id || undefined,
          avatar: p.avatar || undefined,
          dateOfBirth: p.date_of_birth || undefined,
        }))
        setUsers(mappedUsers)
        setCurrentUser(mappedUsers.find((u) => u.id === userId) || ({} as User))
      }

      if (unitsRes.data) {
        setUnits(
          unitsRes.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            address: u.address,
            photo: u.photo,
            capacity: u.capacity,
            price: u.price,
          })),
        )
      }

      if (schedulesRes.data) {
        setSchedules(
          schedulesRes.data.map((s: any) => ({
            id: s.id,
            dayOfWeek: s.day_of_week,
            unitId: s.unit_id,
          })),
        )
      }

      if (bookingsRes.data) {
        setBookings(
          bookingsRes.data.map((b: any) => ({
            id: b.id,
            date: b.date,
            unitId: b.unit_id,
            studentId: b.student_id,
            studentName: b.student_name,
            studentEmail: b.student_email,
            status: b.status,
            attendance: b.attendance,
          })),
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const bookTraining = useCallback(
    async (date: string, unitId: string) => {
      if (!currentUser.id) return
      const exists = bookings.find(
        (b) => b.date === date && b.studentId === currentUser.id && b.status === 'booked',
      )
      if (exists) {
        toast.error('Você já possui um agendamento para este dia.')
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          date,
          unit_id: unitId,
          student_id: currentUser.id,
          student_name: currentUser.name,
          student_email: currentUser.email,
          status: 'booked',
          attendance: 'pending',
        })
        .select()
        .single()

      if (error) {
        toast.error('Erro ao agendar.')
        return
      }

      setBookings((prev) => [
        ...prev,
        {
          id: data.id,
          date: data.date,
          unitId: data.unit_id,
          studentId: data.student_id,
          studentName: data.student_name,
          studentEmail: data.student_email,
          status: data.status as any,
          attendance: data.attendance as any,
        },
      ])
      toast.success('Treino agendado com sucesso!')
    },
    [currentUser, bookings],
  )

  const cancelBooking = useCallback(async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    if (error) {
      toast.error('Erro ao cancelar.')
      return
    }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)))
    toast.success('Agendamento cancelado.')
  }, [])

  const markAttendance = useCallback(async (bookingId: string, status: 'present' | 'absent') => {
    const { error } = await supabase
      .from('bookings')
      .update({ attendance: status })
      .eq('id', bookingId)
    if (error) {
      toast.error('Erro ao marcar presença.')
      return
    }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, attendance: status } : b)))
    toast.success(`Presença atualizada para ${status === 'present' ? 'Presente' : 'Faltou'}.`)
  }, [])

  const toggleFavoriteUnit = useCallback(
    async (unitId: string) => {
      if (!currentUser.id) return
      const newFav = currentUser.favoriteUnitId === unitId ? null : unitId
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_unit_id: newFav })
        .eq('id', currentUser.id)
      if (error) {
        toast.error('Erro ao favoritar unidade.')
        return
      }
      const updatedUser = { ...currentUser, favoriteUnitId: newFav || undefined }
      setCurrentUser(updatedUser)
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)))
      toast.success(newFav ? 'Unidade favoritada!' : 'Unidade removida dos favoritos.')
    },
    [currentUser],
  )

  const value = useMemo(
    () => ({
      currentUser,
      users,
      units,
      schedules,
      bookings,
      loading,
      initStore,
      bookTraining,
      cancelBooking,
      markAttendance,
      toggleFavoriteUnit,
      setCurrentUser,
    }),
    [
      currentUser,
      users,
      units,
      schedules,
      bookings,
      loading,
      initStore,
      bookTraining,
      cancelBooking,
      markAttendance,
      toggleFavoriteUnit,
    ],
  )

  return React.createElement(StoreContext.Provider, { value }, children)
}

export default function useMainStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useMainStore must be used within StoreProvider')
  return context
}
