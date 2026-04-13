import { supabase } from '@/lib/supabase/client'

export const createBooking = async (
  date: string,
  unitId: string,
  studentId: string,
  timeSlot: string,
  studentName?: string,
  studentEmail?: string,
) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      date,
      unit_id: unitId,
      student_id: studentId,
      status: 'booked',
      attendance: 'pending',
      time_slot: timeSlot,
      student_name: studentName,
      student_email: studentEmail,
    })
    .select()
    .single()

  return { data, error }
}
