import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinancial } from '../hooks/useFinancial'
import { useClients } from '../hooks/useClients'
import type { FinancialRecord } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import { FinancialStatusBadge } from '../components/ui/Badge'
import {
  Plus, Search, DollarSign, TrendingUp, AlertCircle, CheckCircle2,
  Edit2, Trash2, Check, Receipt, Wrench, ShoppingBag
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Local cost types (saved to localStorage) ──────────────────────────────────
interface Cost {
  id: string
  name: string
  amount: number
  category: string
  type: 'fixed' | 'variable'
  recurrence?: 'monthly' | 'one_time'
  notes?: string
}

function loadCosts(): Cost[] {
  try { return JSON.parse(localStorage.getItem('ingrid_costs') || '[]') } catch { return [] }
}
function saveCosts(costs: Cost[]) {
  localStorage.setItem('ingrid_costs', JSON.stringify(costs))
}

function CostForm({ initial, onSubmit, onCancel }: {
  initial?: Partial<Cost>
  onSubmit: (c: Cost) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Cost>>(initial || { type: 'fixed', recurrence: 'monthly', amount: 0 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.amount) return
    onSubmit({
      id: initial?.id || Date.now().toString(),
      name: form.name!,
      amount: Number(form.amount),
      category: form.category || 'Geral',
      type: form.type || 'fixed',
      recurrence: form.recurrence || 'monthly',
      notes: form.notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ex: Assinatura Adobe" />
        <Input label="Valor (R$)" type="number" step="0.01" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} required icon={<DollarSign className="w-4 h-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo" value={form.type || 'fixed'} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'fixed' | 'variable' }))}
          options={[{ value: 'fixed', label: 'Fixo' }, { value: 'variable', label: 'Variável' }]} />
        <Select label="Recorrência" value={form.recurrence || 'monthly'} onChange={e => setForm(p => ({ ...p, recurrence: e.target.value as Cost['recurrence'] }))}
          options={[{ value: 'monthly', label: 'Mensal' }, { value: 'one_time', label: 'Pontual' }]} />
      </div>
      <Input label="Categoria" value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Ex: Software, Freelancer, Aluguel" />
      <Textarea label="Observações" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} fullWidth>Cancelar</Button>
        <Button type="submit" fullWidth>{initial?.id ? 'Salvar' : 'Adicionar'}</Button>
      </div>
    </form>
  )
}

// ── Invoice form ───────────────────────────────────────────────────────────────
function RecordForm({ initial, clients, onSubmit, loading, presetType }: {
  initial?: Partial<FinancialRecord>
  clients: any[]
  onSubmit: (data: Partial<FinancialRecord>) => void
  loading?: boolean
  presetType?: FinancialRecord['type']
}) {
  const [form, setForm] = useState<Partial<FinancialRecord>>(initial || {
    type: presetType || 'invoice', status: 'pending', amount: 0
  })

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form) }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Cliente" value={form.client_id || ''} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} required
          placeholder="Selecionar" options={clients.map(c => ({ value: c.id, label: c.name }))} />
        <Select label="Tipo" value={form.type || 'invoice'} onChange={e => setForm(p => ({ ...p, type: e.target.value as FinancialRecord['type'] }))}
          options={[{ value: 'invoice', label: 'Fatura/Mensalidade' }, { value: 'payment', label: 'Pagamento Recebido' }, { value: 'expense', label: 'Despesa' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Valor (R$)" type="number" step="0.01" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} required icon={<DollarSign className="w-4 h-4" />} />
        <Select label="Status" value={form.status || 'pending'} onChange={e => setForm(p => ({ ...p, status: e.target.value as FinancialRecord['status'] }))}
          options={[{ value: 'pending', label: 'Pendente' }, { value: 'paid', label: 'Pago' }, { value: 'overdue', label: 'Vencido' }, { value: 'cancelled', label: 'Cancelado' }]} />
      </div>
      <Input label="Descrição" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ex: Mensalidade Janeiro 2026" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Vencimento" type="date" value={form.due_date || ''} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
        <Input label="Data de Pagamento" type="date" value={form.paid_date || ''} onChange={e => setForm(p => ({ ...p, paid_date: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Mês de Referência" type="month" value={form.reference_month ? form.reference_month.slice(0, 7) : ''} onChange={e => setForm(p => ({ ...p, reference_month: e.target.value + '-01' }))} />
        <Select label="Forma de Pagamento" value={form.payment_method || ''} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}
          placeholder="Selecionar"
          options={[{ value: 'pix', label: 'PIX' }, { value: 'transfer', label: 'Transferência' }, { value: 'card', label: 'Cartão' }, { value: 'boleto', label: 'Boleto' }]} />
      </div>
      <Textarea label="Observações" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      <Button type="submit" loading={loading} fullWidth>{initial?.id ? 'Salvar' : 'Criar Registro'}</Button>
    </form>
  )
}

export default function Financial() {
  const { records, loading, createRecord, updateRecord, markAsPaid, deleteRecord, totalPaid, totalPending, totalOverdue } = useFinancial()
  const { clients } = useClients()

  // Records state
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [modal, setModal] = useState<'create' | 'invoice' | 'edit' | null>(null)
  const [selected, setSelected] = useState<FinancialRecord | null>(null)
  const [saving, setSaving] = useState(false)

  // Costs state
  const [costs, setCosts] = useState<Cost[]>(loadCosts)
  const [costModal, setCostModal] = useState<'add' | 'edit' | null>(null)
  const [selectedCost, setSelectedCost] = useState<Cost | null>(null)
  const [costsTab, setCostsTab] = useState<'fixed' | 'variable'>('fixed')

  const filtered = records.filter(r => {
    const matchSearch = (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
      ((r as any).client?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchClient = filterClient === 'all' || r.client_id === filterClient
    const matchType = filterType === 'all' || r.type === filterType
    return matchSearch && matchStatus && matchClient && matchType
  })

  async function handleCreate(data: Partial<FinancialRecord>) {
    setSaving(true); await createRecord(data); setSaving(false); setModal(null)
  }
  async function handleEdit(data: Partial<FinancialRecord>) {
    if (!selected) return
    setSaving(true); await updateRecord(selected.id, data); setSaving(false); setModal(null); setSelected(null)
  }

  function handleAddCost(cost: Cost) {
    const updated = selectedCost
      ? costs.map(c => c.id === selectedCost.id ? cost : c)
      : [...costs, cost]
    setCosts(updated); saveCosts(updated)
    setCostModal(null); setSelectedCost(null)
  }
  function handleDeleteCost(id: string) {
    if (!confirm('Remover custo?')) return
    const updated = costs.filter(c => c.id !== id)
    setCosts(updated); saveCosts(updated)
  }

  const fixedCosts = costs.filter(c => c.type === 'fixed')
  const variableCosts = costs.filter(c => c.type === 'variable')
  const totalFixed = fixedCosts.reduce((a, c) => a + c.amount, 0)
  const totalVariable = variableCosts.reduce((a, c) => a + c.amount, 0)
  const totalRecurring = clients.filter(c => c.status === 'active').reduce((acc, c) => acc + Number(c.monthly_value), 0)
  const netProfit = totalPaid - totalFixed - totalVariable

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar registros..."
              className="input-base pl-10 w-48 h-9 text-sm" />
          </div>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="input-base h-9 text-sm w-40">
            <option value="all">Todos clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base h-9 text-sm w-36">
            <option value="all">Todos status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="overdue">Vencido</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-base h-9 text-sm w-36">
            <option value="all">Todos tipos</option>
            <option value="invoice">Faturas</option>
            <option value="payment">Pagamentos</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModal('invoice')} icon={<Receipt className="w-4 h-4" />}>
            Nova Fatura
          </Button>
          <Button onClick={() => setModal('create')} icon={<Plus className="w-4 h-4" />}>Novo Registro</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Mensal Prevista', value: `R$ ${totalRecurring.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#4ade80', icon: TrendingUp, sub: 'Contratos ativos' },
          { label: 'Total Recebido', value: `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#4ade80', icon: CheckCircle2, sub: 'Pagamentos confirmados' },
          { label: 'A Receber', value: `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#fbbf24', icon: DollarSign, sub: 'Aguardando pagamento' },
          { label: 'Em Atraso', value: `R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#f87171', icon: AlertCircle, sub: 'Vencido' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#0d1424] border border-[#1a2540] rounded-xl p-4 flex items-center gap-3 hover:border-[rgba(255,255,255,0.08)] transition-colors shine">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium text-[#8a93a8]">{s.label}</div>
              <div className="text-xs text-[#4a5568]">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Custos Fixos e Variáveis ─────────────────────────────────────────── */}
      <div className="bg-[#0d1424] border border-[#1a2540] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1a2540] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#e8a87c]" />
            <h3 className="text-sm font-semibold text-[#f0ece4]">Custos Operacionais</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(['fixed', 'variable'] as const).map(t => (
                <button key={t} onClick={() => setCostsTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    costsTab === t
                      ? 'bg-[rgba(232,168,124,0.15)] text-[#e8a87c] border-[rgba(232,168,124,0.3)]'
                      : 'text-[#8a93a8] border-transparent hover:border-[#1a2540]'
                  }`}>
                  {t === 'fixed' ? 'Fixos' : 'Variáveis'}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => { setSelectedCost(null); setCostModal('add') }} icon={<Plus className="w-3.5 h-3.5" />}>
              Adicionar
            </Button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 divide-x divide-[#1a2540] border-b border-[#1a2540]">
          {[
            { label: 'Custos Fixos', value: `R$ ${totalFixed.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#f87171' },
            { label: 'Custos Variáveis', value: `R$ ${totalVariable.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#fbbf24' },
            { label: 'Lucro Líquido (aprox.)', value: `R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: netProfit >= 0 ? '#4ade80' : '#f87171' },
          ].map((s, i) => (
            <div key={i} className="p-3 text-center">
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#8a93a8]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cost list */}
        <div className="divide-y divide-[#1a2540]">
          <AnimatePresence>
            {(costsTab === 'fixed' ? fixedCosts : variableCosts).map(cost => (
              <motion.div key={cost.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: costsTab === 'fixed' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)' }}>
                    <ShoppingBag className="w-4 h-4" style={{ color: costsTab === 'fixed' ? '#f87171' : '#fbbf24' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f0ece4]">{cost.name}</p>
                    <p className="text-xs text-[#8a93a8]">{cost.category} · {cost.recurrence === 'monthly' ? 'Mensal' : 'Pontual'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#f0ece4]">
                    R$ {cost.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelectedCost(cost); setCostModal('edit') }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCost(cost.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {(costsTab === 'fixed' ? fixedCosts : variableCosts).length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="w-8 h-8 text-[#1a2540] mx-auto mb-2" />
              <p className="text-sm text-[#8a93a8]">Nenhum custo {costsTab === 'fixed' ? 'fixo' : 'variável'} cadastrado</p>
              <button onClick={() => { setSelectedCost(null); setCostModal('add') }}
                className="text-xs text-[#e8a87c] mt-1 hover:underline">+ Adicionar</button>
            </div>
          )}
        </div>
      </div>

      {/* Per-client summary */}
      <div className="bg-[#0d1424] border border-[#1a2540] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1a2540] flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#e8a87c]" />
          <h3 className="text-sm font-semibold text-[#f0ece4]">Resumo por Cliente</h3>
        </div>
        <div className="divide-y divide-[#1a2540]">
          {clients.filter(c => c.status === 'active').map(client => {
            const clientRecords = records.filter(r => r.client_id === client.id)
            const paid = clientRecords.filter(r => r.status === 'paid').reduce((acc, r) => acc + Number(r.amount), 0)
            const pending = clientRecords.filter(r => r.status === 'pending').reduce((acc, r) => acc + Number(r.amount), 0)
            const overdue = clientRecords.filter(r => r.status === 'overdue').reduce((acc, r) => acc + Number(r.amount), 0)
            return (
              <div key={client.id} className="flex items-center justify-between px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-[#060912]"
                    style={{ background: client.color }}>{client.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-[#f0ece4]">{client.name}</p>
                    <p className="text-xs text-[#8a93a8]">Mensalidade: R$ {Number(client.monthly_value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  {paid > 0 && <div><div className="text-sm font-bold text-[#4ade80]">R$ {paid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div><div className="text-[10px] text-[#4a5568]">Pago</div></div>}
                  {pending > 0 && <div><div className="text-sm font-bold text-[#fbbf24]">R$ {pending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div><div className="text-[10px] text-[#4a5568]">Pendente</div></div>}
                  {overdue > 0 && <div><div className="text-sm font-bold text-[#f87171]">R$ {overdue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div><div className="text-[10px] text-[#4a5568]">Vencido</div></div>}
                  {paid === 0 && pending === 0 && overdue === 0 && <span className="text-xs text-[#4a5568]">Sem registros</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1424] border border-[#1a2540] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1a2540]">
          <h3 className="text-sm font-semibold text-[#f0ece4]">Todos os Registros</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2540]">
                {['Cliente', 'Descrição', 'Tipo', 'Valor', 'Vencimento', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#8a93a8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2540]">
              <AnimatePresence>
                {filtered.map(record => {
                  const client = (record as any).client || clients.find(c => c.id === record.client_id)
                  return (
                    <motion.tr key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                      <td className="px-4 py-3">
                        {client ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-[#060912]"
                              style={{ background: client.color }}>{client.name.charAt(0)}</div>
                            <span className="text-sm text-[#f0ece4]">{client.name}</span>
                          </div>
                        ) : <span className="text-sm text-[#4a5568]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#c8c0b4] max-w-xs truncate">{record.description || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                          background: record.type === 'invoice' ? 'rgba(232,168,124,0.1)' : record.type === 'payment' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                          color: record.type === 'invoice' ? '#e8a87c' : record.type === 'payment' ? '#4ade80' : '#f87171',
                          border: `1px solid ${record.type === 'invoice' ? 'rgba(232,168,124,0.25)' : record.type === 'payment' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`
                        }}>
                          {record.type === 'invoice' ? 'Fatura' : record.type === 'payment' ? 'Pagamento' : 'Despesa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#f0ece4]">
                        R$ {Number(record.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8a93a8]">
                        {record.due_date ? format(new Date(record.due_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </td>
                      <td className="px-4 py-3"><FinancialStatusBadge status={record.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {record.status === 'pending' && (
                            <button onClick={() => markAsPaid(record.id)} title="Marcar como pago"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#4ade80] hover:bg-[rgba(74,222,128,0.1)] transition-colors">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => { setSelected(record); setModal('edit') }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm('Remover?')) deleteRecord(record.id) }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <DollarSign className="w-10 h-10 text-[#1a2540] mx-auto mb-3" />
              <p className="text-sm text-[#8a93a8]">Nenhum registro encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Record modals */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Novo Registro Financeiro" size="lg">
        <RecordForm clients={clients} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={modal === 'invoice'} onClose={() => setModal(null)} title="Nova Fatura" subtitle="Crie uma fatura de mensalidade para um cliente" size="lg">
        <RecordForm clients={clients} onSubmit={handleCreate} loading={saving} presetType="invoice" />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Registro" size="lg">
        {selected && <RecordForm initial={selected} clients={clients} onSubmit={handleEdit} loading={saving} />}
      </Modal>

      {/* Cost modals */}
      <Modal open={costModal !== null} onClose={() => { setCostModal(null); setSelectedCost(null) }}
        title={selectedCost ? 'Editar Custo' : `Novo Custo ${costsTab === 'fixed' ? 'Fixo' : 'Variável'}`} size="sm">
        <CostForm
          initial={selectedCost ? { ...selectedCost } : { type: costsTab }}
          onSubmit={handleAddCost}
          onCancel={() => { setCostModal(null); setSelectedCost(null) }}
        />
      </Modal>
    </div>
  )
}