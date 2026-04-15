import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from './cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  iconRight?: ReactNode
  helper?: string
}

export function Input({ label, error, icon, iconRight, helper, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'rgba(138,147,168,0.75)' }}>
            {label}
          </span>
          {props.required && <span className="text-[#f87171] ml-1 text-[11px]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(138,147,168,0.6)' }}>
            {icon}
          </div>
        )}
        <input
          {...props}
          className={cn(
            'input-base',
            icon     && 'pl-10',
            iconRight && 'pr-10',
            error    && '!border-[rgba(248,113,113,0.45)] !shadow-[0_0_0_3px_rgba(248,113,113,0.07)]',
            className
          )}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(138,147,168,0.6)' }}>
            {iconRight}
          </div>
        )}
      </div>
      {error  && <p className="text-[11px] mt-1.5" style={{ color: '#f87171' }}>{error}</p>}
      {helper && !error && <p className="text-[11px] mt-1.5" style={{ color: 'rgba(138,147,168,0.6)' }}>{helper}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export function Textarea({ label, error, helper, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'rgba(138,147,168,0.75)' }}>
            {label}
          </span>
          {props.required && <span className="text-[#f87171] ml-1 text-[11px]">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={cn(
          'input-base resize-none',
          error && '!border-[rgba(248,113,113,0.45)]',
          className
        )}
      />
      {error  && <p className="text-[11px] mt-1.5" style={{ color: '#f87171' }}>{error}</p>}
      {helper && !error && <p className="text-[11px] mt-1.5" style={{ color: 'rgba(138,147,168,0.6)' }}>{helper}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helper?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, helper, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'rgba(138,147,168,0.75)' }}>
            {label}
          </span>
          {props.required && <span className="text-[#f87171] ml-1 text-[11px]">*</span>}
        </label>
      )}
      <select
        {...props}
        className={cn(
          'input-base appearance-none cursor-pointer',
          error && '!border-[rgba(248,113,113,0.45)]',
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#0d1424' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error  && <p className="text-[11px] mt-1.5" style={{ color: '#f87171' }}>{error}</p>}
      {helper && !error && <p className="text-[11px] mt-1.5" style={{ color: 'rgba(138,147,168,0.6)' }}>{helper}</p>}
    </div>
  )
}