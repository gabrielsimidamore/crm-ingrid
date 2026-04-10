import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Film, Megaphone, CheckSquare,
  DollarSign, FileText, UsersRound, Share2, Bell, ChevronLeft, ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '../ui/cn'
import { useNotifications } from '../../hooks/useNotifications'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { path: '/clients', label: 'Clientes', icon: Users, group: 'main' },
  { path: '/content', label: 'Conteúdo', icon: Film, group: 'main' },
  { path: '/campaigns', label: 'Campanhas', icon: Megaphone, group: 'main' },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare, group: 'main' },
  { path: '/financial', label: 'Financeiro', icon: DollarSign, group: 'finance' },
  { path: '/reports', label: 'Relatórios', icon: FileText, group: 'finance' },
  { path: '/team', label: 'Equipe', icon: UsersRound, group: 'team' },
  { path: '/social', label: 'Social Preview', icon: Share2, group: 'team', badge: 'BETA' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { unreadCount } = useNotifications()

  const groups = {
    main: navItems.filter(i => i.group === 'main'),
    finance: navItems.filter(i => i.group === 'finance'),
    team: navItems.filter(i => i.group === 'team'),
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full bg-[#0a0f1e] border-r border-[#1a2540] overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#1a2540] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #e8a87c, #c4845a)', boxShadow: '0 0 20px rgba(232,168,124,0.3)' }}>
            <Sparkles className="w-4 h-4 text-[#060912]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <div className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#f0ece4] leading-none">
                  Ingrid
                </div>
                <div className="text-[10px] text-[#8a93a8] uppercase tracking-wider font-semibold">
                  Studio CRM
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            {!collapsed && (
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                className="text-[10px] text-[#4a5568] uppercase tracking-widest font-semibold px-3 mb-2"
              >
                {group === 'main' ? 'Principal' : group === 'finance' ? 'Financeiro' : 'Equipe'}
              </motion.div>
            )}
            <div className="space-y-0.5">
              {items.map(item => (
                <NavItem
                  key={item.path}
                  {...item}
                  collapsed={collapsed}
                  isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Notifications link */}
      <div className="flex-shrink-0 p-2 border-t border-[#1a2540]">
        <NavLink
          to="/notifications"
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
            isActive
              ? 'bg-[rgba(232,168,124,0.12)] text-[#e8a87c]'
              : 'text-[#8a93a8] hover:text-[#f0ece4] hover:bg-[rgba(255,255,255,0.04)]'
          )}
        >
          <div className="relative flex-shrink-0">
            <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e8a87c] text-[#060912] rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Notificações
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-[#1a2540] border border-[#243050] rounded-full flex items-center justify-center text-[#8a93a8] hover:text-[#f0ece4] hover:bg-[#243050] transition-colors z-10 shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}

function NavItem({
  path, label, icon: Icon, collapsed, isActive, badge
}: {
  path: string; label: string; icon: React.ElementType; collapsed: boolean; isActive: boolean; badge?: string
}) {
  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        isActive
          ? 'bg-[rgba(232,168,124,0.12)] text-[#e8a87c] shadow-[0_0_20px_rgba(232,168,124,0.08)]'
          : 'text-[#8a93a8] hover:text-[#f0ece4] hover:bg-[rgba(255,255,255,0.04)]'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-xl bg-[rgba(232,168,124,0.08)] border border-[rgba(232,168,124,0.15)]"
          transition={{ duration: 0.25 }}
        />
      )}
      <Icon
        className="relative z-10 flex-shrink-0"
        style={{ width: '18px', height: '18px' }}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 text-sm font-medium flex-1 min-w-0"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && badge && (
        <span className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(124,106,247,0.2)] text-[#7c6af7] border border-[rgba(124,106,247,0.3)] flex-shrink-0">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
