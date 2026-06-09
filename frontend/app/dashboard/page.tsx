'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'

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

const SkeletonCard = () => (
    <div className="border border-[#222] bg-[#141414] rounded-[12px] p-5 h-32 animate-pulse" />
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
    
    const monthlyTrends = Array.from({length: 12}, (_, i) => {
        return sales.filter((s:any) => new Date(s.created_at).getMonth() === i)
                    .reduce((acc:number, s:any) => acc + Number(s.total_amount), 0)
    })

    const projection = linearRegression(monthlyTrends)
    
    return { totalSalesMonth, monthlyMeta, dailyBilling, lowStock, monthlyTrends, projection, aiTokens: profile.ia_tokens_used || 0, aiLimit: profile.ia_tokens_limit || 4 }
  }, [data])

  if (loading) return (
    <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-[#141414] animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
    </div>
  )

  const { totalSalesMonth, monthlyMeta, dailyBilling, lowStock, monthlyTrends, projection, aiTokens, aiLimit } = computedData!

  const SectionWrapper = ({children, index}: {children: React.ReactNode, index: number}) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
        {children}
    </motion.div>
  )

  return (
    <div className="p-8 space-y-5 text-white">
        {error && <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 p-4 rounded text-white">{error}</div>}
        
        <SectionWrapper index={0}>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        </SectionWrapper>

        {/* Sección 1: Progreso Mensual */}
        <SectionWrapper index={1}>
            <div className="border border-[#222] bg-[#141414] rounded-[12px] p-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold">Progreso Mensual</h2>
                    <span>{Math.round((totalSalesMonth/monthlyMeta)*100)}%</span>
                </div>
                <div className="w-full bg-[#222] h-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalSalesMonth/monthlyMeta)*100, 100)}%` }} className="h-full bg-gradient-to-r from-[#8aee00] to-[#c8ff00]" />
                </div>
                <p className="text-sm text-gray-400 mt-2">Faltan ${(monthlyMeta - totalSalesMonth).toLocaleString('es-CL')} CLP</p>
            </div>
        </SectionWrapper>

        {/* Sección 2: Métricas Grid */}
        <div className="grid grid-cols-4 gap-4">
            <SectionWrapper index={2}><div className="bg-[#141414] border border-[#222] rounded-xl p-5">Facturación día: ${dailyBilling.toLocaleString('es-CL')}</div></SectionWrapper>
            <SectionWrapper index={3}><div className="bg-[#141414] border border-[#222] rounded-xl p-5">Stock bajo: {lowStock.length}</div></SectionWrapper>
            <SectionWrapper index={4}><div className="bg-[#141414] border border-[#222] rounded-xl p-5">IA: {aiTokens}/{aiLimit}</div></SectionWrapper>
            <SectionWrapper index={5}><div className="bg-[#141414] border border-[#222] rounded-xl p-5">Ticket prom.</div></SectionWrapper>
        </div>

        {/* Sección 3 & 4: Tendencia y Proyección */}
        <div className="grid grid-cols-3 gap-4">
            <SectionWrapper index={6}>
                <div className="col-span-2 bg-[#141414] border border-[#222] rounded-xl p-6">
                    <h3 className="font-bold mb-4">Tendencia de Ventas (Año)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={monthlyTrends.map((v,i) => ({name: i, v}))}>
                            <defs>
                                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#c8ff00" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#c8ff00" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#555" />
                            <YAxis stroke="#555" tickFormatter={v => `$${v/1000}k`} />
                            <Tooltip contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#222'}} />
                            <Area type="monotone" dataKey="v" stroke="#c8ff00" fill="url(#colorV)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </SectionWrapper>
            <SectionWrapper index={7}>
                <div className="col-span-1 bg-[#141414] border border-[#222] rounded-xl p-6">
                    <h3 className="font-bold mb-2">Proyección 🔮</h3>
                    <p className="text-3xl text-[#c8ff00] font-bold">${projection.toLocaleString('es-CL')}</p>
                </div>
            </SectionWrapper>
        </div>
    </div>
  )
}
