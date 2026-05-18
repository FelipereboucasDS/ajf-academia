import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Invoice {
  id: string
  student_id: string
  period: string
  amount: number
  status: 'pending' | 'under_review' | 'paid'
  receipt_url: string | null
}

export function useInvoices(period?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
    setLoading(true)
    let query = supabase.from('invoices').select('*')
    if (period) {
      query = query.eq('period', period)
    }
    const { data } = await query
    if (data) setInvoices(data as Invoice[])
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [period])

  const upsertInvoice = async (invoice: Partial<Invoice>) => {
    if (invoice.student_id && invoice.period) {
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('student_id', invoice.student_id)
        .eq('period', invoice.period)
        .maybeSingle()

      if (existing) {
        const { data, error } = await supabase
          .from('invoices')
          .update(invoice)
          .eq('id', existing.id)
          .select()
          .single()

        if (data) {
          setInvoices((prev) => prev.map((i) => (i.id === data.id ? (data as Invoice) : i)))
        }
        return { data, error }
      }
    }

    const { data, error } = await supabase.from('invoices').insert(invoice).select().single()

    if (data) {
      setInvoices((prev) => [...prev, data as Invoice])
    }
    return { data, error }
  }

  return { invoices, loading, upsertInvoice, refresh: fetchInvoices }
}
