import { supabase } from '@/lib/supabase/client'
import { TablesInsert, TablesUpdate } from '@/lib/supabase/types'

export const updateUnit = async (id: string, data: TablesUpdate<'units'>) => {
  const { data: updated, error } = await supabase
    .from('units')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  return { data: updated, error }
}

export const createUnit = async (data: TablesInsert<'units'>) => {
  const { data: created, error } = await supabase.from('units').insert(data).select().single()

  return { data: created, error }
}
