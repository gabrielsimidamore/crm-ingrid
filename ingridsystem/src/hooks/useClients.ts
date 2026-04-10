import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Client } from '../types'
import toast from 'react-hot-toast'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (!error) setClients(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createClient(data: Partial<Client>) {
    const { data: created, error } = await supabase.from('clients').insert(data).select().single()
    if (error) { toast.error('Erro ao criar cliente'); return null }
    setClients(prev => [created, ...prev])
    toast.success('Cliente criado!')
    return created
  }

  async function updateClient(id: string, data: Partial<Client>) {
    const { data: updated, error } = await supabase.from('clients').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar cliente'); return null }
    setClients(prev => prev.map(c => c.id === id ? updated : c))
    toast.success('Cliente atualizado!')
    return updated
  }

  async function deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir cliente'); return false }
    setClients(prev => prev.filter(c => c.id !== id))
    toast.success('Cliente removido!')
    return true
  }

  return { clients, loading, createClient, updateClient, deleteClient, refetch: fetch }
}
