import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { FinancialRecord } from '../types'
import toast from 'react-hot-toast'

export function useFinancial(clientId?: string) {
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('financial_records')
      .select(`*, client:clients(id,name,color,avatar_url)`)
      .order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    const { data, error } = await query
    if (!error) setRecords(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  async function createRecord(data: Partial<FinancialRecord>) {
    const { data: created, error } = await supabase.from('financial_records').insert(data).select().single()
    if (error) { toast.error('Erro ao criar registro'); return null }
    setRecords(prev => [created, ...prev])
    toast.success('Registro criado!')
    return created
  }

  async function updateRecord(id: string, data: Partial<FinancialRecord>) {
    const { data: updated, error } = await supabase.from('financial_records').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar'); return null }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r))
    toast.success('Registro atualizado!')
    return updated
  }

  async function markAsPaid(id: string) {
    return updateRecord(id, { status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
  }

  async function deleteRecord(id: string) {
    const { error } = await supabase.from('financial_records').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return false }
    setRecords(prev => prev.filter(r => r.id !== id))
    toast.success('Registro removido!')
    return true
  }

  const totalPaid = records.filter(r => r.status === 'paid').reduce((acc, r) => acc + Number(r.amount), 0)
  const totalPending = records.filter(r => r.status === 'pending').reduce((acc, r) => acc + Number(r.amount), 0)
  const totalOverdue = records.filter(r => r.status === 'overdue').reduce((acc, r) => acc + Number(r.amount), 0)

  return { records, loading, createRecord, updateRecord, markAsPaid, deleteRecord, totalPaid, totalPending, totalOverdue, refetch: fetch }
}
