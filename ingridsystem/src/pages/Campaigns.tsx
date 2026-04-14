import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCampaigns } from '../hooks/useCampaigns'
import { useClients } from '../hooks/useClients'
import type { Campaign } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import {
  Plus, Search, Megaphone, TrendingUp, MousePointer,
  DollarSign, Target, Edit2, Trash2, Zap, Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function CampaignStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativa', color: '#4ade80' },
    paused: { label: 'Pausada', color: '#fbbf24' },
    ended: { label: 'Encerrada', color: '#8a93a8' },
    draft: { label: 'Rascunho', color: '#60a5fa' },
  }
  const info = map[status] || { label: status, color: '#8a93a8' }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
      style={{ color: info.color, background: `${info.color}18`, borderColor: `${info.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: info.color }} />
      {info.label}
    </span>
  )
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'meta') {
    return (
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #1877f2, #e1306c)', boxShadow: '0 0 15px rgba(24,119,242,0.3)' }}>
        <span className="text-white text-xs font-black">f</span>
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #4285f4, #34a853)', boxShadow: '0 0 15px rgba(66,133,244,0.3)' }}>
      <Globe className="w-4 h-4 text-white" />
    </div>
  )
}

function MetricBlock({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540' }}>
      <div className="text-base font-bold" style={{ color: color || '#f0ece4' }}>{value}</div>
      <div className="text-[10px] text-[#8a93a8] mt-0.5 uppercase tracking-wider font-semibold">{label}</div>
      {sub && <div className="text-[10px] text-[#4a5568]">{sub}</div>}
    </div>
  )
}

function CampaignCard({ campaign, onEdit, onDelete }: {
  campaign: Campaign
  onEdit: () => void
  onDelete: () => void
}) {
  const client = (campaign as any).client
  const budgetUsedPct = campaign.budget > 0 ? Math.min((campaign.spend / campaign.budget) * 100, 100) : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 shine group hover:border-[rgba(232,168,124,0.2)] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={campaign.platform} />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#f0ece4] truncate">{campaign.name}</h4>
            {client && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: client.color }} />
                <span className="text-xs text-[#8a93a8]">{client.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} aria-label="Editar campanha" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} aria-label="Remover campanha" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <CampaignStatusBadge status={campaign.status} />
        {campaign.objective && (
          <span className="text-[10px] text-[#8a93a8] px-2 py-0.5 rounded-full border border-[#1a2540]">
            {campaign.objective}
          </span>
        )}
      </div>

      {/* Budget progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#8a93a8]">Budget utilizado</span>
          <span className="font-semibold text-[#f0ece4]">
            R$ {Number(campaign.spend).toLocaleString('pt-BR', { minimumFractionDigits: 0 })} /
            R$ {Number(campaign.budget).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="h-2 bg-[#1a2540] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${budgetUsedPct}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full"
            style={{
              background: budgetUsedPct > 90 ? '#f87171' : budgetUsedPct > 70 ? '#fbbf24' : '#e8a87c'
            }}
          />
        </div>
        <div className="text-right text-[10px] text-[#8a93a8] mt-0.5">{budgetUsedPct.toFixed(1)}%</div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2">
        <MetricBlock label="Impressões" value={Number(campaign.impressions).toLocaleString('pt-BR')} color="#60a5fa" />
        <MetricBlock label="Cliques" value={Number(campaign.clicks).toLocaleString('pt-BR')} color="#7c6af7" />
        <MetricBlock label="CTR" value={`${Number(campaign.ctr).toFixed(2)}%`} color="#e8a87c" />
        <MetricBlock label="CPC" value={`R$ ${Number(campaign.cpc).toFixed(2)}`} color="#f0ece4" />
        <MetricBlock label="Conversões" value={Number(campaign.conversions).toLocaleString('pt-BR')} color="#4ade80" />
        <MetricBlock label="ROAS" value={`${Number(campaign.roas).toFixed(1)}x`} color={Number(campaign.roas) >= 2 ? '#4ade80' : '#f87171'} />
      </div>

      {campaign.start_date && (
        <div className="mt-3 text-xs text-[#4a5568]">
          {format(new Date(campaign.start_date), 'dd/MM/yy', { locale: ptBR })}
          {campaign.end_date && ` → ${format(new Date(campaign.end_date), 'dd/MM/yy', { locale: ptBR })}`}
        </div>
      )}
    </motion.div>
  )
}

function CampaignForm({ initial, clients, onSubmit, loading }: {
  initial?: Partial<Campaign>
  clients: any[]
  onSubmit: (data: Partial<Campaign>) => void
  loading?: boolean
}) {
  const [form, setForm] = useState<Partial<Campaign>>(initial || {
    platform: 'meta', status: 'active', budget_period: 'monthly',
    impressions: 0, clicks: 0, conversions: 0, spend: 0, ctr: 0, cpc: 0, cpm: 0, roas: 0, reach: 0, budget: 0
  })

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form) }
  const set = (field: keyof Campaign, val: any) => setForm(p => ({ ...p, [field]: val }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome da Campanha" value={form.name || ''} onChange={e => set('name', e.target.value)} required placeholder="Ex: Brand Awareness Q1" />
        <Select label="Cliente" value={form.client_id || ''} onChange={e => set('client_id', e.target.value)} required
          placeholder="Selecionar" options={clients.map(c => ({ value: c.id, label: c.name }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Plataforma" value={form.platform || 'meta'} onChange={e => set('platform', e.target.value)}
          options={[{ value: 'meta', label: 'Meta Ads (Facebook/Instagram)' }, { value: 'google', label: 'Google Ads' }]} />
        <Select label="Status" value={form.status || 'active'} onChange={e => set('status', e.target.value)}
          options={[{ value: 'active', label: 'Ativa' }, { value: 'paused', label: 'Pausada' }, { value: 'ended', label: 'Encerrada' }, { value: 'draft', label: 'Rascunho' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Objetivo" value={form.objective || ''} onChange={e => set('objective', e.target.value)} placeholder="Ex: Tráfego, Conversão, Alcance" icon={<Target className="w-4 h-4" />} />
        <Input label="ID Externo da Campanha" value={form.campaign_id_external || ''} onChange={e => set('campaign_id_external', e.target.value)} placeholder="ID no painel de anúncios" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Budget (R$)" type="number" value={form.budget || ''} onChange={e => set('budget', Number(e.target.value))} icon={<DollarSign className="w-4 h-4" />} />
        <Select label="Período do Budget" value={form.budget_period || 'monthly'} onChange={e => set('budget_period', e.target.value)}
          options={[{ value: 'daily', label: 'Diário' }, { value: 'monthly', label: 'Mensal' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data de Início" type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
        <Input label="Data de Fim" type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} />
      </div>

      <p className="text-xs text-[#8a93a8] uppercase tracking-wider font-semibold border-t border-[#1a2540] pt-3">Métricas</p>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Impressões" type="number" value={form.impressions || ''} onChange={e => set('impressions', Number(e.target.value))} />
        <Input label="Cliques" type="number" value={form.clicks || ''} onChange={e => set('clicks', Number(e.target.value))} />
        <Input label="Conversões" type="number" value={form.conversions || ''} onChange={e => set('conversions', Number(e.target.value))} />
        <Input label="Gasto (R$)" type="number" step="0.01" value={form.spend || ''} onChange={e => set('spend', Number(e.target.value))} />
        <Input label="CTR (%)" type="number" step="0.01" value={form.ctr || ''} onChange={e => set('ctr', Number(e.target.value))} />
        <Input label="CPC (R$)" type="number" step="0.01" value={form.cpc || ''} onChange={e => set('cpc', Number(e.target.value))} />
        <Input label="CPM (R$)" type="number" step="0.01" value={form.cpm || ''} onChange={e => set('cpm', Number(e.target.value))} />
        <Input label="ROAS" type="number" step="0.01" value={form.roas || ''} onChange={e => set('roas', Number(e.target.value))} />
        <Input label="Alcance" type="number" value={form.reach || ''} onChange={e => set('reach', Number(e.target.value))} />
      </div>
      <Textarea label="Observações" value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} />
      <Button type="submit" loading={loading} fullWidth>{initial?.id ? 'Salvar' : 'Criar Campanha'}</Button>
    </form>
  )
}

export default function Campaigns() {
  const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign, totalSpend, totalBudget, totalClicks, avgROAS } = useCampaigns()
  const { clients } = useClients()
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = filterPlatform === 'all' || c.platform === filterPlatform
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchPlatform && matchStatus
  })

  async function handleCreate(data: Partial<Campaign>) {
    setSaving(true); await createCampaign(data); setSaving(false); setModal(null)
  }

  async function handleEdit(data: Partial<Campaign>) {
    if (!selected) return
    setSaving(true); await updateCampaign(selected.id, data); setSaving(false); setModal(null); setSelected(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar campanha..."
              className="input-base pl-10 w-48 h-9 text-sm" />
          </div>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="input-base h-9 text-sm w-44">
            <option value="all">Todas plataformas</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base h-9 text-sm w-36">
            <option value="all">Todos status</option>
            <option value="active">Ativas</option>
            <option value="paused">Pausadas</option>
            <option value="ended">Encerradas</option>
          </select>
        </div>
        <Button onClick={() => setModal('create')} icon={<Plus className="w-4 h-4" />}>Nova Campanha</Button>
      </div>

      {/* Integration banner */}
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border p-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, rgba(13,20,36,1), rgba(17,24,39,1))', borderColor: 'rgba(232,168,124,0.2)' }}>
        <div className="absolute right-0 top-0 w-48 h-full opacity-5"
          style={{ background: 'linear-gradient(90deg, transparent, #e8a87c)' }} />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,168,124,0.1)', border: '1px solid rgba(232,168,124,0.2)' }}>
            <Zap className="w-5 h-5 text-[#e8a87c]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f0ece4]">Integração com Meta Ads & Google Ads</p>
            <p className="text-xs text-[#8a93a8]">Conecte suas contas para sincronizar métricas automaticamente em breve</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(232,168,124,0.1)', color: '#e8a87c', border: '1px solid rgba(232,168,124,0.2)' }}>
          Em breve
        </span>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Investido', value: `R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: '#e8a87c' },
          { label: 'Budget Total', value: `R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: Target, color: '#7c6af7' },
          { label: 'ROAS Médio', value: `${avgROAS.toFixed(1)}x`, icon: TrendingUp, color: '#4ade80' },
          { label: 'Total Cliques', value: totalClicks.toLocaleString('pt-BR'), icon: MousePointer, color: '#60a5fa' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#0d1424] border border-[#1a2540] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#f0ece4]">{s.value}</div>
              <div className="text-xs text-[#8a93a8]">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign}
                onEdit={() => { setSelected(campaign); setModal('edit') }}
                onDelete={() => { if (confirm(`Remover "${campaign.name}"?`)) deleteCampaign(campaign.id) }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-[#1a2540] mx-auto mb-3" />
          <p className="text-[#8a93a8] font-medium">Nenhuma campanha encontrada</p>
        </div>
      )}

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nova Campanha" size="xl">
        <CampaignForm clients={clients} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Campanha" size="xl">
        {selected && <CampaignForm initial={selected} clients={clients} onSubmit={handleEdit} loading={saving} />}
      </Modal>
    </div>
  )
}
