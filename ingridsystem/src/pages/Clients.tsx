import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClients } from '../hooks/useClients'
import type { Client } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import { ClientStatusBadge } from '../components/ui/Badge'
import {
  Plus, Search, Users, AtSign, Phone, Mail, DollarSign,
  Megaphone, Edit2, Trash2, ExternalLink, Camera, FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SERVICE_TYPES = [
  { value: 'stories', label: 'Stories' },
  { value: 'feed', label: 'Feed' },
  { value: 'reels', label: 'Reels' },
  { value: 'social_media', label: 'Social Media' },
]

const CLIENT_COLORS = ['#e8a87c', '#7c6af7', '#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#ec4899', '#14b8a6']

function ClientForm({ initial, onSubmit, loading }: {
  initial?: Partial<Client>
  onSubmit: (data: Partial<Client>) => void
  loading?: boolean
}) {
  const [form, setForm] = useState<Partial<Client>>(initial || { status: 'active', color: '#e8a87c', service_types: [], monthly_value: 0, ads_budget: 0 })
  const [services, setServices] = useState<string[]>(initial?.service_types || [])

  const toggle = (s: string) => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, service_types: services })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Nome do cliente" />
        <Input label="Empresa" value={form.company || ''} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Nome da empresa" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" icon={<Mail className="w-4 h-4" />} />
        <Input label="Telefone" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" icon={<Phone className="w-4 h-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Instagram" value={form.instagram || ''} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@perfil" icon={<AtSign className="w-4 h-4" />} />
        <Select label="Status" value={form.status || 'active'} onChange={e => setForm(p => ({ ...p, status: e.target.value as Client['status'] }))}
          options={[{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }, { value: 'paused', label: 'Pausado' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Valor Mensal (R$)" type="number" value={form.monthly_value || ''} onChange={e => setForm(p => ({ ...p, monthly_value: Number(e.target.value) }))} placeholder="0,00" icon={<DollarSign className="w-4 h-4" />} />
        <Input label="Budget Ads (R$)" type="number" value={form.ads_budget || ''} onChange={e => setForm(p => ({ ...p, ads_budget: Number(e.target.value) }))} placeholder="0,00" icon={<Megaphone className="w-4 h-4" />} />
      </div>

      {/* Avatar URL */}
      <Input label="Foto / Logo (URL)" value={form.avatar_url || ''} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))}
        placeholder="https://..." icon={<Camera className="w-4 h-4" />} />

      {/* Service types */}
      <div>
        <label className="block text-sm font-medium text-[#c8c0b4] mb-2">Serviços</label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_TYPES.map(s => (
            <button key={s.value} type="button" onClick={() => toggle(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                services.includes(s.value)
                  ? 'bg-[rgba(232,168,124,0.15)] text-[#e8a87c] border-[rgba(232,168,124,0.4)]'
                  : 'bg-transparent text-[#8a93a8] border-[#1a2540] hover:border-[#243050]'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-[#c8c0b4] mb-2">Cor do cliente</label>
        <div className="flex gap-2">
          {CLIENT_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d1424] scale-110' : ''}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      <Textarea label="Observações / Descrição" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Descrição do cliente, contexto do trabalho, observações importantes..." />

      <Button type="submit" loading={loading} fullWidth>
        {initial?.id ? 'Salvar alterações' : 'Criar cliente'}
      </Button>
    </form>
  )
}

function ClientDetailModal({ client, onEdit, onClose }: { client: Client; onEdit: () => void; onClose: () => void }) {
  return (
    <div className="space-y-5">
      {/* Avatar / hero */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${client.color}20, ${client.color}08)`, border: `1px solid ${client.color}30` }}>
        <div className="p-6 flex items-center gap-5">
          {client.avatar_url ? (
            <img src={client.avatar_url} alt={client.name}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-lg"
              style={{ border: `2px solid ${client.color}40` }} />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-[#060912] flex-shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${client.color}, ${client.color}88)` }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#f0ece4] leading-tight">{client.name}</h2>
            {client.company && <p className="text-sm text-[#8a93a8] mt-0.5">{client.company}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ClientStatusBadge status={client.status} />
              {client.service_types?.map(s => (
                <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: `${client.color}18`, color: client.color, border: `1px solid ${client.color}35` }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-3">
        {client.instagram && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-[#1a2540] bg-[rgba(124,106,247,0.04)]">
            <AtSign className="w-4 h-4 text-[#7c6af7] flex-shrink-0" />
            <span className="text-sm text-[#c8c0b4] truncate">{client.instagram}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-[#1a2540] bg-[rgba(74,222,128,0.04)]">
            <Phone className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
            <span className="text-sm text-[#c8c0b4]">{client.phone}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-[#1a2540] bg-[rgba(96,165,250,0.04)] col-span-2">
            <Mail className="w-4 h-4 text-[#60a5fa] flex-shrink-0" />
            <span className="text-sm text-[#c8c0b4] truncate">{client.email}</span>
            <a href={`mailto:${client.email}`} className="ml-auto text-[#60a5fa] hover:text-[#93c5fd]">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-[#1a2540]" style={{ background: 'rgba(232,168,124,0.05)' }}>
          <div className="text-xs text-[#8a93a8] mb-1">Mensalidade</div>
          <div className="text-xl font-bold text-[#e8a87c] tabular-nums">
            R$ {Number(client.monthly_value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#1a2540]" style={{ background: 'rgba(124,106,247,0.05)' }}>
          <div className="text-xs text-[#8a93a8] mb-1">Budget Ads</div>
          <div className="text-xl font-bold text-[#7c6af7] tabular-nums">
            R$ {Number(client.ads_budget).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Notes / Description */}
      {client.notes && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#8a93a8]" />
            <p className="text-xs text-[#8a93a8] uppercase tracking-wider font-semibold">Observações</p>
          </div>
          <p className="text-sm text-[#c8c0b4] leading-relaxed bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[#1a2540]">
            {client.notes}
          </p>
        </div>
      )}

      {/* Contract dates */}
      {(client.contract_start || client.contract_end) && (
        <div className="flex gap-4 text-sm text-[#8a93a8]">
          {client.contract_start && (
            <span>Início: <strong className="text-[#f0ece4]">{format(new Date(client.contract_start), 'dd/MM/yyyy', { locale: ptBR })}</strong></span>
          )}
          {client.contract_end && (
            <span>Fim: <strong className="text-[#f0ece4]">{format(new Date(client.contract_end), 'dd/MM/yyyy', { locale: ptBR })}</strong></span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[#1a2540]">
        <Button onClick={onEdit} icon={<Edit2 className="w-4 h-4" />} fullWidth>
          Editar Cliente
        </Button>
      </div>
    </div>
  )
}

function ClientCard({ client, onClick, onEdit, onDelete }: {
  client: Client
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 shine group hover:border-[rgba(232,168,124,0.2)] hover:shadow-[0_0_40px_rgba(232,168,124,0.06)] transition-all duration-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {client.avatar_url ? (
            <img src={client.avatar_url} alt={client.name}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
              style={{ border: `1px solid ${client.color}40` }} />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[#060912] font-bold text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${client.color}, ${client.color}88)` }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-[#f0ece4] text-sm leading-tight truncate">{client.name}</h3>
            {client.company && <p className="text-xs text-[#8a93a8] truncate">{client.company}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={e => { e.stopPropagation(); onEdit() }} aria-label={`Editar ${client.name}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} aria-label={`Remover ${client.name}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <ClientStatusBadge status={client.status} />
      </div>

      {/* Services */}
      {client.service_types?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {client.service_types.map(s => (
            <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `${client.color}18`, color: client.color, border: `1px solid ${client.color}35` }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Contact */}
      <div className="space-y-1.5 mb-4">
        {client.instagram && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <AtSign className="w-3.5 h-3.5 text-[#7c6af7]" />
            {client.instagram}
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <Phone className="w-3.5 h-3.5 text-[#4ade80]" />
            {client.phone}
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <Mail className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
      </div>

      {/* Notes preview */}
      {client.notes && (
        <p className="text-xs text-[#4a5568] line-clamp-2 mb-3 leading-relaxed">{client.notes}</p>
      )}

      {/* Financials */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1a2540] to-transparent mb-3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(232,168,124,0.06)' }}>
          <div className="text-sm font-bold text-[#e8a87c] tabular-nums">R$ {Number(client.monthly_value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-[#8a93a8] mt-0.5">Mensalidade</div>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(124,106,247,0.06)' }}>
          <div className="text-sm font-bold text-[#7c6af7] tabular-nums">R$ {Number(client.ads_budget).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-[#8a93a8] mt-0.5">Budget Ads</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | null>(null)
  const [selected, setSelected] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  async function handleCreate(data: Partial<Client>) {
    setSaving(true)
    await createClient(data)
    setSaving(false)
    setModal(null)
  }

  async function handleEdit(data: Partial<Client>) {
    if (!selected) return
    setSaving(true)
    await updateClient(selected.id, data)
    setSaving(false)
    setModal(null)
    setSelected(null)
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Remover ${client.name}?`)) return
    await deleteClient(client.id)
  }

  const totalRevenue = clients.filter(c => c.status === 'active').reduce((acc, c) => acc + Number(c.monthly_value), 0)
  const totalAds = clients.filter(c => c.status === 'active').reduce((acc, c) => acc + Number(c.ads_budget), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..."
              className="input-base pl-10 w-56 h-9 text-sm" />
          </div>
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Ativos' },
              { value: 'inactive', label: 'Inativos' },
            ].map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f.value
                    ? 'bg-[rgba(232,168,124,0.15)] text-[#e8a87c] border border-[rgba(232,168,124,0.3)]'
                    : 'text-[#8a93a8] hover:text-[#f0ece4] border border-transparent hover:border-[#1a2540]'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setModal('create')} icon={<Plus className="w-4 h-4" />}>
          Novo Cliente
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Clientes', value: clients.length, sub: `${clients.filter(c => c.status === 'active').length} ativos`, color: '#e8a87c' },
          { label: 'Receita Mensal', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, sub: 'Clientes ativos', color: '#4ade80' },
          { label: 'Budget Total Ads', value: `R$ ${totalAds.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, sub: 'Clientes ativos', color: '#7c6af7' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#0d1424] border border-[#1a2540] rounded-xl p-4 flex items-center gap-3">
            <div>
              <div className="text-xl font-bold font-['Plus_Jakarta_Sans']" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#8a93a8] font-medium">{s.label}</div>
              <div className="text-xs text-[#4a5568]">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map(client => (
              <ClientCard key={client.id} client={client}
                onClick={() => { setSelected(client); setModal('detail') }}
                onEdit={() => { setSelected(client); setModal('edit') }}
                onDelete={() => handleDelete(client)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-[#1a2540] mx-auto mb-3" />
          <p className="text-[#8a93a8] font-medium">Nenhum cliente encontrado</p>
          <p className="text-sm text-[#4a5568] mt-1">Tente ajustar os filtros ou crie um novo cliente</p>
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Novo Cliente" size="lg">
        <ClientForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Cliente" size="lg">
        {selected && <ClientForm initial={selected} onSubmit={handleEdit} loading={saving} />}
      </Modal>

      <Modal open={modal === 'detail'} onClose={() => { setModal(null); setSelected(null) }}
        title="" size="lg">
        {selected && (
          <ClientDetailModal
            client={selected}
            onEdit={() => setModal('edit')}
            onClose={() => { setModal(null); setSelected(null) }}
          />
        )}
      </Modal>
    </div>
  )
}