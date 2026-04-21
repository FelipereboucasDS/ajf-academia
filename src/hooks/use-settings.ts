import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface AppSettings {
  id: number
  booking_cutoff_time: string
  billing_cutoff_type: 'last_business_day' | 'specific_day'
  billing_cutoff_day: number
  pix_key: string
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single()
    if (data) setSettings(data as AppSettings)
    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const { data, error } = await supabase
      .from('app_settings')
      .update(newSettings)
      .eq('id', 1)
      .select()
      .single()
    if (data) setSettings(data as AppSettings)
    return { data, error }
  }

  return { settings, loading, updateSettings, refresh: fetchSettings }
}
