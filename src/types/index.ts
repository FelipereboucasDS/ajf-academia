export type Role = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'inactive'
  favoriteUnitId?: string
  avatar?: string
  dateOfBirth?: string
}

export interface Unit {
  id: string
  name: string
  address: string
  photo: string
  capacity: number
  price: number
}

export interface UnitSchedule {
  id?: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  unitId: string
}

export interface Booking {
  id: string
  date: string
  unitId: string
  studentId: string
  studentName?: string
  studentEmail?: string
  status: 'booked' | 'cancelled'
  attendance: 'pending' | 'present' | 'absent'
}
