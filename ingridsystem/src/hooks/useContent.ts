import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ContentPiece } from '../types'
import toast from 'react-hot-toast'

export function useContent(clientId?: string) {
  const [content, setContent] = useState<ContentPiece[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('content_pieces')
      .select(`*, client:clients(id,name,color,avatar_url), uploader:team_members!content_pieces_uploaded_by_fkey(id,name)`)
      .order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    const { data, error } = await query
    if (!error) setContent(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  async function createContent(data: Partial<ContentPiece>) {
    const { data: created, error } = await supabase.from('content_pieces').insert(data).select().single()
    if (error) { toast.error('Erro ao criar conteúdo'); return null }
    setContent(prev => [created, ...prev])
    toast.success('Conteúdo adicionado!')
    return created
  }

  async function updateContent(id: string, data: Partial<ContentPiece>) {
    const { data: updated, error } = await supabase
      .from('content_pieces')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar'); return null }
    setContent(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    toast.success('Conteúdo atualizado!')
    return updated
  }

  async function approveRaw(id: string) {
    return updateContent(id, { status: 'approved_raw' })
  }

  async function approveEdited(id: string) {
    const ADMIN_ID = '00000000-0000-0000-0000-000000000001'
    return updateContent(id, {
      status: 'approved',
      approved_by: ADMIN_ID,
      approved_at: new Date().toISOString()
    })
  }

  async function scheduleContent(id: string, date: string) {
    return updateContent(id, { status: 'scheduled', scheduled_date: date })
  }

  async function deleteContent(id: string) {
    const { error } = await supabase.from('content_pieces').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir'); return false }
    setContent(prev => prev.filter(c => c.id !== id))
    toast.success('Conteúdo removido!')
    return true
  }

  return { content, loading, createContent, updateContent, approveRaw, approveEdited, scheduleContent, deleteContent, refetch: fetch }
}
