import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClients } from '../hooks/useClients'
import { useContent } from '../hooks/useContent'
import { useTasks } from '../hooks/useTasks'
import { useFinancial } from '../hooks/useFinancial'
import { useCampaigns } from '../hooks/useCampaigns'
import { StatCard } from '../components/ui/Card'
import { ContentStatusBadge, TaskStatusBadge } from '../components/ui/Badge'
import {
  Users, Film, CheckSquare, DollarSign, TrendingUp, Clock,
  ArrowRight, Megaphone, Sparkles, ChevronRight,
  Lightbulb, Target, Plus, Edit2, Trash2, Check, X, Calendar
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Idea {
  id: string
  title: string
  description?: string
  client?: string
  createdAt: string
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  type: 'revenue' | 'clients' | 'content' | 'tasks' | 'custom'
  deadline?: string
  done: boolean
}

// ── Persistence ───────────────────────────────────────────────────────────────
function loadIdeas(): Idea[] {
  try { return JSON.parse(localStorage.getItem('ingrid_ideas') || '[]') } catch { return [] }
}
function saveIdeas(d: Idea[]) { localStorage.setItem('ingrid_ideas', JSON.stringify(d)) }
function loadGoals(): Goal[] {
  try { return JSON.parse(localStorage.getItem('ingrid_goals') || '[]') } catch { return [] }
}
function saveGoals(d: Goal[]) { localStorage.setItem('ingrid_goals', JSON.stringify(d)) }

// ── Helpers ───────────────────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-[#1a2540] rounded-xl p-3 shadow-xl">
        <p className="text-xs text-[#8a93a8] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.name === 'Faturamento' ? `R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const GOAL_COLORS: Record<Goal['type'], string> = {
  revenue: '#4ade80',
  clients: '#e8a87c',
  content: '#7c6af7',
  tasks: '#60a5fa',
  custom: '#f87171',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { clients } = useClients()
  const { content } = useContent()
  const { tasks } = useTasks()
  const { records, totalPaid, totalPending } = useFinancial()
  const { campaigns, totalSpend, avgROAS } = useCampaigns()

  // Ideas state
  const [ideas, setIdeas] = useState<Idea[]>(loadIdeas)
  const [ideaModal, setIdeaModal] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [ideaForm, setIdeaForm] = useState({ title: '', description: '', client: '' })

  // Goals state
  const [goals, setGoals] = useState<Goal[]>(loadGoals)
  const [goalModal, setGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [goalForm, setGoalForm] = useState<Partial<Goal>>({ type: 'revenue', target: 0, current: 0, unit: 'R$', done: false })

  // ── Ideas CRUD ──────────────────────────────────────────────────────────────
  function openIdeaCreate() {
    setEditingIdea(null)
    setIdeaForm({ title: '', description: '', client: '' })
    setIdeaModal(true)
  }
  function openIdeaEdit(idea: Idea) {
    setEditingIdea(idea)
    setIdeaForm({ title: idea.title, description: idea.description || '', client: idea.client || '' })
    setIdeaModal(true)
  }
  function saveIdea() {
    if (!ideaForm.title.trim()) return
    if (editingIdea) {
      const updated = ideas.map(i => i.id === editingIdea.id
        ? { ...i, title: ideaForm.title, description: ideaForm.description, client: ideaForm.client }
        : i)
      setIdeas(updated); saveIdeas(updated)
    } else {
      const newIdea: Idea = { id: Date.now().toString(), title: ideaForm.title, description: ideaForm.description, client: ideaForm.client, createdAt: new Date().toISOString() }
      const updated = [newIdea, ...ideas]
      setIdeas(updated); saveIdeas(updated)
    }
    setIdeaModal(false)
  }
  function deleteIdea(id: string) {
    if (!confirm('Remover ideia?')) return
    const updated = ideas.filter(i => i.id !== id)
    setIdeas(updated); saveIdeas(updated)
  }

  // ── Goals CRUD ──────────────────────────────────────────────────────────────
  function openGoalCreate() {
    setEditingGoal(null)
    setGoalForm({ type: 'revenue', target: 0, current: 0, unit: 'R$', done: false })
    setGoalModal(true)
  }
  function openGoalEdit(goal: Goal) {
    setEditingGoal(goal)
    setGoalForm({ ...goal })
    setGoalModal(true)
  }
  function saveGoal() {
    if (!goalForm.title?.trim() || !goalForm.target) return
    const g: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: goalForm.title!,
      target: Number(goalForm.target),
      current: Number(goalForm.current || 0),
      unit: goalForm.unit || '',
      type: goalForm.type || 'custom',
      deadline: goalForm.deadline,
      done: goalForm.done || false,
    }
    if (editingGoal) {
      const updated = goals.map(g2 => g2.id === editingGoal.id ? g : g2)
      setGoals(updated); saveGoals(updated)
    } else {
      const updated = [...goals, g]
      setGoals(updated); saveGoals(updated)
    }
    setGoalModal(false)
  }
  function deleteGoal(id: string) {
    if (!confirm('Remover meta?')) return
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated); saveGoals(updated)
  }
  function toggleGoalDone(goal: Goal) {
    const updated = goals.map(g => g.id === goal.id ? { ...g, done: !g.done } : g)
    setGoals(updated); saveGoals(updated)
  }

  // ── Charts ──────────────────────────────────────────────────────────────────
  const activeClients = clients.filter(c => c.status === 'active').length
  const pendingContent = content.filter(c => ['raw_uploaded', 'edited_uploaded'].includes(c.status))
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed')

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayRecords = records.filter(r => r.paid_date === format(date, 'yyyy-MM-dd'))
    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      Faturamento: dayRecords.reduce((acc, r) => acc + Number(r.amount), 0),
    }
  })

  const clientRevenue = clients.map(c => ({
    name: c.name.split(' ')[0],
    value: Number(c.monthly_value),
    color: c.color
  })).sort((a, b) => b.value - a.value).slice(0, 5)

  const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-[#0d1424] border border-[#1a2540] rounded-2xl p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #e8a87c, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#e8a87c]" />
              <span className="text-xs text-[#8a93a8] font-medium uppercase tracking-wider">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#f0ece4] leading-tight">
              Bem-vinda, <span className="gradient-rose font-semibold">Ingrid</span>
            </h1>
            <p className="text-[#8a93a8] text-sm mt-1">
              {activeClients} clientes ativos · {pendingContent.length} conteúdos aguardando aprovação
            </p>
          </div>
          {urgentTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
              onClick={() => navigate('/tasks')}
            >
              <span className="w-2 h-2 rounded-full bg-[#f87171] pulse-dot" />
              {urgentTasks.length} tarefa{urgentTasks.length > 1 ? 's' : ''} urgente{urgentTasks.length > 1 ? 's' : ''}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes Ativos" value={activeClients} subtitle={`${clients.filter(c => c.status === 'inactive').length} inativos`} icon={<Users className="w-5 h-5" />} color="rose" delay={0} />
        <StatCard title="Faturamento Pago" value={`R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} subtitle={`R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} pendente`} icon={<DollarSign className="w-5 h-5" />} color="green" trend={{ value: 12, positive: true }} delay={0.06} />
        <StatCard title="Conteúdos Pendentes" value={pendingContent.length} subtitle={`${content.filter(c => c.status === 'approved').length} aprovados`} icon={<Film className="w-5 h-5" />} color="violet" delay={0.12} />
        <StatCard title="Tarefas Abertas" value={pendingTasks.length} subtitle={`${urgentTasks.length} urgentes`} icon={<CheckSquare className="w-5 h-5" />} color="blue" delay={0.18} />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#f0ece4]">Faturamento — últimos 7 dias</h3>
              <p className="text-xs text-[#8a93a8] mt-0.5">Pagamentos registrados</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#4ade80] font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)' }}>
              <TrendingUp className="w-3 h-3" /> +12%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8a87c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e8a87c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,37,64,0.6)" />
              <XAxis dataKey="date" tick={{ fill: '#8a93a8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a93a8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `R$${(v/1000).toFixed(0)}k` : '0'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Faturamento" stroke="#e8a87c" strokeWidth={2} fill="url(#roseGrad)" dot={false} activeDot={{ r: 4, fill: '#e8a87c', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}
          className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[#f0ece4]">Receita por Cliente</h3>
            <button onClick={() => navigate('/clients')} className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {clientRevenue.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#c8c0b4] font-medium">{c.name}</span>
                  <span className="text-sm font-semibold text-[#f0ece4]">R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                </div>
                <div className="h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clientRevenue[0]?.value > 0 ? (c.value / clientRevenue[0].value) * 100 : 0}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                    className="h-full rounded-full" style={{ background: c.color }}
                  />
                </div>
              </motion.div>
            ))}
            {clientRevenue.length === 0 && <p className="text-sm text-[#4a5568] text-center py-4">Nenhum cliente cadastrado</p>}
          </div>
        </motion.div>
      </div>

      {/* Pending content + tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#7c6af7]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Conteúdo Pendente</h3>
            </div>
            <button onClick={() => navigate('/content')} className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingContent.slice(0, 4).map(item => (
              <motion.div key={item.id} whileHover={{ x: 2 }} onClick={() => navigate('/content')}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.2)' }}>
                    <Film className="w-4 h-4 text-[#7c6af7]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#f0ece4] truncate">{item.title}</p>
                    <p className="text-xs text-[#8a93a8]">{(item as any).client?.name || '—'}</p>
                  </div>
                </div>
                <ContentStatusBadge status={item.status} />
              </motion.div>
            ))}
            {pendingContent.length === 0 && (
              <div className="text-center py-6">
                <Film className="w-8 h-8 text-[#1a2540] mx-auto mb-2" />
                <p className="text-sm text-[#4a5568]">Nenhum conteúdo pendente</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.35 }} className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#60a5fa]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Tarefas Recentes</h3>
            </div>
            <button onClick={() => navigate('/tasks')} className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 4).map(task => (
              <motion.div key={task.id} whileHover={{ x: 2 }} onClick={() => navigate('/tasks')}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'urgent' ? 'bg-[#f87171]' : task.priority === 'high' ? 'bg-[#fbbf24]' : task.priority === 'medium' ? 'bg-[#60a5fa]' : 'bg-[#4a5568]'} pulse-dot`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#f0ece4] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${isAfter(new Date(), new Date(task.due_date)) ? 'text-[#f87171]' : 'text-[#8a93a8]'}`}>
                          <Clock className="w-3 h-3" />
                          {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <TaskStatusBadge status={task.status} />
              </motion.div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-6">
                <CheckSquare className="w-8 h-8 text-[#1a2540] mx-auto mb-2" />
                <p className="text-sm text-[#4a5568]">Nenhuma tarefa pendente</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Goals + Ideas row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── METAS ─────────────────────────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ delay: 0.38 }} className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#4ade80]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Metas</h3>
              {goals.filter(g => !g.done).length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full text-[#4ade80] bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.2)]">
                  {goals.filter(g => !g.done).length} ativas
                </span>
              )}
            </div>
            <button onClick={openGoalCreate}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#4ade80] hover:bg-[rgba(74,222,128,0.1)] transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {goals.map(goal => {
                const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
                const color = GOAL_COLORS[goal.type] || '#8a93a8'
                return (
                  <motion.div key={goal.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                    className={`group p-3 rounded-xl border transition-all ${goal.done ? 'opacity-50 border-[#1a2540]' : 'border-[#1a2540] hover:border-[rgba(255,255,255,0.08)]'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={() => toggleGoalDone(goal)}
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ borderColor: goal.done ? '#4ade80' : color, background: goal.done ? 'rgba(74,222,128,0.15)' : 'transparent' }}>
                          {goal.done && <Check className="w-2.5 h-2.5 text-[#4ade80]" />}
                        </button>
                        <span className={`text-sm font-medium truncate ${goal.done ? 'line-through text-[#4a5568]' : 'text-[#f0ece4]'}`}>{goal.title}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openGoalEdit(goal)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteGoal(goal.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: color }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
                        {goal.unit}{goal.current.toLocaleString('pt-BR')} / {goal.unit}{goal.target.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-xs text-[#4a5568]">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {goals.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-[#1a2540] mx-auto mb-2" />
                <p className="text-sm text-[#4a5568]">Nenhuma meta definida</p>
                <button onClick={openGoalCreate} className="text-xs text-[#4ade80] mt-1 hover:underline">+ Criar meta</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── IDEIAS ────────────────────────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ delay: 0.42 }} className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Ideias</h3>
              {ideas.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full text-[#fbbf24] bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.2)]">
                  {ideas.length}
                </span>
              )}
            </div>
            <button onClick={openIdeaCreate}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a93a8] hover:text-[#fbbf24] hover:bg-[rgba(251,191,36,0.1)] transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {ideas.map(idea => (
                <motion.div key={idea.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="group p-3 rounded-xl border border-[#1a2540] hover:border-[rgba(251,191,36,0.2)] transition-all bg-[rgba(255,255,255,0.01)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#f0ece4] leading-snug">{idea.title}</p>
                      {idea.description && <p className="text-xs text-[#8a93a8] mt-0.5 line-clamp-2">{idea.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        {idea.client && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full text-[#e8a87c] bg-[rgba(232,168,124,0.1)] border border-[rgba(232,168,124,0.2)]">
                            {idea.client}
                          </span>
                        )}
                        <span className="text-[10px] text-[#4a5568]">
                          {format(new Date(idea.createdAt), 'dd/MM', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openIdeaEdit(idea)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[#8a93a8] hover:text-[#e8a87c] hover:bg-[rgba(232,168,124,0.1)] transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteIdea(idea.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[#8a93a8] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {ideas.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="w-10 h-10 text-[#1a2540] mx-auto mb-2" />
                <p className="text-sm text-[#4a5568]">Nenhuma ideia registrada</p>
                <button onClick={openIdeaCreate} className="text-xs text-[#fbbf24] mt-1 hover:underline">+ Adicionar ideia</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Campaign summary */}
      {campaigns.length > 0 && (
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#e8a87c]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Resumo de Campanhas</h3>
            </div>
            <button onClick={() => navigate('/campaigns')} className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Investido', value: `R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#e8a87c' },
              { label: 'ROAS Médio', value: `${avgROAS.toFixed(1)}x`, color: '#4ade80' },
              { label: 'Campanhas Ativas', value: campaigns.filter(c => c.status === 'active').length, color: '#7c6af7' },
              { label: 'Total Cliques', value: campaigns.reduce((acc, c) => acc + Number(c.clicks || 0), 0).toLocaleString('pt-BR'), color: '#60a5fa' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540' }}>
                <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-[#8a93a8] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── IDEA MODAL ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {ideaModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setIdeaModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#f0ece4] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                  {editingIdea ? 'Editar Ideia' : 'Nova Ideia'}
                </h3>
                <button onClick={() => setIdeaModal(false)} className="text-[#8a93a8] hover:text-[#f0ece4] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Título *</label>
                  <input value={ideaForm.title} onChange={e => setIdeaForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Escreva sua ideia..." className="input-base w-full h-10 text-sm"
                    onKeyDown={e => e.key === 'Enter' && saveIdea()} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Descrição</label>
                  <textarea value={ideaForm.description} onChange={e => setIdeaForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Detalhes da ideia..." rows={3}
                    className="input-base w-full text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Cliente relacionado</label>
                  <input value={ideaForm.client} onChange={e => setIdeaForm(p => ({ ...p, client: e.target.value }))}
                    placeholder="Nome do cliente (opcional)" className="input-base w-full h-10 text-sm" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setIdeaModal(false)}
                    className="flex-1 h-10 rounded-xl border border-[#1a2540] text-sm text-[#8a93a8] hover:text-[#f0ece4] hover:border-[rgba(255,255,255,0.1)] transition-all">
                    Cancelar
                  </button>
                  <button onClick={saveIdea}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold text-[#060912] transition-all"
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    {editingIdea ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GOAL MODAL ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {goalModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setGoalModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#f0ece4] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4ade80]" />
                  {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                </h3>
                <button onClick={() => setGoalModal(false)} className="text-[#8a93a8] hover:text-[#f0ece4] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Título *</label>
                  <input value={goalForm.title || ''} onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: Atingir R$ 10.000 de receita" className="input-base w-full h-10 text-sm" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Tipo</label>
                    <select value={goalForm.type || 'custom'} onChange={e => setGoalForm(p => ({ ...p, type: e.target.value as Goal['type'] }))}
                      className="input-base w-full h-10 text-sm">
                      <option value="revenue">Receita</option>
                      <option value="clients">Clientes</option>
                      <option value="content">Conteúdos</option>
                      <option value="tasks">Tarefas</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Unidade</label>
                    <input value={goalForm.unit || ''} onChange={e => setGoalForm(p => ({ ...p, unit: e.target.value }))}
                      placeholder="R$, %, un..." className="input-base w-full h-10 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Meta</label>
                    <input type="number" value={goalForm.target || ''} onChange={e => setGoalForm(p => ({ ...p, target: Number(e.target.value) }))}
                      placeholder="0" className="input-base w-full h-10 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Atual</label>
                    <input type="number" value={goalForm.current || ''} onChange={e => setGoalForm(p => ({ ...p, current: Number(e.target.value) }))}
                      placeholder="0" className="input-base w-full h-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Prazo</label>
                  <input type="date" value={goalForm.deadline || ''} onChange={e => setGoalForm(p => ({ ...p, deadline: e.target.value }))}
                    className="input-base w-full h-10 text-sm" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setGoalModal(false)}
                    className="flex-1 h-10 rounded-xl border border-[#1a2540] text-sm text-[#8a93a8] hover:text-[#f0ece4] hover:border-[rgba(255,255,255,0.1)] transition-all">
                    Cancelar
                  </button>
                  <button onClick={saveGoal}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold text-[#060912] transition-all"
                    style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
                    {editingGoal ? 'Salvar' : 'Criar Meta'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}