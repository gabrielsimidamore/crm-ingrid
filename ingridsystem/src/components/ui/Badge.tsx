import { cn } from './cn'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'violet' | 'rose'
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

const variants = {
  default: 'text-[#8a93a8] bg-[rgba(138,147,168,0.12)] border-[rgba(138,147,168,0.25)]',
  success: 'text-[#4ade80] bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.25)]',
  warning: 'text-[#fbbf24] bg-[rgba(251,191,36,0.12)] border-[rgba(251,191,36,0.25)]',
  error: 'text-[#f87171] bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.25)]',
  info: 'text-[#60a5fa] bg-[rgba(96,165,250,0.12)] border-[rgba(96,165,250,0.25)]',
  violet: 'text-[#7c6af7] bg-[rgba(124,106,247,0.12)] border-[rgba(124,106,247,0.25)]',
  rose: 'text-[#e8a87c] bg-[rgba(232,168,124,0.12)] border-[rgba(232,168,124,0.25)]',
}

const dotColors = {
  default: 'bg-[#8a93a8]',
  success: 'bg-[#4ade80]',
  warning: 'bg-[#fbbf24]',
  error: 'bg-[#f87171]',
  info: 'bg-[#60a5fa]',
  violet: 'bg-[#7c6af7]',
  rose: 'bg-[#e8a87c]',
}

export function Badge({ children, variant = 'default', size = 'sm', className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 border rounded-full font-semibold uppercase tracking-wider',
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
      variants[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full pulse-dot flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  )
}

export function ContentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    raw_uploaded: { label: 'Bruto Enviado', variant: 'warning' },
    approved_raw: { label: 'Bruto Aprovado', variant: 'info' },
    edited_uploaded: { label: 'Editado Enviado', variant: 'violet' },
    approved: { label: 'Aprovado', variant: 'success' },
    scheduled: { label: 'Agendado', variant: 'rose' },
    posted: { label: 'Postado', variant: 'default' },
  }
  const info = map[status] || { label: status, variant: 'default' as const }
  return <Badge variant={info.variant} dot>{info.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    urgent: { label: 'Urgente', variant: 'error' },
    high: { label: 'Alta', variant: 'warning' },
    medium: { label: 'Média', variant: 'info' },
    low: { label: 'Baixa', variant: 'default' },
  }
  const info = map[priority] || { label: priority, variant: 'default' as const }
  return <Badge variant={info.variant}>{info.label}</Badge>
}

export function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pendente', variant: 'warning' },
    in_progress: { label: 'Em Andamento', variant: 'info' },
    completed: { label: 'Concluído', variant: 'success' },
    cancelled: { label: 'Cancelado', variant: 'default' },
  }
  const info = map[status] || { label: status, variant: 'default' as const }
  return <Badge variant={info.variant} dot>{info.label}</Badge>
}

export function FinancialStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pendente', variant: 'warning' },
    paid: { label: 'Pago', variant: 'success' },
    overdue: { label: 'Vencido', variant: 'error' },
    cancelled: { label: 'Cancelado', variant: 'default' },
  }
  const info = map[status] || { label: status, variant: 'default' as const }
  return <Badge variant={info.variant} dot>{info.label}</Badge>
}

export function ClientStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'default' },
    paused: { label: 'Pausado', variant: 'warning' },
  }
  const info = map[status] || { label: status, variant: 'default' as const }
  return <Badge variant={info.variant} dot>{info.label}</Badge>
}
