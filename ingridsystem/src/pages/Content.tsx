import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import { useClients } from '../hooks/useClients'
import type { ContentPiece } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import { ContentStatusBadge, Badge } from '../components/ui/Badge'
import {
  Plus, Search, Film, CheckCircle2, Clock, Upload, Eye,
  Calendar, Filter, ChevronDown, Play, Image, FileVideo,
  Check, X, AlertCircle, Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CONTENT_TYPES = [
  { value: 'story', label: 'Story' },
  { value: 'feed', label: 'Feed' },
  { value: 'reel', label: 'Reel' },
  { value: 'social_media', label: 'Social Media' },
]

const STATUS_COLUMNS = [
  { key: 'raw_uploaded', label: 'Bruto Enviado', color: '#fbbf24', icon: Upload },
  { key: 'approved_raw', label: 'Bruto Aprovado', color: '#60a5fa', icon: CheckCircle2 },
  { key: 'edited_uploaded', label: 'Editado Enviado', color: '#7c6af7', icon: FileVideo },
  { key: 'approved', label: 'Aprovado ✓', color: '#4ade80', icon: Check },
  { key: 'scheduled', label: 'Agendado', color: '#e8a87c', icon: Calendar },
  { key: 'posted', label: 'Postado', color: '#8a93a8', icon: CheckCircle2 },
]

function ContentCard({ item, onApproveRaw, onApproveEdited, onSchedule, onView }: {
  item: ContentPiece
  onApproveRaw?: () => void
  onApproveEdited?: () => void
  onSchedule?: () => void
  onView?: () => void
}) {
  const client = (item as any).client
  const statusCol = STATUS_COLUMNS.find(s => s.key === item.status)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-[#0d1424] border border-[#1a2540] rounded-xl p-4 group hover:border-[rgba(124,106,247,0.25)] transition-all duration-200"
    >
      {/* Thumbnail preview */}
      <div className="relative h-28 rounded-lg mb-3 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-[#1a2540]" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ContentStatusBadge status={item.status} />
        </div>
        {item.content_type && (
          <div className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#f0ece4' }}>
            {item.content_type}
          </div>
        )}
      </div>

      {/* Info */}
      <h4 className="text-sm font-semibold text-[#f0ece4] truncate mb-1">{item.title}</h4>
      {client && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: client.color }} />
          <span className="text-xs text-[#8a93a8]">{client.name}</span>
        </div>
      )}

      {item.scheduled_date && (
        <div className="flex items-center gap-1.5 text-xs text-[#8a93a8] mb-2">
          <Calendar className="w-3 h-3" />
          {format(new Date(item.scheduled_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 mt-3">
        {item.status === 'raw_uploaded' && onApproveRaw && (
          <button onClick={onApproveRaw}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-[#4ade80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] hover:bg-[rgba(74,222,128,0.15)] transition-colors flex items-center justify-center gap-1">
            <Check className="w-3 h-3" /> Aprovar Bruto
          </button>
        )}
        {item.status === 'edited_uploaded' && onApproveEdited && (
          <button onClick={onApproveEdited}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-[#4ade80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] hover:bg-[rgba(74,222,128,0.15)] transition-colors flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Aprovar Editado
          </button>
        )}
        {item.status === 'approved' && onSchedule && (
          <button onClick={onSchedule}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-[#e8a87c] bg-[rgba(232,168,124,0.1)] border border-[rgba(232,168,124,0.25)] hover:bg-[rgba(232,168,124,0.15)] transition-colors flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" /> Agendar
          </button>
        )}
        <button onClick={onView}
          className="p-1.5 rounded-lg text-[#8a93a8] hover:text-[#f0ece4] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

function AddContentForm({ clients, onSubmit, loading }: {
  clients: { id: string; name: string; color: string }[]
  onSubmit: (data: Partial<ContentPiece>) => void
  loading?: boolean
}) {
  const [form, setForm] = useState<Partial<ContentPiece>>({
    content_type: 'story',
    status: 'raw_uploaded',
    platforms: ['instagram'],
    hashtags: [],
    uploaded_by: '00000000-0000-0000-0000-000000000001'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Título" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Nome do conteúdo" />
        <Select label="Cliente" value={form.client_id || ''} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} required
          placeholder="Selecionar cliente"
          options={clients.map(c => ({ value: c.id, label: c.name }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Conteúdo" value={form.content_type || 'story'} onChange={e => setForm(p => ({ ...p, content_type: e.target.value as ContentPiece['content_type'] }))}
          options={CONTENT_TYPES} />
        <Select label="Status Inicial" value={form.status || 'raw_uploaded'} onChange={e => setForm(p => ({ ...p, status: e.target.value as ContentPiece['status'] }))}
          options={[
            { value: 'raw_uploaded', label: 'Bruto Enviado' },
            { value: 'edited_uploaded', label: 'Editado Enviado' },
          ]} />
      </div>

      <Input label="URL do Arquivo Bruto" value={form.raw_url || ''} onChange={e => setForm(p => ({ ...p, raw_url: e.target.value }))} placeholder="https://drive.google.com/..." icon={<Upload className="w-4 h-4" />} />
      <Input label="URL do Arquivo Editado" value={form.edited_url || ''} onChange={e => setForm(p => ({ ...p, edited_url: e.target.value }))} placeholder="https://drive.google.com/..." icon={<FileVideo className="w-4 h-4" />} />
      <Input label="Thumbnail (URL)" value={form.thumbnail_url || ''} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://..." icon={<Image className="w-4 h-4" />} />

      <Textarea label="Legenda / Caption" value={form.caption || ''} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} rows={2} placeholder="Escreva a legenda do post..." />
      <Input label="Hashtags" value={form.hashtags?.join(' ') || ''} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value.split(' ').filter(Boolean) }))} placeholder="#hashtag1 #hashtag2" />
      <Textarea label="Observações" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Observações sobre o conteúdo..." />

      <Button type="submit" loading={loading} fullWidth>Adicionar Conteúdo</Button>
    </form>
  )
}

export default function Content() {
  const { content, loading, createContent, approveRaw, approveEdited, scheduleContent } = useContent()
  const { clients } = useClients()
  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [modal, setModal] = useState<'add' | 'schedule' | 'view' | null>(null)
  const [selected, setSelected] = useState<ContentPiece | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'kanban' | 'grid'>('kanban')

  const filtered = content.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchClient = filterClient === 'all' || c.client_id === filterClient
    const matchType = filterType === 'all' || c.content_type === filterType
    return matchSearch && matchClient && matchType
  })

  async function handleCreate(data: Partial<ContentPiece>) {
    setSaving(true)
    await createContent(data)
    setSaving(false)
    setModal(null)
  }

  async function handleSchedule() {
    if (!selected || !scheduleDate) return
    setSaving(true)
    await scheduleContent(selected.id, new Date(scheduleDate).toISOString())
    setSaving(false)
    setModal(null)
    setSelected(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conteúdo..."
              className="input-base pl-10 w-48 h-9 text-sm" />
          </div>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
            className="input-base h-9 text-sm w-40">
            <option value="all">Todos clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="input-base h-9 text-sm w-36">
            <option value="all">Todos tipos</option>
            {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex gap-1">
            {(['kanban', 'grid'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  view === v ? 'bg-[rgba(232,168,124,0.15)] text-[#e8a87c] border-[rgba(232,168,124,0.3)]'
                    : 'text-[#8a93a8] border-transparent hover:border-[#1a2540]'
                }`}>
                {v === 'kanban' ? 'Kanban' : 'Grade'}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setModal('add')} icon={<Plus className="w-4 h-4" />}>Adicionar Conteúdo</Button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_COLUMNS.map(col => {
          const count = content.filter(c => c.status === col.key).length
          return (
            <div key={col.key} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: `${col.color}12`, border: `1px solid ${col.color}30`, color: col.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
              {col.label}: {count}
            </div>
          )
        })}
      </div>

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STATUS_COLUMNS.map(col => {
              const colItems = filtered.filter(c => c.status === col.key)
              const ColIcon = col.icon
              return (
                <div key={col.key} className="w-64 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <ColIcon className="w-4 h-4" style={{ color: col.color }} />
                    <span className="text-xs font-semibold" style={{ color: col.color }}>{col.label}</span>
                    <span className="ml-auto text-xs text-[#4a5568] bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 rounded-full">
                      {colItems.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {colItems.map(item => (
                        <ContentCard key={item.id} item={item}
                          onApproveRaw={item.status === 'raw_uploaded' ? () => approveRaw(item.id) : undefined}
                          onApproveEdited={item.status === 'edited_uploaded' ? () => approveEdited(item.id) : undefined}
                          onSchedule={item.status === 'approved' ? () => { setSelected(item); setModal('schedule') } : undefined}
                          onView={() => { setSelected(item); setModal('view') }}
                        />
                      ))}
                    </AnimatePresence>
                    {colItems.length === 0 && (
                      <div className="h-20 rounded-xl border border-dashed border-[#1a2540] flex items-center justify-center">
                        <p className="text-xs text-[#4a5568]">Vazio</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {filtered.map(item => (
              <ContentCard key={item.id} item={item}
                onApproveRaw={item.status === 'raw_uploaded' ? () => approveRaw(item.id) : undefined}
                onApproveEdited={item.status === 'edited_uploaded' ? () => approveEdited(item.id) : undefined}
                onSchedule={item.status === 'approved' ? () => { setSelected(item); setModal('schedule') } : undefined}
                onView={() => { setSelected(item); setModal('view') }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Adicionar Conteúdo" subtitle="Cadastre um novo vídeo ou post" size="lg">
        <AddContentForm clients={clients} onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal open={modal === 'schedule'} onClose={() => { setModal(null); setSelected(null) }} title="Agendar Publicação" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[#8a93a8]">Escolha a data e hora para publicação de <strong className="text-[#f0ece4]">{selected?.title}</strong></p>
          <Input label="Data e Hora" type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} icon={<Calendar className="w-4 h-4" />} />
          <Button onClick={handleSchedule} loading={saving} fullWidth icon={<Calendar className="w-4 h-4" />}>
            Confirmar Agendamento
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'view'} onClose={() => { setModal(null); setSelected(null) }} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#8a93a8]">Tipo:</span> <span className="text-[#f0ece4] capitalize">{selected.content_type}</span></div>
              <div><span className="text-[#8a93a8]">Status:</span> <ContentStatusBadge status={selected.status} /></div>
              {selected.scheduled_date && <div><span className="text-[#8a93a8]">Agendado:</span> <span className="text-[#f0ece4]">{format(new Date(selected.scheduled_date), "dd/MM/yyyy 'às' HH:mm")}</span></div>}
              <div><span className="text-[#8a93a8]">Criado:</span> <span className="text-[#f0ece4]">{format(new Date(selected.created_at), 'dd/MM/yyyy')}</span></div>
            </div>
            {selected.caption && (
              <div>
                <p className="text-xs text-[#8a93a8] mb-1 uppercase tracking-wider font-semibold">Caption</p>
                <p className="text-sm text-[#f0ece4] bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[#1a2540]">{selected.caption}</p>
              </div>
            )}
            {selected.raw_url && (
              <a href={selected.raw_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#7c6af7] hover:underline">
                <Upload className="w-4 h-4" /> Ver arquivo bruto
              </a>
            )}
            {selected.edited_url && (
              <a href={selected.edited_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#4ade80] hover:underline">
                <FileVideo className="w-4 h-4" /> Ver arquivo editado
              </a>
            )}
            {selected.notes && (
              <div>
                <p className="text-xs text-[#8a93a8] mb-1 uppercase tracking-wider font-semibold">Observações</p>
                <p className="text-sm text-[#c8c0b4]">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
