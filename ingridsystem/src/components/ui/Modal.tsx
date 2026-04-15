import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  subtitle?: string
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md', subtitle }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'rgba(3,5,12,0.78)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
            style={{
              background: 'linear-gradient(160deg, #0d1424 0%, #090e1c 100%)',
              border: '1px solid rgba(26,37,64,0.8)',
              borderRadius: '18px',
              boxShadow: '0 32px 96px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.02) inset',
            }}
          >
            {/* Corner accent — top left */}
            <div
              className="absolute top-0 left-0 w-10 h-10 pointer-events-none rounded-tl-[18px] overflow-hidden"
              style={{ borderTop: '1px solid rgba(232,168,124,0.18)', borderLeft: '1px solid rgba(232,168,124,0.18)' }}
            />
            {/* Corner accent — bottom right */}
            <div
              className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none rounded-br-[18px] overflow-hidden"
              style={{ borderBottom: '1px solid rgba(232,168,124,0.08)', borderRight: '1px solid rgba(232,168,124,0.08)' }}
            />

            {/* Ambient top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-24 pointer-events-none rounded-t-[18px]"
              style={{ background: 'radial-gradient(ellipse at 50% -40%, rgba(232,168,124,0.06) 0%, transparent 65%)' }}
            />

            {/* Header */}
            {(title || subtitle) && (
              <div
                className="flex items-start justify-between px-7 pt-6 pb-4 flex-shrink-0 relative"
                style={{ borderBottom: '1px solid rgba(26,37,64,0.6)' }}
              >
                <div className="pr-4 min-w-0">
                  {title && (
                    <h2
                      className="leading-tight tracking-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontWeight: 500,
                        fontSize: '22px',
                        color: '#f0ece4',
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-[12px] mt-1" style={{ color: '#4a5568' }}>
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex-shrink-0 flex items-center justify-center rounded-[9px] transition-all duration-200 mt-0.5"
                  style={{ width: '32px', height: '32px', color: '#4a5568', border: '1px solid rgba(26,37,64,0.5)', background: 'transparent' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = '#f0ece4'
                    el.style.background = 'rgba(255,255,255,0.05)'
                    el.style.borderColor = 'rgba(26,37,64,0.9)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = '#4a5568'
                    el.style.background = 'transparent'
                    el.style.borderColor = 'rgba(26,37,64,0.5)'
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* No-title close button */}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute top-5 right-5 flex items-center justify-center rounded-[9px] transition-all duration-200 z-10"
                style={{ width: '32px', height: '32px', color: '#4a5568', border: '1px solid rgba(26,37,64,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ece4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#4a5568' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-7 py-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}