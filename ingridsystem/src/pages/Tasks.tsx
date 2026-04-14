import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '../hooks/useTasks'
import { useClients } from '../hooks/useClients'
import { useTeam } from '../hooks/useTeam'
import type { Task } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import { PriorityBadge, TaskStatusBadge } from '../components/ui/Badge'
import {
  Plus, Search, CheckSquare, Clock, User, Paperclip,
  CheckCircle2, AlertTriangle, Trash2, Edit2, Calendar, X
} from 'lucide-react'
import { format, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = {
  urgent: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  high: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  medium: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
  low: { color: '#8a93a8', bg: 'rgba(138,147,168,0.1)', border: 'rgba(138,147,168,0.25)' },
}

function TaskItem({ task, onEdit, onDelete, onToggle }: {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const client = (task as any).client
  const assignee = (task as any).assignee
  const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
  const isOverdue = task.due_date && isAfter(new Date(), new Date(task.due_date)) && task.status !== 'completed'
  const isCompleted = task.status === 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-[#0d1424] border rounded-xl overflow-hidden transition-all duration-200 group ${
        isCompleted ? 'opacity-60 border-[#1a2540]' : 'border-[#1a2540] hover:border-[rgba(255,255,255,0.1)]'
      }`}
      style={!isCompleted ? { borderLeftWidth: '3px', borderLeftColor: p.color } : {}}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Toggle */}
        <button onClick={onToggle}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
          style={{
            borderColor: isCompleted ? '#4ade80' : p.color,
            background: isCompleted ? 'rgba(74,222,128,0.15)' : 'transparent'
          }}>
          {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium leading-snug ${isCompleted ? 'line-through text-[#8a93a8]' : 'text-[#f0ece4]'}`}>
              {task.title}
            </span>
            {isOverdue && (
              <span className="flex items-center gap-1 text-[10px] text-[#f87171] font-semibold">
                <AlertTriangle className="w-3 h-3" /> Atrasada
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-[#f87171]' : 'text-[#8a93a8]'}`}>
                <Clock className="w-3 h-3" />
                {format(new Date(task.due_date), "dd/MM", { locale: ptBR })}
              </span>
            )}
            {client && (
              <span className="flex items-center gap-1 text-xs text-[#8a93a8]">
                <div className="w-3 h-3 rounded-full" style={{ background: client.color }} />
                {client.name}
              </span>
            )}
            {assignee && (
              <span className="flex items-center gap-1 text-xs text-[#8a93a8]">
                <User className="w-3 h-3" /> {assignee.name}
              </span>
            )}
            {task.tags?.length > 0 && task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md text-[#7c6af7] bg-[rgba(124,106,247,0.12)] border border-[rgba(124,106,247,0.2)]">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} aria-label="Editar tarefa" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} aria-label="Remover tarefa" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#1a2540] px-4 py-3 bg-[rgba(255,255,255,0.01)]"
          >
            {task.description && <p className="text-sm text-[#8a93a8] mb-2">{task.description}</p>}
            {task.attachments?.length > 0 && (
              <div>
                <p className="text-xs text-[#4a5568] mb-1.5 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> {task.attachments.length} anexo(s)
                </p>
                <div className="flex gap-2 flex-wrap">
                  {task.attachments.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noreferrer"
                      className="text-xs text-[#7c6af7] px-2 py-1 rounded-lg bg-[rgba(124,106,247,0.1)] border border-[rgba(124,106,247,0.2)] hover:underline flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> {att.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {task.completed_at && (
              <p className="text-xs text-[#4ade80] mt-2">
                Concluído em {format(new Date(task.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TaskForm({ initial, clients, members, onSubmit, loading }: {
  initial?: Partial<Task>
  clients: any[]
  members: any[]
  onSubmit: (data: Partial<Task>) => void
  loading?: boolean
}) {
  const [form, setForm] = useState<Partial<Task>>(initial || {
    priority: 'medium', status: 'pending', tags: [], attachments: [],
    created_by: '00000000-0000-0000-0000-000000000001'
  })
  const [tagInput, setTagInput] = useState('')
  const [attachInput, setAttachInput] = useState({ name: '', url: '' })

  const addTag = () => {
    if (!tagInput.trim()) return
    setForm(p => ({ ...p, tags: [...(p.tags || []), tagInput.trim().toLowerCase()] }))
    setTagInput('')
  }

  const removeTag = (tag: string) => setForm(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tag) }))

  const addAttachment = () => {
    if (!attachInput.name || !attachInput.url) return
    const att = { name: attachInput.name, url: attachInput.url, size: 0, type: 'link', uploaded_at: new Date().toISOString() }
    setForm(p => ({ ...p, attachments: [...(p.attachments || []), att] }))
    setAttachInput({ name: '', url: '' })
  }

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form) }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Título da Tarefa" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Descreva a tarefa..." />
      <Textarea label="Descrição" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Detalhes adicionais..." />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Prioridade" value={form.priority || 'medium'} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))}
          options={[{ value: 'urgent', label: '🔴 Urgente' }, { value: 'high', label: '🟡 Alta' }, { value: 'medium', label: '🔵 Média' }, { value: 'low', label: '⚪ Baixa' }]} />
        <Select label="Status" value={form.status || 'pending'} onChange={e => setForm(p => ({ ...p, status: e.target.value as Task['status'] }))}
          options={[{ value: 'pending', label: 'Pendente' }, { value: 'in_progress', label: 'Em Andamento' }, { value: 'completed', label: 'Concluído' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Cliente (opcional)" value={form.client_id || ''} onChange={e => setForm(p => ({ ...p, client_id: e.target.value || undefined }))}
          placeholder="Sem vínculo" options={clients.map(c => ({ value: c.id, label: c.name }))} />
        <Select label="Responsável" value={form.assigned_to || ''} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value || undefined }))}
          placeholder="Sem responsável" options={members.map(m => ({ value: m.id, label: m.name }))} />
      </div>
      <Input label="Prazo" type="datetime-local" value={form.due_date ? form.due_date.slice(0, 16) : ''} onChange={e => setForm(p => ({ ...p, due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} icon={<Calendar className="w-4 h-4" />} />

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Tags</label>
        <div className="flex gap-2">
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Adicionar tag..." className="input-base flex-1 h-9 text-sm" />
          <Button type="button" onClick={addTag} variant="outline" size="sm">+</Button>
        </div>
        {form.tags && form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-[#7c6af7] bg-[rgba(124,106,247,0.12)] border border-[rgba(124,106,247,0.2)]">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#f87171] transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Anexos (links)</label>
        <div className="flex gap-2">
          <input value={attachInput.name} onChange={e => setAttachInput(p => ({ ...p, name: e.target.value }))}
            placeholder="Nome do arquivo" className="input-base flex-1 h-9 text-sm" />
          <input value={attachInput.url} onChange={e => setAttachInput(p => ({ ...p, url: e.target.value }))}
            placeholder="URL do arquivo" className="input-base flex-1 h-9 text-sm" />
          <Button type="button" onClick={addAttachment} variant="outline" size="sm"><Paperclip className="w-4 h-4" /></Button>
        </div>
      </div>

      <Button type="submit" loading={loading} fullWidth>{initial?.id ? 'Salvar' : 'Criar Tarefa'}</Button>
    </form>
  )
}

export default function Tasks() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
  const { clients } = useClients()
  const { members } = useTeam()
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchClient = filterClient === 'all' || t.client_id === filterClient
    return matchSearch && matchPriority && matchStatus && matchClient
  })

  async function handleCreate(data: Partial<Task>) {
    setSaving(true); await createTask(data); setSaving(false); setModal(null)
  }

  async function handleEdit(data: Partial<Task>) {
    if (!selected) return
    setSaving(true); await updateTask(selected.id, data); setSaving(false); setModal(null); setSelected(null)
  }

  async function handleToggle(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await updateTask(task.id, { status: newStatus })
    if (newStatus === 'completed') toast.success('Tarefa concluída!')
  }

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const urgentCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarefas..."
              className="input-base pl-10 w-48 h-9 text-sm" />
          </div>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-base h-9 text-sm w-32">
            <option value="all">Prioridade</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base h-9 text-sm w-36">
            <option value="all">Todos status</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
          </select>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="input-base h-9 text-sm w-40">
            <option value="all">Todos clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Button onClick={() => setModal('create')} icon={<Plus className="w-4 h-4" />}>Nova Tarefa</Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pendentes', value: pendingCount, color: '#fbbf24' },
          { label: 'Em Andamento', value: inProgressCount, color: '#60a5fa' },
          { label: 'Urgentes', value: urgentCount, color: '#f87171' },
          { label: 'Total', value: tasks.length, color: '#8a93a8' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, color: s.color }}>
            {s.value} {s.label}
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="max-w-4xl space-y-2">
        <AnimatePresence>
          {filtered.map(task => (
            <TaskItem key={task.id} task={task}
              onEdit={() => { setSelected(task); setModal('edit') }}
              onDelete={() => { if (confirm('Remover tarefa?')) deleteTask(task.id) }}
              onToggle={() => handleToggle(task)}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-16">
            <CheckSquare className="w-12 h-12 text-[#1a2540] mx-auto mb-3" />
            <p className="text-[#8a93a8] font-medium">Nenhuma tarefa encontrada</p>
          </div>
        )}
      </div>

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nova Tarefa" subtitle="Crie uma tarefa para a equipe" size="lg">
        <TaskForm clients={clients} members={members} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar Tarefa" size="lg">
        {selected && <TaskForm initial={selected} clients={clients} members={members} onSubmit={handleEdit} loading={saving} />}
      </Modal>
    </div>
  )
}
