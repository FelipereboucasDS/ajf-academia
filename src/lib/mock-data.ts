import { User, Unit, UnitSchedule, Booking } from '@/types'
import { addDays, subDays, format } from 'date-fns'

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Lucas Silva',
    email: 'lucas@ajf.com',
    role: 'student',
    status: 'active',
    favoriteUnitId: 'unit1',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    id: 'u2',
    name: 'Pedro Santos',
    email: 'pedro@ajf.com',
    role: 'student',
    status: 'active',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  { id: 'u3', name: 'Marcos Gomes', email: 'marcos@ajf.com', role: 'student', status: 'inactive' },
  {
    id: 't1',
    name: 'Prof. Renato',
    email: 'renato@ajf.com',
    role: 'teacher',
    status: 'active',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
  },
  {
    id: 'a1',
    name: 'Admin AJF',
    email: 'admin@ajf.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://img.usecurling.com/i?q=shield&color=white&shape=fill',
  },
]

export const mockUnits: Unit[] = [
  {
    id: 'unit1',
    name: 'AJF Penha',
    address: 'Rua Guaiaúna, 150 - Penha, SP',
    photo: 'https://img.usecurling.com/p/600/400?q=soccer%20field&color=black&dpr=2',
    capacity: 15,
    price: 80,
  },
  {
    id: 'unit2',
    name: 'AJF Guarulhos',
    address: 'Av. Tiradentes, 1000 - Guarulhos, SP',
    photo: 'https://img.usecurling.com/p/600/400?q=stadium%20lights&color=black&dpr=2',
    capacity: 12,
    price: 75,
  },
  {
    id: 'unit3',
    name: 'AJF Mooca',
    address: 'Rua Juventus, 690 - Mooca, SP',
    photo: 'https://img.usecurling.com/p/600/400?q=goal%20net&color=black&dpr=2',
    capacity: 20,
    price: 90,
  },
]

export const mockSchedules: UnitSchedule[] = [
  { dayOfWeek: 1, unitId: 'unit1' }, // Monday -> Penha
  { dayOfWeek: 2, unitId: 'unit2' }, // Tuesday -> Guarulhos
  { dayOfWeek: 3, unitId: 'unit1' }, // Wednesday -> Penha
  { dayOfWeek: 4, unitId: 'unit2' }, // Thursday -> Guarulhos
  { dayOfWeek: 5, unitId: 'unit3' }, // Friday -> Mooca
  { dayOfWeek: 6, unitId: 'unit3' }, // Saturday -> Mooca
  { dayOfWeek: 0, unitId: 'unit3' }, // Sunday -> Mooca
]

const today = new Date()
export const mockBookings: Booking[] = [
  {
    id: 'b1',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    unitId: 'unit1',
    studentId: 'u1',
    status: 'booked',
    attendance: 'present',
  },
  {
    id: 'b2',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    unitId: 'unit2',
    studentId: 'u1',
    status: 'booked',
    attendance: 'absent',
  },
  {
    id: 'b3',
    date: format(today, 'yyyy-MM-dd'),
    unitId: 'unit1',
    studentId: 'u1',
    status: 'booked',
    attendance: 'pending',
  },
  {
    id: 'b4',
    date: format(today, 'yyyy-MM-dd'),
    unitId: 'unit1',
    studentId: 'u2',
    status: 'booked',
    attendance: 'pending',
  },
  {
    id: 'b5',
    date: format(addDays(today, 2), 'yyyy-MM-dd'),
    unitId: 'unit1',
    studentId: 'u1',
    status: 'booked',
    attendance: 'pending',
  },
]
