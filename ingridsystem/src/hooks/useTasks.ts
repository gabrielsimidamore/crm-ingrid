import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'
import toast from 'react-hot-toast'

export function useTasks(clientId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('tasks')
      .select(`*, client:clients(id,name,color), assignee:team_members!tasks_assigned_to_fkey(id,name,avatar_url)`)
      .order('created_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)
    const { data, error } = await query
    if (!error) setTasks(data || [])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  async function createTask(data: Partial<Task>) {
    const { data: created, error } = await supabase.from('tasks').insert(data).select().single()
    if (error) { toast.error('Erro ao criar tarefa'); return null }
    setTasks(prev => [created, ...prev])
    toast.success('Tarefa criada!')
    return created
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const payload: Partial<Task> = { ...data, updated_at: new Date().toISOString() }
    if (data.status === 'completed') payload.completed_at = new Date().toISOString()
    const { data: updated, error } = await supabase.from('tasks').update(payload).eq('id', id).select().single()
    if (error) { toast.error('Erro ao atualizar tarefa'); return null }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
    return updated
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir tarefa'); return false }
    setTasks(prev => prev.filter(t => t.id !== id))
    toast.success('Tarefa removida!')
    return true
  }

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetch }
}
