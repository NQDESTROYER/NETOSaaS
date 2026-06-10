'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'

const AnimatedNumber = ({ value, prefix='$', duration=800 }: { value: number, prefix?: string, duration?: number }) => {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
        const start = Date.now()
        const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setDisplay(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    }, [value, duration])
    return <span>{prefix}{display.toLocaleString('es-CL')}</span>
}

export default function DashboardPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const [sales, products, profile] = await Promise.all([
                supabase.from('sales').select('*').order('created_at', { ascending: true }),
                supabase.from('products').select('*'),
                supabase.from('profiles').select('*').eq('id', user.id).single()
            ])
            setData({ sales: sales.data, products: products.data, profile: profile.data })
            setLoading(false)
        }
        fetchData()
    }, [])

    const computed = useMemo(() => {
        if (!data) return null
        const { sales, products, profile } = data
        const now = new Date()
        const currentMonth = now.getMonth()
        
        const monthlySalesArr = Array.from({length: 12}, (_, i) => 
            sales.filter((s:any) => new Date(s.created_at).getMonth() === i)
                 .reduce((acc:number, s:any) => acc + Number(s.total_amount), 0)
        )
        const totalSalesMonth = monthlySalesArr[currentMonth]
        const monthlyMeta = profile.monthly_revenue_goal || 1200000
        
        return { totalSalesMonth, monthlyMeta, monthlySalesArr }
    }, [data])

    if (loading) return <div className="p-8 text-white">Cargando...</div>
    if (!data.sales || data.sales.length === 0) return (
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center py-20 text-white">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">¡Tu negocio está listo para despegar!</h2>
            <button onClick={()=>router.push('/dashboard/ventas')} className="bg-[#c8ff00] text-black font-bold px-6 py-3 rounded-lg">Registrar primera venta →</button>
        </motion.div>
    )

    const { totalSalesMonth, monthlyMeta, monthlySalesArr } = computed!
    
    return (
        <div className="p-8 space-y-6 text-white max-w-7xl mx-auto">
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
                <h1 className="text-[26px] font-extrabold tracking-tighter">Bienvenido 👋</h1>
            </motion.div>
            
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.05}}>
                <div className="bg-[#141414] border border-[#222] rounded-xl p-6">
                    <div className="flex justify-between mb-2 text-sm text-gray-400">
                        <span>Progreso Mensual</span>
                        <span className="font-bold text-[#c8ff00]">{Math.round((totalSalesMonth/monthlyMeta)*100)}%</span>
                    </div>
                    <div className="h-3.5 bg-[#222] rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${Math.min((totalSalesMonth/monthlyMeta)*100, 100)}%`}} className="h-full bg-gradient-to-r from-[#8aee00] to-[#c8ff00] shadow-[0_0_15px_rgba(200,255,0,0.4)]" />
                    </div>
                </div>
            </motion.div>

            <div className="bg-[#141414] border border-[#222] rounded-xl p-6">
                <h3 className="font-bold mb-4 text-gray-300">Tendencia de Ventas (Año)</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((month, i) => ({month, total: monthlySalesArr[i]}))}>
                        <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8ff00" stopOpacity={0.35}/><stop offset="100%" stopColor="#c8ff00" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="month" stroke="#555" fontSize={12} />
                        <YAxis stroke="#555" fontSize={12} tickFormatter={v => `$${v/1000}k`} />
                        <Tooltip contentStyle={{background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8}} />
                        <Area type="monotone" dataKey="total" stroke="#c8ff00" strokeWidth={2} fill="url(#areaGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
