'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { UpgradeModal } from '@/components/neto/UpgradeModal'

export default function ConsultorPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{role: 'user'|'neia', text: string}[]>([
    { role: 'neia', text: '¡Hola! Soy NEIA, tu consultora financiera. ¿En qué te ayudo con tus números hoy?' }
  ])
  const [loading, setLoading] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [limit, setLimit] = useState(4)

  useEffect(() => {
    async function fetchStatus() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase.from('profiles').select('pro_plan, daily_ai_requests, last_ai_request_date').eq('id', user.id).single()
        
        const today = new Date().toISOString().split('T')[0]
        const count = profile?.last_ai_request_date === today ? (profile?.daily_ai_requests || 0) : 0
        const userLimit = profile?.pro_plan ? 25 : 4
        
        setRequestCount(count)
        setLimit(userLimit)
    }
    fetchStatus()
  }, [])

  const suggestions = [
    {cat: 'MARGEN', q: '¿Qué producto me dejó más margen?', color: 'from-emerald-500/20 to-emerald-900/10'},
    {cat: 'STOCK', q: '¿Tengo productos con stock bajo?', color: 'from-red-500/20 to-red-900/10'},
    {cat: 'ADS', q: '¿Cuál es el canal de venta más rentable?', color: 'from-purple-500/20 to-purple-900/10'},
    {cat: 'RESUMEN', q: 'Dame un resumen de ventas de hoy.', color: 'from-blue-500/20 to-blue-900/10'},
  ]

  const sendQuery = async (text: string) => {
    if (!text.trim() || requestCount >= limit) return
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', text }])
    setQuestion('')
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const res = await fetch('https://backendneto-saa-c952g2s0f-tomasychristian-projects.vercel.app/api/ia/consultor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, userId: user?.id })
    })
    
    if (res.status === 429) {
      setLoading(false)
      setIsUpgradeOpen(true)
      return
    }

    const data = await res.json()
    setLoading(false)
    setMessages(prev => [...prev, { role: 'neia', text: data.answer }])
    setRequestCount(prev => prev + 1)
  }

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'neia' && lastMessage.text && lastMessage.text.length > 0) {
      let i = 0
      setDisplayedText('')
      const timer = setInterval(() => {
        setDisplayedText(prev => lastMessage.text.slice(0, i + 1));
        i++;
        if (i >= lastMessage.text.length) clearInterval(timer);
      }, 20)
      return () => clearInterval(timer)
    } else {
        setDisplayedText(lastMessage?.text || '');
    }
  }, [messages])

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden p-6 gap-6">
      <div className="w-[280px] p-6 bg-[#141414] rounded-[16px] border border-[#222222]">
        <h2 className="font-bold text-white mb-6 flex items-center gap-2">🤖 Sugerencias IA</h2>
        <div className="space-y-4">
            {suggestions.map((s, i) => (
                <div key={i} onClick={() => requestCount < limit && sendQuery(s.q)} className={`p-4 bg-gradient-to-r ${s.color} rounded-[12px] border border-white/5 hover:border-white/20 transition-all cursor-pointer group ${requestCount >= limit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>
                    <p className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">{s.cat}</p>
                    <p className="text-[13px] text-white font-medium transition-colors">{s.q}</p>
                </div>
            ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col bg-[#080808] rounded-[16px] border border-[#222222] p-6">
        <div className="flex-1 overflow-y-auto space-y-6">
            {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 items-start ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'neia' && (
                        <div className="relative w-12 h-12 overflow-hidden shrink-0">
                            <iframe src="/holographic-standalone.html?bg=transparent" className="w-full h-full" scrolling="no"/>
                        </div>
                    )}
                    <div className={`p-4 rounded-[16px] shadow-lg ${m.role === 'neia' ? 'bg-gradient-to-br from-[#1a1a1a] to-[#141414] text-white border border-[#222222] max-w-[70%]' : 'bg-[#c8ff00] text-black font-bold'}`}>
                        {m.role === 'neia' && i === messages.length - 1 ? displayedText : m.text}
                    </div>
                </div>
            ))}
            {loading && <div className="text-[#888] text-[12px] animate-pulse">NEIA está pensando...</div>}
        </div>
        
        <div className="mt-4 flex flex-col gap-2">
            {requestCount >= limit && (
                <p className="text-red-500 text-[12px] text-center animate-pulse">Límite alcanzado. ¡Pásate a Pro para análisis ilimitados! 🚀</p>
            )}
            <div className="flex gap-3">
                <input 
                    value={requestCount >= limit ? 'Límite alcanzado' : question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendQuery(question)}
                    disabled={requestCount >= limit}
                    className="flex-1 bg-[#1a1a1a] border border-[#222222] rounded-[12px] p-4 text-white focus:outline-none focus:border-[#c8ff00] transition-all disabled:opacity-50" 
                    placeholder="Escribe tu consulta..." 
                />
                <button 
                    onClick={() => sendQuery(question)} 
                    disabled={requestCount >= limit}
                    className="bg-white text-black font-bold px-6 py-2 rounded-[12px] hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                    Enviar
                </button>
            </div>
        </div>
        <p className="text-[12px] text-[#555] text-center mt-3">⚡ Respuesta Ultra Rápida  ◉ {requestCount}/{limit} consultas hoy</p>
      </div>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </div>
  );
}
