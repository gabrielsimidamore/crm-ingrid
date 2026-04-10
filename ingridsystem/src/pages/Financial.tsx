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
  Edit2, Trash2, Check, Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function RecordForm({ initial, clients, onSubmit, loading }: {
  initial?: Partial<FinancialRecord>
  clients: any[]
  onSubmit: (data: Partial<FinancialRecord>) => void
  loading?: boolean
}) {
  const [form, setForm] = useState<Partial<FinancialRecord>>(initial || {
    type: 'invoice', status: 'pending', amount: 0
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
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<FinancialRecord | null>(null)
  const [saving, setSaving] = useState(false)

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

  const totalRecurring = clients.filter(c => c.status === 'active').reduce((acc, c) => acc + Number(c.monthly_value), 0)

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
        <Button onClick={() => setModal('create')} icon={<Plus className="w-4 h-4" />}>Novo Registro</Button>
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

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Novo Registro Financeiro" size="lg">
        <RecordForm clients={clients} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Registro" size="lg">
        {selected && <RecordForm initial={selected} clients={clients} onSubmit={handleEdit} loading={saving} />}
      </Modal>
    </div>
  )
}
