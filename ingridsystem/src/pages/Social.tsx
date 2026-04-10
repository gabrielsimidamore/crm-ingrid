import { motion } from 'framer-motion'
import { Share2, AtSign, Globe, MessageCircle, Smartphone, Zap, Bell, Sparkles, ArrowRight } from 'lucide-react'

const PLATFORMS = [
  {
    name: 'Instagram',
    icon: AtSign,
    color: '#e1306c',
    grad: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    desc: 'Stories, Feed e Reels integrados',
    features: ['DMs centralizados', 'Comentários', 'Menções'],
  },
  {
    name: 'WhatsApp Business',
    icon: MessageCircle,
    color: '#25d366',
    grad: 'linear-gradient(135deg, #25d366, #128c7e)',
    desc: 'Atendimento e comunicação com clientes',
    features: ['Mensagens automáticas', 'Templates', 'Grupos'],
  },
  {
    name: 'Facebook',
    icon: Globe,
    color: '#1877f2',
    grad: 'linear-gradient(135deg, #1877f2, #0a4db8)',
    desc: 'Páginas e grupos de clientes',
    features: ['Posts', 'Mensagens', 'Comentários'],
  },
]

const UPCOMING = [
  { title: 'Inbox Unificado', desc: 'Receba e responda mensagens de todas as plataformas em um só lugar', icon: MessageCircle },
  { title: 'Notificações em Tempo Real', desc: 'Alertas instantâneos de comentários, DMs e menções dos seus clientes', icon: Bell },
  { title: 'Agendamento Direto', desc: 'Publique conteúdo diretamente nas redes sociais pelo CRM', icon: Zap },
  { title: 'Analytics Integrado', desc: 'Métricas orgânicas das redes sociais direto no dashboard', icon: Sparkles },
]

export default function Social() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#0d1424] border border-[#1a2540] rounded-2xl p-8 text-center"
      >
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i}
              animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.3 }}
              className="absolute rounded-full opacity-[0.06]"
              style={{
                width: 200 + i * 100, height: 200 + i * 100,
                background: `radial-gradient(circle, ${['#e8a87c', '#7c6af7', '#4ade80'][i]}, transparent)`,
                top: `${[10, 30, 50][i]}%`, left: `${[10, 50, 70][i]}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="relative w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #e8a87c20, #7c6af720)', border: '1px solid rgba(232,168,124,0.2)' }}>
          <Share2 className="w-7 h-7 text-[#e8a87c]" />
        </motion.div>

        <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#f0ece4] mb-3">
          Social <span className="gradient-rose font-semibold">Preview</span>
        </h1>
        <p className="text-[#8a93a8] max-w-lg mx-auto text-sm leading-relaxed">
          Em breve, gerencie todas as redes sociais dos seus clientes em um único lugar.
          Responda DMs, acompanhe comentários e publique conteúdo diretamente pelo CRM.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(232,168,124,0.1)', color: '#e8a87c', border: '1px solid rgba(232,168,124,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8a87c] pulse-dot" />
          Em desenvolvimento
        </div>
      </motion.div>

      {/* Platforms preview */}
      <div>
        <h2 className="text-sm font-semibold text-[#8a93a8] uppercase tracking-wider mb-4">Plataformas que serão integradas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLATFORMS.map((p, i) => (
            <motion.div key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="relative bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/2"
                style={{ background: `radial-gradient(circle, ${p.color}, transparent)` }} />

              <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                style={{ background: p.grad, boxShadow: `0 0 20px ${p.color}40` }}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-[#f0ece4] mb-1">{p.name}</h3>
              <p className="text-xs text-[#8a93a8] mb-3">{p.desc}</p>
              <div className="space-y-1">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-[#4a5568]">
                    <ArrowRight className="w-3 h-3" style={{ color: p.color, opacity: 0.7 }} /> {f}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}>
                Em breve
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming features */}
      <div>
        <h2 className="text-sm font-semibold text-[#8a93a8] uppercase tracking-wider mb-4">Funcionalidades planejadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {UPCOMING.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-[#0d1424] border border-[#1a2540] hover:border-[rgba(232,168,124,0.15)] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,168,124,0.08)', border: '1px solid rgba(232,168,124,0.15)' }}>
                <f.icon className="w-4 h-4 text-[#e8a87c]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f0ece4]">{f.title}</p>
                <p className="text-xs text-[#8a93a8] mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mockup */}
      <div className="bg-[#0d1424] border border-[#1a2540] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-4 h-4 text-[#e8a87c]" />
          <h3 className="text-sm font-semibold text-[#f0ece4]">Preview do Inbox Unificado</h3>
        </div>
        <div className="space-y-2">
          {[
            { platform: 'Instagram', name: 'Fernanda Oliveira', msg: 'Oi! Quando sai o próximo story? 😍', time: '2min', color: '#e1306c', unread: true },
            { platform: 'WhatsApp', name: 'Rafael Mendes', msg: 'Aprovei o vídeo, pode agendar!', time: '15min', color: '#25d366', unread: true },
            { platform: 'Facebook', name: 'Clínica Bella', msg: 'Perfeito! Amei o resultado', time: '1h', color: '#1877f2', unread: false },
            { platform: 'Instagram', name: 'Bruno Gastrô', msg: 'Que tal trazer uma nova proposta?', time: '3h', color: '#e1306c', unread: false },
          ].map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-not-allowed ${
                msg.unread ? 'border-[rgba(232,168,124,0.15)] bg-[rgba(232,168,124,0.03)]' : 'border-[#1a2540]'
              }`}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ background: msg.color }}>
                {msg.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#f0ece4]">{msg.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: `${msg.color}20`, color: msg.color }}>{msg.platform}</span>
                </div>
                <p className="text-xs text-[#8a93a8] truncate">{msg.msg}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-[#4a5568]">{msg.time}</span>
                {msg.unread && <span className="w-2 h-2 rounded-full bg-[#e8a87c]" />}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'rgba(6,9,18,0.0)' }} />
      </div>
    </div>
  )
}
