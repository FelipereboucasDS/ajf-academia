import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { User, Unit, UnitSchedule, Booking } from '@/types'
import { mockUsers, mockUnits, mockSchedules, mockBookings } from '@/lib/mock-data'
import { toast } from 'sonner'

interface MainStoreState {
  currentUser: User
  users: User[]
  units: Unit[]
  schedules: UnitSchedule[]
  bookings: Booking[]
  setCurrentUser: (user: User) => void
  bookTraining: (date: string, unitId: string) => void
  cancelBooking: (bookingId: string) => void
  markAttendance: (bookingId: string, status: 'present' | 'absent') => void
  toggleFavoriteUnit: (unitId: string) => void
}

const StoreContext = createContext<MainStoreState | undefined>(undefined)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0])
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [units, setUnits] = useState<Unit[]>(mockUnits)
  const [schedules, setSchedules] = useState<UnitSchedule[]>(mockSchedules)
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)

  const bookTraining = (date: string, unitId: string) => {
    const exists = bookings.find(
      (b) => b.date === date && b.studentId === currentUser.id && b.status === 'booked',
    )
    if (exists) {
      toast.error('Você já possui um agendamento para este dia.')
      return
    }
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      date,
      unitId,
      studentId: currentUser.id,
      status: 'booked',
      attendance: 'pending',
    }
    setBookings((prev) => [...prev, newBooking])
    toast.success('Treino agendado com sucesso!')
  }

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)))
    toast.success('Agendamento cancelado.')
  }

  const markAttendance = (bookingId: string, status: 'present' | 'absent') => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, attendance: status } : b)))
    toast.success(`Presença atualizada para ${status === 'present' ? 'Presente' : 'Faltou'}.`)
  }

  const toggleFavoriteUnit = (unitId: string) => {
    const newFav = currentUser.favoriteUnitId === unitId ? undefined : unitId
    const updatedUser = { ...currentUser, favoriteUnitId: newFav }
    setCurrentUser(updatedUser)
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)))
    toast.success(newFav ? 'Unidade favoritada!' : 'Unidade removida dos favoritos.')
  }

  const value = useMemo(
    () => ({
      currentUser,
      users,
      units,
      schedules,
      bookings,
      setCurrentUser,
      bookTraining,
      cancelBooking,
      markAttendance,
      toggleFavoriteUnit,
    }),
    [currentUser, users, units, schedules, bookings],
  )

  return React.createElement(StoreContext.Provider, { value }, children)
}

export default function useMainStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useMainStore must be used within StoreProvider')
  return context
}
