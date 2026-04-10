import { motion } from 'framer-motion'
import { cn } from './cn'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'rose' | 'violet' | 'none'
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className, hover, glow = 'none', onClick, padding = 'md' }: CardProps) {
  const glowStyles = {
    rose: 'hover:shadow-[0_0_40px_rgba(232,168,124,0.1)] hover:border-[rgba(232,168,124,0.2)]',
    violet: 'hover:shadow-[0_0_40px_rgba(124,106,247,0.1)] hover:border-[rgba(124,106,247,0.2)]',
    none: '',
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-[#0d1424] border border-[#1a2540] rounded-2xl transition-all duration-300',
        paddings[padding],
        hover && 'cursor-pointer',
        glow !== 'none' && glowStyles[glow],
        'shine',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({
  title, value, subtitle, icon, trend, color = 'rose', delay = 0
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: { value: number; positive: boolean }
  color?: 'rose' | 'violet' | 'blue' | 'green'
  delay?: number
}) {
  const colors = {
    rose: { bg: 'rgba(232,168,124,0.1)', border: 'rgba(232,168,124,0.2)', text: '#e8a87c', glow: 'rgba(232,168,124,0.15)' },
    violet: { bg: 'rgba(124,106,247,0.1)', border: 'rgba(124,106,247,0.2)', text: '#7c6af7', glow: 'rgba(124,106,247,0.15)' },
    blue: { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', text: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
    green: { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)', text: '#4ade80', glow: 'rgba(74,222,128,0.15)' },
  }
  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 shine group"
      style={{
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
      whileHover={{
        boxShadow: `0 0 40px ${c.glow}`,
        borderColor: c.border,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <span style={{ color: c.text }}>{icon}</span>
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend.positive
              ? 'text-[#4ade80] bg-[rgba(74,222,128,0.1)]'
              : 'text-[#f87171] bg-[rgba(248,113,113,0.1)]'
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-[#f0ece4] mb-1 font-['Plus_Jakarta_Sans']">
        {value}
      </div>
      <div className="text-sm font-medium text-[#8a93a8]">{title}</div>
      {subtitle && <div className="text-xs text-[#4a5568] mt-0.5">{subtitle}</div>}
    </motion.div>
  )
}
