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
  primary: 'bg-[#e8a87c] hover:bg-[#d4916a] text-[#060912] font-semibold shadow-[0_0_20px_rgba(232,168,124,0.3)] hover:shadow-[0_0_30px_rgba(232,168,124,0.4)]',
  secondary: 'bg-[#7c6af7] hover:bg-[#6a58e4] text-white font-semibold shadow-[0_0_20px_rgba(124,106,247,0.3)]',
  ghost: 'bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-[#8a93a8] hover:text-[#f0ece4] border border-transparent hover:border-[#1a2540]',
  danger: 'bg-[rgba(248,113,113,0.15)] hover:bg-[rgba(248,113,113,0.25)] text-[#f87171] border border-[rgba(248,113,113,0.3)]',
  outline: 'bg-transparent border border-[#1a2540] hover:border-[#e8a87c] text-[#f0ece4] hover:text-[#e8a87c]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-[10px] gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
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
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
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
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </motion.button>
  )
}
