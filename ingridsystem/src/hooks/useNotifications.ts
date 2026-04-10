import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Notification } from '../types'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const ADMIN_ID = '00000000-0000-0000-0000-000000000001'
  const targetId = userId || ADMIN_ID

  useEffect(() => {
    fetchNotifications()

    let channel: ReturnType<typeof supabase.channel> | null = null

    try {
      channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${targetId}`,
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime notifications unavailable, using polling only.')
          }
        })
    } catch (err) {
      console.warn('Realtime not available:', err)
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [targetId])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data || [])
    } catch (err) {
      console.warn('Could not fetch notifications:', err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', targetId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function createNotification(data: Omit<Notification, 'id' | 'created_at' | 'read'>) {
    await supabase.from('notifications').insert({ ...data, read: false })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, createNotification, refetch: fetchNotifications }
}
