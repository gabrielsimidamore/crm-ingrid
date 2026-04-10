import { motion } from 'framer-motion'
import { Search, Bell, Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral do seu negócio' },
  '/clients': { title: 'Clientes', subtitle: 'Gerencie sua base de clientes' },
  '/content': { title: 'Conteúdo', subtitle: 'Gestão e aprovação de conteúdo' },
  '/campaigns': { title: 'Campanhas', subtitle: 'Meta Ads & Google Ads' },
  '/tasks': { title: 'Tarefas', subtitle: 'Controle de atividades da equipe' },
  '/financial': { title: 'Financeiro', subtitle: 'Controle financeiro por cliente' },
  '/reports': { title: 'Relatórios', subtitle: 'Relatórios e análises exportáveis' },
  '/team': { title: 'Equipe & Parcerias', subtitle: 'Colaboradores e parceiros' },
  '/social': { title: 'Social Preview', subtitle: 'Central de comunicação (em breve)' },
  '/notifications': { title: 'Notificações', subtitle: 'Central de alertas e atualizações' },
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const [search, setSearch] = useState('')

  const page = pageTitles[location.pathname] || { title: 'Ingrid CRM', subtitle: '' }
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-16 border-b border-[#1a2540] flex items-center justify-between px-6 flex-shrink-0 bg-[#060912]/80 backdrop-blur-md sticky top-0 z-20"
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-[#f0ece4] font-['Cormorant_Garamond'] leading-none capitalize">
          {page.title}
        </h1>
        <p className="text-xs text-[#8a93a8] mt-0.5">{today}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-52 h-8 bg-[rgba(255,255,255,0.04)] border border-[#1a2540] rounded-lg pl-9 pr-3 text-sm text-[#f0ece4] placeholder-[#4a5568] focus:outline-none focus:border-[rgba(232,168,124,0.4)] transition-colors"
          />
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#8a93a8] hover:text-[#f0ece4] hover:bg-[rgba(255,255,255,0.06)] border border-transparent hover:border-[#1a2540] transition-all"
        >
          <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e8a87c] rounded-full pulse-dot" />
          )}
        </button>

        {/* Quick add */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-[#060912] transition-all"
          style={{ background: 'linear-gradient(135deg, #e8a87c, #c4845a)', boxShadow: '0 0 20px rgba(232,168,124,0.25)' }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo</span>
        </motion.button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, rgba(232,168,124,0.2), rgba(232,168,124,0.1))', border: '1px solid rgba(232,168,124,0.3)', color: '#e8a87c' }}>
          IG
        </div>
      </div>
    </motion.header>
  )
}
