'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, useAnimation } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'

// Componente para contador animado
const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0)
    useEffect(() => {
        let start = 0
        const duration = 800
        const startTime = performance.now()
        const update = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setDisplayValue(Math.floor(value * easeOutQuart))
            if (progress < 1) requestAnimationFrame(update)
        }
        requestAnimationFrame(update)
    }, [value])
    return <span>{displayValue.toLocaleString('es-CL')}</span>
}

function linearRegression(data: number[]): number {
  const n = data.length
  if (n < 2) return data[data.length - 1] ?? 0
  const x = Array.from({length: n}, (_, i) => i)
  const sumX = x.reduce((a,b) => a+b, 0)
  const sumY = data.reduce((a,b) => a+b, 0)
  const sumXY = x.reduce((s,xi,i) => s + xi*data[i], 0)
  const sumX2 = x.reduce((s,xi) => s + xi*xi, 0)
  const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
  const intercept = (sumY - slope*sumX) / n
  return Math.max(0, Math.round(slope * n + intercept))
}

const SkeletonCard = ({ height }: { height: number }) => (
    <div className="animate-pulse rounded-xl bg-[#141414] border border-[#222]" style={{ height: `${height}px` }} />
)

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return;
            
            const [
                { data: sales, error: sErr },
                { data: products, error: pErr },
                { data: profile, error: prErr }
            ] = await Promise.all([
                supabase.from('sales').select('*').order('created_at', { ascending: true }),
                supabase.from('products').select('*'),
                supabase.from('profiles').select('*').eq('id', user.id).single()
            ])

            if (sErr || pErr || prErr) throw new Error("Error cargando datos")

            setData({ sales, products, profile })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }
    fetchData()
  }, [])

  const computedData = useMemo(() => {
    if (!data) return null
    const { sales, products, profile } = data
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const todayStr = now.toISOString().split('T')[0]
    
    const monthlySales = sales.filter((s:any) => new Date(s.created_at).getMonth() === currentMonth)
    const totalSalesMonth = monthlySales.reduce((acc:number, s:any) => acc + Number(s.total_amount), 0)
    const monthlyMeta = profile.monthly_revenue_goal || 1200000
    
    const dailySales = sales.filter((s:any) => s.created_at.split('T')[0] === todayStr)
    const dailyBilling = dailySales.reduce((acc:number, s:any) => acc + Number(s.total_amount), 0)
    
    const lowStock = products.filter((p:any) => p.stock <= (p.stock_min || 5))
    
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const monthlyTrends = monthNames.map((_, i) => {
        return sales.filter((s:any) => new Date(s.created_at).getMonth() === i)
                    .reduce((acc:number, s:any) => acc + Number(s.total_amount), 0)
    })

    const projection = linearRegression(monthlyTrends)
    
    return { 
        totalSalesMonth, monthlyMeta, dailyBilling, lowStock, monthlyTrends, 
        projection, aiTokens: profile.ia_tokens_used || 0, aiLimit: profile.ia_tokens_limit || 4 
    }
  }, [data])

  if (loading) return (
    <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-[#141414] animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} height={140} />)}
        </div>
    </div>
  )

  const { totalSalesMonth, monthlyMeta, dailyBilling, lowStock, monthlyTrends, projection, aiTokens, aiLimit } = computedData!
  const now = new Date()

  return (
    <div className="p-8 space-y-5 text-white">
        {error && <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 p-4 rounded text-white">{error}</div>}
        
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">Resumen al {now.getDate()} de {now.toLocaleString('es-CL', { month: 'long' })} de {now.getFullYear()}</p>
        </motion.div>

        {/* Sección 1: Progreso Mensual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.07 }}>
            <div className="border border-[#222] bg-[#141414] rounded-[12px] p-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-gray-400">Progreso Mensual</h2>
                    <span className="text-[#c8ff00] font-bold">{Math.round((totalSalesMonth/monthlyMeta)*100)}%</span>
                </div>
                <div className="w-full bg-[#222] h-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalSalesMonth/monthlyMeta)*100, 100)}%` }} className="h-full bg-gradient-to-r from-[#8aee00] to-[#c8ff00] shadow-[0_0_10px_rgba(200,255,0,0.5)]" />
                </div>
                <p className="text-sm text-gray-400 mt-2">Faltan ${(monthlyMeta - totalSalesMonth).toLocaleString('es-CL')} CLP</p>
            </div>
        </motion.div>

        {/* Sección 2: Métricas Grid */}
        <div className="grid grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }} className="bg-[#141414] border border-[#222] rounded-xl p-5">
                <p className="text-gray-500 text-xs">Facturación Diaria</p>
                <p className="text-2xl font-bold">$<AnimatedNumber value={dailyBilling} /></p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.21 }} className="bg-[#141414] border border-[#222] rounded-xl p-5">
                <p className="text-gray-500 text-xs">Stock Bajo</p>
                <p className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-red-500 animate-pulse' : 'text-[#a8ff00]'}`}>{lowStock.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }} className="bg-[#141414] border border-[#222] rounded-xl p-5">
                <p className="text-gray-500 text-xs">Consultas IA</p>
                <div className="relative w-12 h-12">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="#222" strokeWidth="4" fill="none" />
                        <circle cx="24" cy="24" r="20" stroke={aiTokens >= aiLimit ? '#ff4444' : '#c8ff00'} strokeWidth="4" fill="none" strokeDasharray={`${(aiTokens/aiLimit)*125} 125`} />
                    </svg>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="bg-[#141414] border border-[#222] rounded-xl p-5">
                <p className="text-gray-500 text-xs">Ticket Promedio</p>
            </motion.div>
        </div>

        {/* Sección 3 & 4: Tendencia y Proyección */}
        <div className="grid grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.42 }} className="col-span-2 bg-[#141414] border border-[#222] rounded-xl p-6">
                <h3 className="font-bold mb-4 text-gray-300">Tendencia de Ventas (Año)</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyTrends.map((v,i) => ({month: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][i], v}))}>
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#c8ff00" stopOpacity={0.35}/>
                                <stop offset="100%" stopColor="#c8ff00" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="month" stroke="#555" fontSize={12} />
                        <YAxis stroke="#555" fontSize={12} tickFormatter={v => `$${v/1000}k`} />
                        <Tooltip contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#222', borderRadius: 8}} />
                        <Area type="monotone" dataKey="v" stroke="#c8ff00" strokeWidth={2} fill="url(#areaGrad)" activeDot={{ r:5, fill:'#c8ff00', stroke:'#0a0a0a', strokeWidth:2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.49 }} className="col-span-1 bg-[#141414] border border-[#222] rounded-xl p-6">
                <h3 className="font-bold mb-2 text-gray-300">Proyección 🔮</h3>
                <p className="text-4xl text-[#c8ff00] font-extrabold">$<AnimatedNumber value={projection} /></p>
            </motion.div>
        </div>
    </div>
  )
}
