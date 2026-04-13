import { supabase } from '@/lib/supabase/client'

export const getUnitsWithSchedules = async () => {
  return supabase.from('units').select('*, schedules(*)').order('name')
}

export const createUnit = async (unitData: any, daysOfWeek: number[]) => {
  const { data, error } = await supabase.from('units').insert(unitData).select().single()

  if (error || !data) return { error }

  if (daysOfWeek.length > 0) {
    const schedules = daysOfWeek.map((d) => ({ unit_id: data.id, day_of_week: d }))
    await supabase.from('schedules').insert(schedules)
  }

  return { data, error: null }
}

export const updateUnit = async (id: string, unitData: any, daysOfWeek: number[]) => {
  const { data, error } = await supabase
    .from('units')
    .update(unitData)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return { error }

  await supabase.from('schedules').delete().eq('unit_id', id)

  if (daysOfWeek.length > 0) {
    const schedules = daysOfWeek.map((d) => ({ unit_id: data.id, day_of_week: d }))
    await supabase.from('schedules').insert(schedules)
  }

  return { data, error: null }
}
