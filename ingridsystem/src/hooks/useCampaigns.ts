import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Campaign } from '../types'
import toast from 'react-hot-toast'

export function useCampaigns(clientId?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('campaigns')
      .select(`*, client:clients(id,name,color,avatar_url)`)
      .order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    const { data, error } = await query
    if (!error) setCampaigns(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  async function createCampaign(data: Partial<Campaign>) {
    const { data: created, error } = await supabase.from('campaigns').insert(data).select().single()
    if (error) { toast.error('Erro ao criar campanha'); return null }
    setCampaigns(prev => [created, ...prev])
    toast.success('Campanha criada!')
    return created
  }

  async function updateCampaign(id: string, data: Partial<Campaign>) {
    const { data: updated, error } = await supabase.from('campaigns').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar campanha'); return null }
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    toast.success('Campanha atualizada!')
    return updated
  }

  async function deleteCampaign(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir campanha'); return false }
    setCampaigns(prev => prev.filter(c => c.id !== id))
    toast.success('Campanha removida!')
    return true
  }

  const totalSpend = campaigns.reduce((acc, c) => acc + Number(c.spend || 0), 0)
  const totalBudget = campaigns.reduce((acc, c) => acc + Number(c.budget || 0), 0)
  const totalClicks = campaigns.reduce((acc, c) => acc + Number(c.clicks || 0), 0)
  const avgROAS = campaigns.filter(c => c.roas > 0).length > 0
    ? campaigns.filter(c => c.roas > 0).reduce((acc, c) => acc + Number(c.roas), 0) / campaigns.filter(c => c.roas > 0).length
    : 0

  return { campaigns, loading, createCampaign, updateCampaign, deleteCampaign, totalSpend, totalBudget, totalClicks, avgROAS, refetch: fetch }
}
