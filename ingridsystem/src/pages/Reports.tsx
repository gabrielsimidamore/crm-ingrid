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
  Eye, Sparkles, X
} from 'lucide-react'
import { format, subDays, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const CHART_COLORS = ['#e8a87c', '#7c6af7', '#4ade80', '#60a5fa', '#f87171', '#fbbf24']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderPieLabel = ({ name, percent }: any) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111827] border border-[#1a2540] rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[#8a93a8] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

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
    tasks: false,
  })
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const client = clients.find(c => c.id === selectedClient)

  // Filter data by client and period
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
  const filteredContent = content.filter(c => {
    const matchClient = !selectedClient || c.client_id === selectedClient
    const matchPeriod = inPeriod(c.created_at)
    return matchClient && matchPeriod
  })
  const filteredRecords = records.filter(r => {
    const matchClient = !selectedClient || r.client_id === selectedClient
    const matchPeriod = inPeriod(r.created_at)
    return matchClient && matchPeriod
  })
  const filteredTasks = tasks.filter(t => {
    const matchClient = !selectedClient || t.client_id === selectedClient
    const matchPeriod = inPeriod(t.created_at)
    return matchClient && matchPeriod
  })

  // Chart data
  const contentByType = ['story', 'feed', 'reel', 'social_media'].map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: filteredContent.filter(c => c.content_type === type).length
  })).filter(d => d.value > 0)

  const contentByStatus = ['approved', 'scheduled', 'posted', 'raw_uploaded'].map(status => ({
    name: { approved: 'Aprovado', scheduled: 'Agendado', posted: 'Postado', raw_uploaded: 'Bruto' }[status] || status,
    value: filteredContent.filter(c => c.status === status).length
  })).filter(d => d.value > 0)

  const financialByStatus = [
    { name: 'Pago', value: filteredRecords.filter(r => r.status === 'paid').reduce((acc, r) => acc + Number(r.amount), 0) },
    { name: 'Pendente', value: filteredRecords.filter(r => r.status === 'pending').reduce((acc, r) => acc + Number(r.amount), 0) },
    { name: 'Vencido', value: filteredRecords.filter(r => r.status === 'overdue').reduce((acc, r) => acc + Number(r.amount), 0) },
  ].filter(d => d.value > 0)

  const campaignMetrics = filteredCampaigns.slice(0, 5).map(c => ({
    name: c.name.slice(0, 15) + (c.name.length > 15 ? '...' : ''),
    Gasto: Number(c.spend),
    Cliques: Number(c.clicks),
    ROAS: Number(c.roas),
  }))

  async function generatePDF() {
    if (!reportRef.current) return
    setGenerating(true)
    toast.loading('Gerando relatório...', { id: 'pdf' })
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0d1424',
        scale: 1.5,
        useCORS: true,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      let position = 0
      const pageHeight = pdf.internal.pageSize.getHeight()
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      } else {
        let remainingHeight = pdfHeight
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
          remainingHeight -= pageHeight
          position -= pageHeight
          if (remainingHeight > 0) pdf.addPage()
        }
      }
      const filename = `relatorio_${client?.name || 'geral'}_${format(new Date(), 'yyyyMMdd')}.pdf`
      pdf.save(filename)
      toast.success('Relatório gerado!', { id: 'pdf' })
    } catch (err) {
      toast.error('Erro ao gerar PDF', { id: 'pdf' })
    }
    setGenerating(false)
  }

  const toggle = (key: keyof typeof sections) => setSections(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-[#f0ece4]">Gerador de Relatórios</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)} icon={<Eye className="w-4 h-4" />}>
            {preview ? 'Ocultar Preview' : 'Visualizar'}
          </Button>
          <Button onClick={generatePDF} loading={generating} icon={<Download className="w-4 h-4" />}>
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Config */}
      <div className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#f0ece4] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e8a87c]" /> Configurar Relatório
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select label="Cliente" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
            placeholder="Todos os clientes" options={clients.map(c => ({ value: c.id, label: c.name }))} />
          <div>
            <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Data Início</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-base h-10 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c8c0b4] mb-1.5">Data Fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-base h-10 text-sm" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8a93a8] uppercase tracking-wider mb-2">Seções do Relatório</p>
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
                    : 'border-[#1a2540] text-[#8a93a8] hover:border-[#243050]'
                }`}
                style={sections[s.key as keyof typeof sections] ? { background: `${s.color}15`, borderColor: `${s.color}40`, color: s.color } : {}}>
                <s.icon className="w-3.5 h-3.5" /> {s.label}
                {sections[s.key as keyof typeof sections] && <X className="w-3 h-3 ml-0.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report preview / printable */}
      {(preview || true) && (
        <div ref={reportRef}
          className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-8 space-y-8"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

          {/* Report header */}
          <div className="flex items-start justify-between border-b border-[#1a2540] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #e8a87c, #c4845a)', boxShadow: '0 0 15px rgba(232,168,124,0.3)' }}>
                  <Sparkles className="w-4 h-4 text-[#060912]" />
                </div>
                <div>
                  <span className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#f0ece4]">Ingrid</span>
                  <span className="text-xs text-[#8a93a8] ml-1 uppercase tracking-wider">Studio CRM</span>
                </div>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f0ece4]">
                Relatório {client ? `— ${client.name}` : 'Geral'}
              </h1>
              <p className="text-sm text-[#8a93a8] mt-1">
                Período: {format(new Date(startDate), "dd 'de' MMMM", { locale: ptBR })} a{' '}
                {format(new Date(endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8a93a8]">Gerado em</p>
              <p className="text-sm font-medium text-[#f0ece4]">
                {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Conteúdos', value: filteredContent.length, color: '#7c6af7' },
              { label: 'Campanhas', value: filteredCampaigns.length, color: '#e8a87c' },
              { label: 'Faturado', value: `R$ ${filteredRecords.filter(r => r.status === 'paid').reduce((a, r) => a + Number(r.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#4ade80' },
              { label: 'Tarefas', value: `${filteredTasks.filter(t => t.status === 'completed').length}/${filteredTasks.length}`, color: '#60a5fa' },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 rounded-xl"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-[#8a93a8] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Campaign section */}
          {sections.campaigns && filteredCampaigns.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#e8a87c]" /> Performance de Campanhas
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Gasto', value: `R$ ${filteredCampaigns.reduce((a, c) => a + Number(c.spend), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, color: '#e8a87c' },
                  { label: 'Impressões', value: filteredCampaigns.reduce((a, c) => a + Number(c.impressions), 0).toLocaleString('pt-BR'), color: '#60a5fa' },
                  { label: 'Cliques', value: filteredCampaigns.reduce((a, c) => a + Number(c.clicks), 0).toLocaleString('pt-BR'), color: '#7c6af7' },
                  { label: 'ROAS Médio', value: `${(filteredCampaigns.filter(c => c.roas > 0).length > 0 ? filteredCampaigns.filter(c => c.roas > 0).reduce((a, c) => a + Number(c.roas), 0) / filteredCampaigns.filter(c => c.roas > 0).length : 0).toFixed(1)}x`, color: '#4ade80' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a2540' }}>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-[#8a93a8]">{s.label}</div>
                  </div>
                ))}
              </div>
              {campaignMetrics.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={campaignMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,37,64,0.6)" />
                    <XAxis dataKey="name" tick={{ fill: '#8a93a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8a93a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Gasto" fill="#e8a87c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cliques" fill="#7c6af7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Content section */}
          {sections.content && filteredContent.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-4 flex items-center gap-2">
                <Film className="w-4 h-4 text-[#7c6af7]" /> Conteúdo Produzido
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#8a93a8] mb-2 uppercase tracking-wider font-semibold">Por Tipo</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={contentByType} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={renderPieLabel} labelLine={false}>
                        {contentByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-xs text-[#8a93a8] mb-2 uppercase tracking-wider font-semibold">Por Status</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={contentByStatus} layout="vertical">
                      <XAxis type="number" tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#8a93a8', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#7c6af7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Financial section */}
          {sections.financial && filteredRecords.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#4ade80]" /> Resumo Financeiro
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={financialByStatus} cx="50%" cy="50%" outerRadius={60} dataKey="value"
                        label={renderPieLabel} labelLine={false}>
                        {financialByStatus.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? '#4ade80' : i === 1 ? '#fbbf24' : '#f87171'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {filteredRecords.slice(0, 5).map(r => {
                    const c = clients.find(cl => cl.id === r.client_id)
                    return (
                      <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[#1a2540]">
                        <span className="text-[#c8c0b4] truncate max-w-[180px]">{r.description || c?.name || '—'}</span>
                        <span className={`font-semibold ${r.status === 'paid' ? 'text-[#4ade80]' : r.status === 'overdue' ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>
                          R$ {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tasks section */}
          {sections.tasks && filteredTasks.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[#f0ece4] mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#60a5fa]" /> Tarefas do Período
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: 'Concluídas', value: filteredTasks.filter(t => t.status === 'completed').length, color: '#4ade80' },
                  { label: 'Em Andamento', value: filteredTasks.filter(t => t.status === 'in_progress').length, color: '#60a5fa' },
                  { label: 'Pendentes', value: filteredTasks.filter(t => t.status === 'pending').length, color: '#fbbf24' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-[#8a93a8]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#1a2540] pt-4 flex items-center justify-between">
            <p className="text-xs text-[#4a5568]">Gerado pelo Ingrid Studio CRM</p>
            <p className="text-xs text-[#4a5568]">{format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
        </div>
      )}
    </div>
  )
}
