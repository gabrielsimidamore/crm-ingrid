import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../hooks/useNotifications'
import { Bell, Check, CheckCheck, Film, CheckSquare, Calendar, DollarSign, Users, X } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../components/ui/Button'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  content_uploaded: { icon: Film, color: '#7c6af7', label: 'Conteúdo' },
  content_approved: { icon: Film, color: '#4ade80', label: 'Conteúdo' },
  task_completed: { icon: CheckSquare, color: '#4ade80', label: 'Tarefa' },
  task_assigned: { icon: CheckSquare, color: '#60a5fa', label: 'Tarefa' },
  meeting_scheduled: { icon: Calendar, color: '#e8a87c', label: 'Reunião' },
  payment_received: { icon: DollarSign, color: '#4ade80', label: 'Financeiro' },
  payment_overdue: { icon: DollarSign, color: '#f87171', label: 'Financeiro' },
  client_added: { icon: Users, color: '#7c6af7', label: 'Cliente' },
  default: { icon: Bell, color: '#8a93a8', label: 'Sistema' },
}

export default function Notifications() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications()

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#f0ece4]">Notificações</h2>
          {unreadCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-[#060912]"
              style={{ background: '#e8a87c' }}>
              {unreadCount} novas
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllAsRead} icon={<CheckCheck className="w-4 h-4" />} size="sm">
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-3">Não lidas</p>
          <div className="space-y-2">
            <AnimatePresence>
              {unread.map(n => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.default
                const Icon = config.icon
                return (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
                    style={{
                      background: `${config.color}08`,
                      borderColor: `${config.color}20`,
                      borderLeftWidth: '3px',
                      borderLeftColor: config.color
                    }}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#f0ece4]">{n.title}</p>
                          {n.message && <p className="text-xs text-[#8a93a8] mt-0.5">{n.message}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-[#4a5568]">
                            {formatDistanceToNow(new Date(n.created_at), { locale: ptBR, addSuffix: true })}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); markAsRead(n.id) }}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#8a93a8] hover:text-[#4ade80] opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 inline-block"
                        style={{ color: config.color }}>{config.label}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-3">Anteriores</p>
          <div className="space-y-2 opacity-60">
            {read.slice(0, 20).map(n => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.default
              const Icon = config.icon
              return (
                <div key={n.id}
                  className="flex items-start gap-3 p-4 rounded-xl border border-[#1a2540] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2540' }}>
                    <Icon className="w-4 h-4 text-[#8a93a8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-[#c8c0b4]">{n.title}</p>
                        {n.message && <p className="text-xs text-[#4a5568] mt-0.5">{n.message}</p>}
                      </div>
                      <span className="text-[10px] text-[#4a5568] flex-shrink-0">
                        {formatDistanceToNow(new Date(n.created_at), { locale: ptBR, addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {notifications.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(232,168,124,0.08)', border: '1px solid rgba(232,168,124,0.15)' }}>
            <Bell className="w-7 h-7 text-[#e8a87c]" />
          </div>
          <p className="text-[#8a93a8] font-medium">Nenhuma notificação</p>
          <p className="text-sm text-[#4a5568] mt-1">Você está em dia com tudo!</p>
        </div>
      )}
    </div>
  )
}
