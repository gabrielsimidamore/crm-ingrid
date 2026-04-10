import { motion } from 'framer-motion'
import { useClients } from '../hooks/useClients'
import { useContent } from '../hooks/useContent'
import { useTasks } from '../hooks/useTasks'
import { useFinancial } from '../hooks/useFinancial'
import { useCampaigns } from '../hooks/useCampaigns'
import { StatCard } from '../components/ui/Card'
import { Badge, ContentStatusBadge, TaskStatusBadge } from '../components/ui/Badge'
import {
  Users, Film, CheckSquare, DollarSign, TrendingUp, Clock,
  ArrowRight, Calendar, Megaphone, Sparkles, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { clients } = useClients()
  const { content } = useContent()
  const { tasks } = useTasks()
  const { records, totalPaid, totalPending, totalOverdue } = useFinancial()
  const { campaigns, totalSpend, avgROAS } = useCampaigns()

  const activeClients = clients.filter(c => c.status === 'active').length
  const pendingContent = content.filter(c => ['raw_uploaded', 'edited_uploaded'].includes(c.status))
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed')

  // Revenue chart data (last 7 days mock from actual data)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayRecords = records.filter(r => {
      if (!r.paid_date) return false
      return r.paid_date === format(date, 'yyyy-MM-dd')
    })
    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      Faturamento: dayRecords.reduce((acc, r) => acc + Number(r.amount), 0),
      Tarefas: tasks.filter(t => {
        if (!t.completed_at) return false
        return format(new Date(t.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      }).length
    }
  })

  // Client revenue
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
        style={{ background: 'linear-gradient(135deg, rgba(13,20,36,1) 0%, rgba(17,24,39,1) 50%, rgba(13,20,36,1) 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #e8a87c, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #7c6af7, transparent)', transform: 'translateY(50%)' }} />

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
          <div className="flex items-center gap-3">
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
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Clientes Ativos"
          value={activeClients}
          subtitle={`${clients.filter(c => c.status === 'inactive').length} inativos`}
          icon={<Users className="w-5 h-5" />}
          color="rose"
          delay={0}
        />
        <StatCard
          title="Faturamento Pago"
          value={`R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          subtitle={`R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} pendente`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          trend={{ value: 12, positive: true }}
          delay={0.06}
        />
        <StatCard
          title="Conteúdos Pendentes"
          value={pendingContent.length}
          subtitle={`${content.filter(c => c.status === 'approved').length} aprovados`}
          icon={<Film className="w-5 h-5" />}
          color="violet"
          delay={0.12}
        />
        <StatCard
          title="Tarefas Abertas"
          value={pendingTasks.length}
          subtitle={`${urgentTasks.length} urgentes`}
          icon={<CheckSquare className="w-5 h-5" />}
          color="blue"
          delay={0.18}
        />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#f0ece4]">Faturamento — últimos 7 dias</h3>
              <p className="text-xs text-[#8a93a8] mt-0.5">Pagamentos registrados</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#4ade80] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(74,222,128,0.1)' }}>
              <TrendingUp className="w-3 h-3" />
              +12%
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

        {/* Client revenue distribution */}
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
              <motion.div key={c.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#c8c0b4] font-medium">{c.name}</span>
                  <span className="text-sm font-semibold text-[#f0ece4]">
                    R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clientRevenue[0]?.value > 0 ? (c.value / clientRevenue[0].value) * 100 : 0}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: c.color }}
                  />
                </div>
              </motion.div>
            ))}
            {clientRevenue.length === 0 && (
              <p className="text-sm text-[#4a5568] text-center py-4">Nenhum cliente cadastrado</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending content */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}
          className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#7c6af7]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Conteúdo Pendente</h3>
            </div>
            <button onClick={() => navigate('/content')}
              className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingContent.slice(0, 4).map(item => (
              <motion.div key={item.id}
                whileHover={{ x: 2 }}
                onClick={() => navigate('/content')}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
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

        {/* Pending tasks */}
        <motion.div {...fadeInUp} transition={{ delay: 0.35 }}
          className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#60a5fa]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Tarefas Recentes</h3>
            </div>
            <button onClick={() => navigate('/tasks')}
              className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 4).map(task => (
              <motion.div key={task.id}
                whileHover={{ x: 2 }}
                onClick={() => navigate('/tasks')}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'urgent' ? 'bg-[#f87171]' :
                    task.priority === 'high' ? 'bg-[#fbbf24]' :
                    task.priority === 'medium' ? 'bg-[#60a5fa]' : 'bg-[#4a5568]'
                  } pulse-dot`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#f0ece4] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${
                          isAfter(new Date(), new Date(task.due_date)) ? 'text-[#f87171]' : 'text-[#8a93a8]'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                        </span>
                      )}
                      {(task as any).client && (
                        <span className="text-xs text-[#8a93a8]">{(task as any).client.name}</span>
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

      {/* Campaign summary */}
      {campaigns.length > 0 && (
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}
          className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#e8a87c]" />
              <h3 className="text-sm font-semibold text-[#f0ece4]">Resumo de Campanhas</h3>
            </div>
            <button onClick={() => navigate('/campaigns')}
              className="text-xs text-[#8a93a8] hover:text-[#e8a87c] transition-colors flex items-center gap-1">
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
    </div>
  )
}
