import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TeamMember, Partnership } from '../types'
import toast from 'react-hot-toast'

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from('team_members').select('*').order('created_at'),
      supabase.from('partnerships').select('*').order('created_at', { ascending: false })
    ])
    setMembers(m || [])
    setPartnerships(p || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createMember(data: Partial<TeamMember>) {
    const { data: created, error } = await supabase.from('team_members').insert(data).select().single()
    if (error) { toast.error('Erro ao criar membro'); return null }
    setMembers(prev => [...prev, created])
    toast.success('Membro adicionado!')
    return created
  }

  async function updateMember(id: string, data: Partial<TeamMember>) {
    const { data: updated, error } = await supabase.from('team_members').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar'); return null }
    setMembers(prev => prev.map(m => m.id === id ? updated : m))
    toast.success('Membro atualizado!')
    return updated
  }

  async function createPartnership(data: Partial<Partnership>) {
    const { data: created, error } = await supabase.from('partnerships').insert(data).select().single()
    if (error) { toast.error('Erro ao criar parceria'); return null }
    setPartnerships(prev => [created, ...prev])
    toast.success('Parceria adicionada!')
    return created
  }

  async function updatePartnership(id: string, data: Partial<Partnership>) {
    const { data: updated, error } = await supabase.from('partnerships').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar parceria'); return null }
    setPartnerships(prev => prev.map(p => p.id === id ? updated : p))
    toast.success('Parceria atualizada!')
    return updated
  }

  return { members, partnerships, loading, createMember, updateMember, createPartnership, updatePartnership, refetch: fetch }
}
