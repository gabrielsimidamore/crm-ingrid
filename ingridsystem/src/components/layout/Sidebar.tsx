import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Film, Megaphone, CheckSquare,
  DollarSign, FileText, UsersRound, Share2, Bell,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'
import { cn } from '../ui/cn'
import { useNotifications } from '../../hooks/useNotifications'

const navGroups = [
  {
    key: 'main',
    label: 'Principal',
    items: [
      { path: '/',            label: 'Dashboard',     icon: LayoutDashboard },
      { path: '/clients',     label: 'Clientes',      icon: Users           },
      { path: '/content',     label: 'Conteúdo',      icon: Film            },
      { path: '/campaigns',   label: 'Campanhas',     icon: Megaphone       },
      { path: '/tasks',       label: 'Tarefas',       icon: CheckSquare     },
    ],
  },
  {
    key: 'finance',
    label: 'Financeiro',
    items: [
      { path: '/financial',   label: 'Financeiro',    icon: DollarSign      },
      { path: '/reports',     label: 'Relatórios',    icon: FileText        },
    ],
  },
  {
    key: 'team',
    label: 'Equipe',
    items: [
      { path: '/team',        label: 'Equipe',        icon: UsersRound      },
      { path: '/social',      label: 'Social Preview',icon: Share2, badge: 'BETA' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { unreadCount } = useNotifications()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #07091a 0%, #060912 100%)',
        borderRight: '1px solid rgba(22, 32, 58, 0.7)',
      }}
    >
      {/* Ambient glow at top */}
      <div
        className="absolute top-0 left-0 right-0 h-56 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -30%, rgba(232,168,124,0.07) 0%, transparent 65%)' }}
      />

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center h-[72px] px-5 flex-shrink-0 relative">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Icon mark */}
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #e8a87c 0%, #c4845a 100%)',
              boxShadow: '0 0 24px rgba(232,168,124,0.35), 0 2px 10px rgba(0,0,0,0.4)',
            }}
          >
            <Sparkles className="w-4 h-4 text-[#06090f]" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="min-w-0 select-none"
              >
                <div
                  className="text-[22px] font-light leading-none tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#f0ece4' }}
                >
                  Ingrid
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-semibold mt-[3px]"
                  style={{ color: '#e8a87c', opacity: 0.75 }}>
                  Studio · CRM
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top separator */}
      <div className="mx-4 h-px flex-shrink-0"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(26,37,64,0.6), transparent)' }} />

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5">
        {navGroups.map((group, groupIdx) => (
          <div key={group.key} className={cn(groupIdx > 0 && 'mt-3')}>
            {/* Group label */}
            {!collapsed ? (
              <div className="flex items-center gap-2 px-5 mb-1 mt-1">
                <div className="h-px flex-1" style={{ background: 'rgba(26,37,64,0.45)' }} />
                <span className="text-[9px] uppercase tracking-[0.16em] font-semibold whitespace-nowrap select-none"
                  style={{ color: 'rgba(74,85,104,0.7)' }}>
                  {group.label}
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(26,37,64,0.45)' }} />
              </div>
            ) : groupIdx > 0 ? (
              <div className="mx-auto w-5 h-px mb-2" style={{ background: 'rgba(26,37,64,0.5)' }} />
            ) : null}

            {/* Items */}
            <div className="space-y-px">
              {group.items.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <NavItem
                    key={item.path}
                    path={item.path}
                    label={item.label}
                    icon={item.icon}
                    badge={(item as any).badge}
                    collapsed={collapsed}
                    isActive={isActive}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Notifications ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 pb-4">
        <div className="mx-4 h-px mb-3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(26,37,64,0.5), transparent)' }} />
        <NavLink
          to="/notifications"
          className={({ isActive }) => cn(
            'relative flex items-center transition-all duration-150',
            collapsed ? 'justify-center py-2.5 px-4' : 'gap-3.5 px-5 py-2.5',
            isActive
              ? 'text-[#e8a87c]'
              : 'text-[#4a5568] hover:text-[#c8c0b4] hover:bg-[rgba(255,255,255,0.015)]'
          )}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="nav-active-bar"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <div className="relative flex-shrink-0">
                <Bell style={{ width: '16px', height: '16px' }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                    style={{ background: '#e8a87c', color: '#060912' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-[13px] font-medium"
                  >
                    Notificações
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </NavLink>
      </div>

      {/* ── Collapse toggle ──────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute -right-3 top-[80px] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 z-10"
        style={{
          background: '#0a0f1e',
          border: '1px solid rgba(26,37,64,0.9)',
          color: '#4a5568',
          boxShadow: '2px 0 12px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e8a87c'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,168,124,0.3)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4a5568'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,37,64,0.9)'; }}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft  className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}

interface NavItemProps {
  path: string
  label: string
  icon: React.ElementType
  collapsed: boolean
  isActive: boolean
  badge?: string
}

function NavItem({ path, label, icon: Icon, collapsed, isActive, badge }: NavItemProps) {
  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex items-center transition-all duration-150 group w-full',
        collapsed ? 'justify-center py-2.5 px-4' : 'gap-3.5 px-5 py-2.5',
        isActive
          ? 'text-[#e8a87c]'
          : 'text-[#4a5568] hover:text-[#c8c0b4] hover:bg-[rgba(255,255,255,0.015)]'
      )}
    >
      {/* Active left bar */}
      {isActive && (
        <motion.div
          layoutId="activeBar"
          className="nav-active-bar"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      <Icon
        className="relative flex-shrink-0 transition-transform duration-150 group-hover:scale-[1.08]"
        style={{ width: '16px', height: '16px' }}
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="text-[13px] font-medium flex-1 min-w-0 leading-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {!collapsed && badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: 'rgba(124,106,247,0.12)',
            color: '#7c6af7',
            border: '1px solid rgba(124,106,247,0.22)',
          }}>
          {badge}
        </span>
      )}
    </NavLink>
  )
}