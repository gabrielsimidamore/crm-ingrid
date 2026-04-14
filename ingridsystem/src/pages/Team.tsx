import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeam } from '../hooks/useTeam'
import type { TeamMember, Partnership } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import {
  Plus, Users, Handshake, Mail, Phone, AtSign,
  Edit2, Trash2, Link, DollarSign, Star, Briefcase, Crown
} from 'lucide-react'

const ROLE_MAP = {
  admin: { label: 'Administradora', color: '#e8a87c', icon: Crown },
  manager: { label: 'Gerente', color: '#7c6af7', icon: Star },
  collaborator: { label: 'Colaborador', color: '#60a5fa', icon: Users },
  freelancer: { label: 'Freelancer', color: '#4ade80', icon: Briefcase },
}

function MemberCard({ member, onEdit }: { member: TeamMember; onEdit: () => void }) {
  const role = ROLE_MAP[member.role] || ROLE_MAP.collaborator
  const RoleIcon = role.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 shine group hover:border-[rgba(232,168,124,0.2)] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-[#060912] flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}88)` }}>
            {member.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0ece4]">{member.name}</h3>
            {member.specialty && <p className="text-xs text-[#8a93a8]">{member.specialty}</p>}
          </div>
        </div>
        <button onClick={onEdit} aria-label="Editar membro" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors opacity-0 group-hover:opacity-100">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: `${role.color}15`, color: role.color, border: `1px solid ${role.color}30` }}>
          <RoleIcon className="w-3 h-3" /> {role.label}
        </div>
        <div className={`w-2 h-2 rounded-full pulse-dot ${member.status === 'active' ? 'bg-[#4ade80]' : 'bg-[#8a93a8]'}`} />
        <span className={`text-xs ${member.status === 'active' ? 'text-[#4ade80]' : 'text-[#8a93a8]'}`}>
          {member.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
          <Mail className="w-3.5 h-3.5 text-[#60a5fa]" />
          <span className="truncate">{member.email}</span>
        </div>
        {member.phone && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <Phone className="w-3.5 h-3.5 text-[#4ade80]" /> {member.phone}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function PartnerCard({ partner, onEdit, onDelete }: {
  partner: Partnership; onEdit: () => void; onDelete: () => void
}) {
  const paymentColors = { fixed: '#e8a87c', per_project: '#7c6af7', hourly: '#60a5fa' }
  const color = paymentColors[partner.payment_type as keyof typeof paymentColors] || '#8a93a8'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 shine group hover:border-[rgba(124,106,247,0.2)] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, #7c6af7, #5a49d4)` }}>
            {partner.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0ece4]">{partner.name}</h3>
            <p className="text-xs text-[#8a93a8] capitalize">{partner.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} aria-label="Editar parceiro" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} aria-label="Remover parceiro" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border`}
          style={{ color, background: `${color}15`, borderColor: `${color}30` }}>
          {partner.payment_type === 'fixed' ? 'Fixo' : partner.payment_type === 'per_project' ? 'Por Projeto' : 'Por Hora'}
        </span>
        <div className={`w-2 h-2 rounded-full ${partner.status === 'active' ? 'bg-[#4ade80]' : 'bg-[#8a93a8]'}`} />
      </div>

      <div className="space-y-1.5">
        {partner.email && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <Mail className="w-3.5 h-3.5 text-[#60a5fa]" /> <span className="truncate">{partner.email}</span>
          </div>
        )}
        {partner.phone && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <Phone className="w-3.5 h-3.5 text-[#4ade80]" /> {partner.phone}
          </div>
        )}
        {partner.instagram && (
          <div className="flex items-center gap-2 text-xs text-[#8a93a8]">
            <AtSign className="w-3.5 h-3.5 text-[#7c6af7]" /> {partner.instagram}
          </div>
        )}
        {partner.portfolio_url && (
          <a href={partner.portfolio_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-xs text-[#7c6af7] hover:underline">
            <Link className="w-3.5 h-3.5" /> Portfolio
          </a>
        )}
      </div>

      {partner.rate > 0 && (
        <div className="mt-3 pt-3 border-t border-[#1a2540]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-sm font-bold" style={{ color }}>
              R$ {Number(partner.rate).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-[#4a5568]">
              {partner.payment_type === 'hourly' ? '/hora' : partner.payment_type === 'per_project' ? '/projeto' : '/mês'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function MemberForm({ initial, onSubmit, loading }: {
  initial?: Partial<TeamMember>; onSubmit: (d: Partial<TeamMember>) => void; loading?: boolean
}) {
  const [form, setForm] = useState<Partial<TeamMember>>(initial || { role: 'collaborator', status: 'active' })
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form) }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        <Input label="Email" type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required icon={<Mail className="w-4 h-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Função" value={form.role || 'collaborator'} onChange={e => setForm(p => ({ ...p, role: e.target.value as TeamMember['role'] }))}
          options={[{ value: 'admin', label: 'Administradora' }, { value: 'manager', label: 'Gerente' }, { value: 'collaborator', label: 'Colaborador' }, { value: 'freelancer', label: 'Freelancer' }]} />
        <Select label="Status" value={form.status || 'active'} onChange={e => setForm(p => ({ ...p, status: e.target.value as TeamMember['status'] }))}
          options={[{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }]} />
      </div>
      <Input label="Especialidade" value={form.specialty || ''} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} placeholder="Ex: Gestor de Tráfego, Editor" />
      <Input label="Telefone" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} />
      <Button type="submit" loading={loading} fullWidth>{initial?.id ? 'Salvar' : 'Adicionar Membro'}</Button>
    </form>
  )
}

function PartnerForm({ initial, onSubmit, loading }: {
  initial?: Partial<Partnership>; onSubmit: (d: Partial<Partnership>) => void; loading?: boolean
}) {
  const [form, setForm] = useState<Partial<Partnership>>(initial || { payment_type: 'per_project', status: 'active', rate: 0 })
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form) }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        <Select label="Tipo" value={form.type || ''} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          placeholder="Selecionar"
          options={[{ value: 'photographer', label: 'Fotógrafo(a)' }, { value: 'videographer', label: 'Videomaker' }, { value: 'designer', label: 'Designer' }, { value: 'copywriter', label: 'Copywriter' }, { value: 'editor', label: 'Editor(a)' }, { value: 'other', label: 'Outro' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} icon={<Mail className="w-4 h-4" />} />
        <Input label="Telefone" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="AtSign" value={form.instagram || ''} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} icon={<AtSign className="w-4 h-4" />} />
        <Input label="Portfolio (URL)" value={form.portfolio_url || ''} onChange={e => setForm(p => ({ ...p, portfolio_url: e.target.value }))} icon={<Link className="w-4 h-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Pagamento" value={form.payment_type || 'per_project'} onChange={e => setForm(p => ({ ...p, payment_type: e.target.value as Partnership['payment_type'] }))}
          options={[{ value: 'fixed', label: 'Fixo Mensal' }, { value: 'per_project', label: 'Por Projeto' }, { value: 'hourly', label: 'Por Hora' }]} />
        <Input label="Valor (R$)" type="number" step="0.01" value={form.rate || ''} onChange={e => setForm(p => ({ ...p, rate: Number(e.target.value) }))} icon={<DollarSign className="w-4 h-4" />} />
      </div>
      <Textarea label="Observações" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      <Button type="submit" loading={loading} fullWidth>{initial?.id ? 'Salvar' : 'Adicionar Parceiro'}</Button>
    </form>
  )
}

export default function Team() {
  const { members, partnerships, createMember, updateMember, createPartnership, updatePartnership } = useTeam()
  const [tab, setTab] = useState<'team' | 'partners'>('team')
  const [modal, setModal] = useState<'member-create' | 'member-edit' | 'partner-create' | 'partner-edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  async function handleMemberCreate(data: Partial<TeamMember>) {
    setSaving(true); await createMember(data); setSaving(false); setModal(null)
  }
  async function handleMemberEdit(data: Partial<TeamMember>) {
    if (!selected) return
    setSaving(true); await updateMember(selected.id, data); setSaving(false); setModal(null); setSelected(null)
  }
  async function handlePartnerCreate(data: Partial<Partnership>) {
    setSaving(true); await createPartnership(data); setSaving(false); setModal(null)
  }
  async function handlePartnerEdit(data: Partial<Partnership>) {
    if (!selected) return
    setSaving(true); await updatePartnership(selected.id, data); setSaving(false); setModal(null); setSelected(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-[#0d1424] border border-[#1a2540] rounded-xl p-1">
          {[
            { key: 'team', label: 'Equipe', count: members.length, icon: Users },
            { key: 'partners', label: 'Parcerias', count: partnerships.length, icon: Handshake },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-[rgba(232,168,124,0.15)] text-[#e8a87c] border border-[rgba(232,168,124,0.3)]'
                  : 'text-[#8a93a8] hover:text-[#f0ece4]'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-[rgba(232,168,124,0.2)]' : 'bg-[rgba(255,255,255,0.06)]'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <Button
          onClick={() => setModal(tab === 'team' ? 'member-create' : 'partner-create')}
          icon={<Plus className="w-4 h-4" />}>
          {tab === 'team' ? 'Novo Membro' : 'Novo Parceiro'}
        </Button>
      </div>

      {/* Team */}
      {tab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {members.map(m => (
              <MemberCard key={m.id} member={m}
                onEdit={() => { setSelected(m); setModal('member-edit') }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Partners */}
      {tab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {partnerships.map(p => (
              <PartnerCard key={p.id} partner={p}
                onEdit={() => { setSelected(p); setModal('partner-edit') }}
                onDelete={() => { /* soft delete */ }}
              />
            ))}
          </AnimatePresence>
          {partnerships.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Handshake className="w-12 h-12 text-[#1a2540] mx-auto mb-3" />
              <p className="text-[#8a93a8] font-medium">Nenhuma parceria cadastrada</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modal === 'member-create'} onClose={() => setModal(null)} title="Novo Membro da Equipe" size="md">
        <MemberForm onSubmit={handleMemberCreate} loading={saving} />
      </Modal>
      <Modal open={modal === 'member-edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Membro" size="md">
        {selected && <MemberForm initial={selected} onSubmit={handleMemberEdit} loading={saving} />}
      </Modal>
      <Modal open={modal === 'partner-create'} onClose={() => setModal(null)} title="Novo Parceiro" subtitle="Fotógrafos, designers, editores..." size="lg">
        <PartnerForm onSubmit={handlePartnerCreate} loading={saving} />
      </Modal>
      <Modal open={modal === 'partner-edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Parceiro" size="lg">
        {selected && <PartnerForm initial={selected} onSubmit={handlePartnerEdit} loading={saving} />}
      </Modal>
    </div>
  )
}
