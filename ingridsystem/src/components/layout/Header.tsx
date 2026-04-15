import { motion } from 'framer-motion'
import { Search, Bell, Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':              { title: 'Dashboard',         subtitle: 'Visão geral do seu negócio'           },
  '/clients':       { title: 'Clientes',           subtitle: 'Gerencie sua base de clientes'        },
  '/content':       { title: 'Conteúdo',           subtitle: 'Gestão e aprovação de conteúdo'       },
  '/campaigns':     { title: 'Campanhas',          subtitle: 'Meta Ads & Google Ads'                },
  '/tasks':         { title: 'Tarefas',            subtitle: 'Controle de atividades'               },
  '/financial':     { title: 'Financeiro',         subtitle: 'Controle financeiro por cliente'      },
  '/reports':       { title: 'Relatórios',         subtitle: 'Análises exportáveis'                 },
  '/team':          { title: 'Equipe & Parcerias', subtitle: 'Colaboradores e parceiros'            },
  '/social':        { title: 'Social Preview',     subtitle: 'Central de comunicação (em breve)'    },
  '/notifications': { title: 'Notificações',       subtitle: 'Central de alertas e atualizações'    },
}

export function Header() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { unreadCount } = useNotifications()
  const [search, setSearch] = useState('')

  const page  = pageTitles[location.pathname] || { title: 'Ingrid CRM', subtitle: '' }
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative flex items-center justify-between px-7 flex-shrink-0 z-20"
      style={{
        height: '72px',
        background: 'rgba(6, 9, 18, 0.92)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
      }}
    >
      {/* ── Page title ───────────────────────────────────────────────── */}
      <div className="flex items-baseline gap-4 min-w-0">
        <h1
          className="leading-none tracking-tight whitespace-nowrap select-none"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '28px',
            color: '#f0ece4',
          }}
        >
          {page.title}
        </h1>
        <span
          className="text-[11px] uppercase tracking-[0.12em] font-semibold hidden sm:block"
          style={{ color: 'rgba(74,85,104,0.65)' }}
        >
          {today}
        </span>
      </div>

      {/* ── Right actions ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: 'rgba(74,85,104,0.7)' }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 rounded-[10px] pl-9 pr-4 text-sm transition-all"
            style={{
              width: '200px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(26,37,64,0.7)',
              color: '#f0ece4',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              outline: 'none',
            }}
            onFocus={e => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(232,168,124,0.35)'
              ;(e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.04)'
            }}
            onBlur={e => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(26,37,64,0.7)'
              ;(e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.03)'
            }}
          />
        </div>

        {/* Notifications bell */}
        <button
          onClick={() => navigate('/notifications')}
          aria-label="Notificações"
          className="relative flex items-center justify-center rounded-[10px] transition-all duration-200"
          style={{
            width: '38px', height: '38px',
            color: '#4a5568',
            border: '1px solid rgba(26,37,64,0.5)',
            background: 'rgba(255,255,255,0.02)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = '#f0ece4'
            el.style.borderColor = 'rgba(26,37,64,0.8)'
            el.style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = '#4a5568'
            el.style.borderColor = 'rgba(26,37,64,0.5)'
            el.style.background = 'rgba(255,255,255,0.02)'
          }}
        >
          <Bell style={{ width: '16px', height: '16px' }} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot"
              style={{ background: '#e8a87c' }}
            />
          )}
        </button>

        {/* Quick add */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="btn-shimmer flex items-center gap-2 px-4 rounded-[10px] text-sm font-semibold select-none"
          style={{
            height: '38px',
            background: 'linear-gradient(135deg, #e8a87c 0%, #d4916a 100%)',
            color: '#06090f',
            boxShadow: '0 0 20px rgba(232,168,124,0.28), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo</span>
        </motion.button>

        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-[10px] text-sm font-bold cursor-pointer select-none flex-shrink-0 transition-all duration-200"
          style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, rgba(232,168,124,0.15), rgba(232,168,124,0.06))',
            border: '1px solid rgba(232,168,124,0.25)',
            color: '#e8a87c',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '15px',
            fontStyle: 'italic',
          }}
        >
          IG
        </div>
      </div>

      {/* Gradient bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(22,32,58,0.9) 25%, rgba(22,32,58,0.9) 75%, transparent 100%)' }}
      />
    </motion.header>
  )
}