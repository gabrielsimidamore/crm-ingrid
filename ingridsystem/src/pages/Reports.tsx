import { useState, useRef } from 'react'
import { useClients } from '../hooks/useClients'
import { useCampaigns } from '../hooks/useCampaigns'
import { useContent } from '../hooks/useContent'
import { useFinancial } from '../hooks/useFinancial'
import { useTasks } from '../hooks/useTasks'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import {
  Download, BarChart3, Film, DollarSign, CheckSquare,
  Sparkles, TrendingUp, Users, Calendar
} from 'lucide-react'
import { format, isWithinInterval, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area, Legend
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const CHART_COLORS = ['#e8a87c', '#7c6af7', '#4ade80', '#60a5fa', '#f87171', '#fbbf24']

const renderPieLabel = ({ name, percent }: any) =>
  `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111827] border border-[#1a2540] rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[#8a93a8] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' && p.name?.includes('R$') ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}
        </p>
      ))}
    </div>
  )
}

const PERIOD_PRESETS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Este ano', days: 365 },
]

export default function Reports() {
  const { clients } = useClients()
  const { campaigns } = useCampaigns()
  const { content } = useContent()
  const { records } = useFinancial()
  const { tasks } = useTasks()

  const [selectedClient, setSelectedClient] = useState('')
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [sections, setSections] = useState({
    campaigns: true,
    content: true,
    financial: true,
    tasks: true,
  })
  const [generating, setGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const client = clients.find(c => c.id === selectedClient)

  function applyPreset(days: number) {
    setStartDate(format(subDays(new Date(), days), 'yyyy-MM-dd'))
    setEndDate(format(new Date(), 'yyyy-MM-dd'))
  }

  const inPeriod = (dateStr?: string) => {
    if (!dateStr) return false
    try {
      const d = new Date(dateStr)
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59)
      return isWithinInterval(d, { start, end })
    } catch { return false }
  }

  const filteredCampaigns = campaigns.filter(c => !selectedClient || c.client_id === selectedClient)
  const filteredContent = content.filter(c =>
    (!selectedClient || c.client_id === selectedClient) && inPeriod(c.created_at)
  )
  const filteredRecords = records.filter(r =>
    (!selectedClient || r.client_id === selectedClient) && inPeriod(r.created_at)
  )
  const filteredTasks = tasks.filter(t =>
    (!selectedClient || t.client_id === selectedClient) && inPeriod(t.created_at)
  )

  // ── Chart data ──────────────────────────────────────────────────────────────
  const contentByType = ['story', 'feed', 'reel', 'social_media'].map(type => ({
    name: { story: 'Story', feed: 'Feed', reel: 'Reel', social_media: 'Social' }[type] || type,
    value: filteredContent.filter(c => c.content_type === type).length
  })).filter(d => d.value > 0)

  const contentByStatus = ['approved', 'scheduled', 'posted', 'raw_uploaded', 'edited_uploaded'].map(status => ({
    name: { approved: 'Aprovado', scheduled: 'Agendado', posted: 'Postado', raw_uploaded: 'Bruto', edited_uploaded: 'Editado' }[status] || status,
    value: filteredContent.filter(c => c.status === status).length
  })).filter(d => d.value > 0)

  const financialByStatus = [
    { name: 'Pago', value: filteredRecords.filter(r => r.status === 'paid').reduce((acc, r) => acc + Number(r.amount), 0), fill: '#4ade80' },
    { name: 'Pendente', value: filteredRecords.filter(r => r.status === 'pending').reduce((acc, r) => acc + Number(r.amount), 0), fill: '#fbbf24' },
    { name: 'Vencido', value: filteredRecords.filter(r => r.status === 'overdue').reduce((acc, r) => acc + Number(r.amount), 0), fill: '#f87171' },
  ].filter(d => d.value > 0)

  const campaignMetrics = filteredCampaigns.slice(0, 6).map(c => ({
    name: c.name.slice(0, 12) + (c.name.length > 12 ? '...' : ''),
    'Gasto R$': Number(c.spend),
    Cliques: Number(c.clicks),
  }))

  // Revenue over time (weekly buckets)
  const revenueOverTime = Array.from({ length: 6 }, (_, i) => {
    const weekStart = subDays(new Date(endDate), (5 - i) * 7)
    const weekEnd = subDays(new Date(endDate), (4 - i) * 7)
    const paid = filteredRecords.filter(r => {
      if (r.status !== 'paid' || !r.paid_date) return false
      const d = new Date(r.paid_date)
      return d >= weekStart && d <= weekEnd
    }).reduce((acc, r) => acc + Number(r.amount), 0)
    return { semana: format(weekStart, 'dd/MM', { locale: ptBR }), 'Recebido R$': paid }
  })

  // ── PDF generation ──────────────────────────────────────────────────────────
  async function generatePDF() {
    if (!reportRef.current) return
    setGenerating(true)
    toast.loading('Gerando PDF...', { id: 'pdf' })
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#060912',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      })
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pdfW) / canvas.width
      let pos = 0
      let remaining = imgH
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH)
        remaining -= pdfH
        pos -= pdfH
        if (remaining > 0) pdf.addPage()
      }
      const filename = `relatorio_${client?.name?.replace(/\s+/g, '_') || 'geral'}_${format(new Date(), 'yyyyMMdd')}.pdf`
      pdf.save(filename)
      toast.success('PDF baixado!', { id: 'pdf' })
    } catch {
      toast.error('Erro ao gerar PDF', { id: 'pdf' })
    }
    setGenerating(false)
  }

  const toggle = (key: keyof typeof sections) => setSections(p => ({ ...p, [key]: !p[key] }))

  const totalRevenuePaid = filteredRecords.filter(r => r.status === 'paid').reduce((a, r) => a + Number(r.amount), 0)
  const totalRevenuePending = filteredRecords.filter(r => r.status === 'pending').reduce((a, r) => a + Number(r.amount), 0)
  const avgROAS = filteredCampaigns.filter(c => c.roas > 0).length > 0
    ? filteredCampaigns.filter(c => c.roas > 0).reduce((a, c) => a + Number(c.roas), 0) / filteredCampaigns.filter(c => c.roas > 0).length
    : 0

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#f0ece4]">Gerador de Relatórios</h2>
        <Button onClick={generatePDF} loading={generating} icon={<Download className="w-4 h-4" />}>
          Baixar PDF
        </Button>
      </div>

      {/* Config panel */}
      <div className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#f0ece4] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e8a87c]" /> Configurar Relatório
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Cliente" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
            placeholder="Todos os clientes" options={clients.map(c => ({ value: c.id, label: c.name }))} />
          <div>
            <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Data Início</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-base h-10 text-sm w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Data Fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-base h-10 text-sm w-full" />
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-2">Atalhos de Período</p>
          <div className="flex flex-wrap gap-2">
            {PERIOD_PRESETS.map(p => (
              <button key={p.days} onClick={() => applyPreset(p.days)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8a93a8] border border-[#1a2540] hover:border-[rgba(232,168,124,0.3)] hover:text-[#e8a87c] transition-all">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section toggles */}
        <div>
          <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-2">Seções</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'campaigns', label: 'Campanhas', icon: BarChart3, color: '#e8a87c' },
              { key: 'content', label: 'Conteúdo', icon: Film, color: '#7c6af7' },
              { key: 'financial', label: 'Financeiro', icon: DollarSign, color: '#4ade80' },
              { key: 'tasks', label: 'Tarefas', icon: CheckSquare, color: '#60a5fa' },
            ].map(s => (
              <button key={s.key} type="button" onClick={() => toggle(s.key as keyof typeof sections)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  sections[s.key as keyof typeof sections]
                    ? 'border-[rgba(255,255,255,0.15)] text-[#f0ece4]'
                    : 'border-[#1a2540] text-[#4a5568] hover:border-[#243050]'
                }`}
                style={sections[s.key as keyof typeof sections] ? { background: `${s.color}15`, borderColor: `${s.color}40`, color: s.color } : {}}>
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PRINTABLE REPORT ═══════════════════════════════════════════════════ */}
      <div ref={reportRef}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#060912', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Report header */}
        <div className="p-8 pb-6" style={{ background: 'linear-gradient(135deg, #0d1424 0%, #111827 100%)', borderBottom: '1px solid #1a2540' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #e8a87c, #c4845a)', boxShadow: '0 0 20px rgba(232,168,124,0.3)' }}>
                  <Sparkles className="w-5 h-5 text-[#060912]" />
                </div>
                <div>
                  <span className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#f0ece4]">Ingrid</span>
                  <span className="text-xs text-[#8a93a8] ml-1 uppercase tracking-wider font-light">Studio CRM</span>
                </div>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#f0ece4] leading-tight">
                Relatório {client ? `— ${client.name}` : 'Geral'}
              </h1>
              <p className="text-sm text-[#8a93a8] mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(startDate), "dd 'de' MMMM", { locale: ptBR })} a{' '}
                {format(new Date(endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#4a5568]">Gerado em</p>
              <p className="text-sm font-medium text-[#f0ece4]">
                {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              {client && (
                <div className="mt-3 flex items-center gap-2 justify-end">
                  <div className="w-6 h-6 rounded-lg" style={{ background: client.color }} />
                  <span className="text-sm font-semibold text-[#f0ece4]">{client.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Conteúdos', value: filteredContent.length, sub: `${filteredContent.filter(c => c.status === 'posted').length} postados`, color: '#7c6af7', icon: Film },
              { label: 'Receita Paga', value: `R$ ${totalRevenuePaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, sub: `+ R$ ${totalRevenuePending.toLocaleString('pt-BR')} pendente`, color: '#4ade80', icon: DollarSign },
              { label: 'Campanhas', value: filteredCampaigns.length, sub: `ROAS médio ${avgROAS.toFixed(1)}x`, color: '#e8a87c', icon: TrendingUp },
              { label: 'Tarefas', value: `${filteredTasks.filter(t => t.status === 'completed').length}/${filteredTasks.length}`, sub: 'concluídas / total', color: '#60a5fa', icon: CheckSquare },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl flex flex-col gap-3"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-semibold text-[#8a93a8] mt-0.5">{s.label}</div>
                  <div className="text-xs text-[#4a5568] mt-0.5">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── FINANCIAL SECTION ──────────────────────────────────────────── */}
          {sections.financial && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-5 flex items-center gap-2 pb-3 border-b border-[#1a2540]">
                <DollarSign className="w-4 h-4 text-[#4ade80]" /> Resumo Financeiro
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Faturado', value: `R$ ${totalRevenuePaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#4ade80' },
                  { label: 'A Receber', value: `R$ ${totalRevenuePending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#fbbf24' },
                  { label: 'Vencido', value: `R$ ${filteredRecords.filter(r => r.status === 'overdue').reduce((a, r) => a + Number(r.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#f87171' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-[#8a93a8] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6">
                {financialByStatus.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-3">Distribuição por Status</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={financialByStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                          label={renderPieLabel} labelLine={false}>
                          {financialByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-3">Receita por Semana</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={revenueOverTime}>
                      <defs>
                        <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,37,64,0.8)" />
                      <XAxis dataKey="semana" tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false}
                        tickFormatter={v => v > 0 ? `R$${(v/1000).toFixed(0)}k` : '0'} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Recebido R$" stroke="#4ade80" strokeWidth={2} fill="url(#greenGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Top records */}
              {filteredRecords.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-2">Registros Recentes</p>
                  <div className="space-y-1.5">
                    {filteredRecords.slice(0, 6).map(r => {
                      const c = clients.find(cl => cl.id === r.client_id)
                      return (
                        <div key={r.id} className="flex items-center justify-between text-sm py-2 px-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540' }}>
                          <span className="text-[#c8c0b4] truncate max-w-[220px]">{r.description || c?.name || '—'}</span>
                          <span className={`font-semibold text-xs ${r.status === 'paid' ? 'text-[#4ade80]' : r.status === 'overdue' ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>
                            R$ {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT SECTION ────────────────────────────────────────────── */}
          {sections.content && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-5 flex items-center gap-2 pb-3 border-b border-[#1a2540]">
                <Film className="w-4 h-4 text-[#7c6af7]" /> Conteúdo Produzido
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total', value: filteredContent.length, color: '#7c6af7' },
                  { label: 'Aprovados', value: filteredContent.filter(c => ['approved', 'scheduled', 'posted'].includes(c.status)).length, color: '#4ade80' },
                  { label: 'Agendados', value: filteredContent.filter(c => c.status === 'scheduled').length, color: '#e8a87c' },
                  { label: 'Postados', value: filteredContent.filter(c => c.status === 'posted').length, color: '#60a5fa' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-[#8a93a8] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {(contentByType.length > 0 || contentByStatus.length > 0) && (
                <div className="grid grid-cols-2 gap-6">
                  {contentByType.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-3">Por Tipo</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={contentByType} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                            label={renderPieLabel} labelLine={false}>
                            {contentByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#8a93a8' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {contentByStatus.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-3">Por Status</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={contentByStatus} layout="vertical">
                          <XAxis type="number" tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} width={65} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill="#7c6af7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CAMPAIGNS SECTION ──────────────────────────────────────────── */}
          {sections.campaigns && filteredCampaigns.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-5 flex items-center gap-2 pb-3 border-b border-[#1a2540]">
                <BarChart3 className="w-4 h-4 text-[#e8a87c]" /> Performance de Campanhas
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Gasto', value: `R$ ${filteredCampaigns.reduce((a, c) => a + Number(c.spend), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#e8a87c' },
                  { label: 'Impressões', value: filteredCampaigns.reduce((a, c) => a + Number(c.impressions), 0).toLocaleString('pt-BR'), color: '#60a5fa' },
                  { label: 'Cliques', value: filteredCampaigns.reduce((a, c) => a + Number(c.clicks), 0).toLocaleString('pt-BR'), color: '#7c6af7' },
                  { label: 'ROAS Médio', value: `${avgROAS.toFixed(1)}x`, color: '#4ade80' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540' }}>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-[#8a93a8]">{s.label}</div>
                  </div>
                ))}
              </div>
              {campaignMetrics.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={campaignMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,37,64,0.8)" />
                    <XAxis dataKey="name" tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#8a93a8' }} />
                    <Bar dataKey="Gasto R$" fill="#e8a87c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cliques" fill="#7c6af7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* ── TASKS SECTION ──────────────────────────────────────────────── */}
          {sections.tasks && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-5 flex items-center gap-2 pb-3 border-b border-[#1a2540]">
                <CheckSquare className="w-4 h-4 text-[#60a5fa]" /> Tarefas do Período
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total', value: filteredTasks.length, color: '#8a93a8' },
                  { label: 'Concluídas', value: filteredTasks.filter(t => t.status === 'completed').length, color: '#4ade80' },
                  { label: 'Em Andamento', value: filteredTasks.filter(t => t.status === 'in_progress').length, color: '#60a5fa' },
                  { label: 'Pendentes', value: filteredTasks.filter(t => t.status === 'pending').length, color: '#fbbf24' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-xl" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-[#8a93a8]">{s.label}</div>
                  </div>
                ))}
              </div>
              {filteredTasks.length > 0 && (
                <div className="space-y-1.5">
                  {filteredTasks.slice(0, 8).map(t => (
                    <div key={t.id} className="flex items-center justify-between text-sm py-2 px-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540' }}>
                      <span className={`text-[#c8c0b4] truncate max-w-[260px] ${t.status === 'completed' ? 'line-through opacity-60' : ''}`}>{t.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        t.priority === 'urgent' ? 'text-[#f87171] bg-[rgba(248,113,113,0.1)]' :
                        t.priority === 'high' ? 'text-[#fbbf24] bg-[rgba(251,191,36,0.1)]' :
                        'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]'
                      }`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CLIENT INFO (if specific client) ───────────────────────────── */}
          {client && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540', borderRadius: 16 }} className="p-5">
              <h2 className="text-sm font-semibold text-[#f0ece4] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e8a87c]" /> Dados do Cliente
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-[#060912] flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${client.color}, ${client.color}88)` }}>
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#f0ece4]">{client.name}</p>
                  {client.company && <p className="text-xs text-[#8a93a8]">{client.company}</p>}
                  {client.instagram && <p className="text-xs text-[#8a93a8]">@{client.instagram}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#e8a87c]">R$ {Number(client.monthly_value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/mês</p>
                  <p className="text-xs text-[#8a93a8]">Budget Ads: R$ {Number(client.ads_budget).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                </div>
              </div>
              {client.notes && <p className="text-xs text-[#8a93a8] mt-3 leading-relaxed">{client.notes}</p>}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#1a2540] pt-4 flex items-center justify-between">
            <p className="text-xs text-[#4a5568]">Gerado pelo Ingrid Studio CRM · Confidencial</p>
            <p className="text-xs text-[#4a5568]">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}