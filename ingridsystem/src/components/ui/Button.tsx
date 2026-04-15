import { motion } from 'framer-motion'
import { cn } from './cn'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const variants = {
  primary:
    'btn-shimmer text-[#06090f] font-semibold ' +
    'shadow-[0_0_24px_rgba(232,168,124,0.28),0_2px_8px_rgba(0,0,0,0.3)] ' +
    'hover:shadow-[0_0_36px_rgba(232,168,124,0.4),0_2px_12px_rgba(0,0,0,0.35)]',
  secondary:
    'bg-[#7c6af7] hover:bg-[#6a58e4] text-white font-semibold ' +
    'shadow-[0_0_20px_rgba(124,106,247,0.25)] hover:shadow-[0_0_30px_rgba(124,106,247,0.38)]',
  ghost:
    'bg-transparent text-[#8a93a8] hover:text-[#f0ece4] ' +
    'border border-transparent hover:border-[rgba(26,37,64,0.8)] hover:bg-[rgba(255,255,255,0.04)]',
  danger:
    'bg-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.18)] text-[#f87171] ' +
    'border border-[rgba(248,113,113,0.28)] hover:border-[rgba(248,113,113,0.45)]',
  outline:
    'bg-transparent text-[#c8c0b4] hover:text-[#e8a87c] ' +
    'border border-[rgba(26,37,64,0.9)] hover:border-[rgba(232,168,124,0.4)] ' +
    'hover:bg-[rgba(232,168,124,0.04)]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[8px] gap-1.5 h-8',
  md: 'px-4 py-2.5 text-[13px] rounded-[10px] gap-2 h-9',
  lg: 'px-6 py-3 text-sm rounded-[11px] gap-2.5 h-11',
}

const primaryBg = {
  background: 'linear-gradient(135deg, #ebb98a 0%, #e8a87c 40%, #d4916a 100%)',
}

export function Button({
  children, variant = 'primary', size = 'md', onClick, disabled, loading,
  icon, iconRight, className, type = 'button', fullWidth
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={!(disabled || loading) ? { scale: 1.01 } : undefined}
      transition={{ duration: 0.13 }}
      style={variant === 'primary' ? primaryBg : undefined}
      className={cn(
        'relative inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="leading-none">{children}</span>
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </motion.button>
  )
}