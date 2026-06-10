'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import { useBranch } from '@/hooks/useBranch'

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
    const { branches, activeBranch, setActiveBranch } = useBranch()

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
        
        // Filtramos datos según la sucursal activa si no es "Todas" (puedes implementar lógica aquí)
        const activeSales = activeBranch ? sales.filter((s:any) => s.branch_id === activeBranch) : sales

        const now = new Date()
        const currentMonth = now.getMonth()
        
        const monthlySalesArr = Array.from({length: 12}, (_, i) => 
            activeSales.filter((s:any) => new Date(s.created_at).getMonth() === i)
                 .reduce((acc:number, s:any) => acc + Number(s.total_amount), 0)
        )
        const totalSalesMonth = monthlySalesArr[currentMonth]
        const monthlyMeta = profile.monthly_revenue_goal || 1200000
        
        return { totalSalesMonth, monthlyMeta, monthlySalesArr }
    }, [data, activeBranch])

    if (loading) return <div className="p-8 text-white">Cargando...</div>
    
    // ... (rest of the component) ...

    return (
        <div className="p-8 space-y-6 text-white max-w-7xl mx-auto">
            {/* ... (Header y Secciones Previas) ... */}
            
            {/* NUEVA SECCIÓN: GESTIÓN DE SUCURSALES */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}} className="bg-[#141414] border border-[#222] rounded-xl p-6">
                <h3 className="font-bold mb-4 text-gray-300">Gestión de Sucursales</h3>
                <div className="grid grid-cols-3 gap-4">
                    {branches.map((b: any) => (
                        <button 
                            key={b.id}
                            onClick={() => setActiveBranch(b.id)}
                            className={`p-4 rounded-lg border ${activeBranch === b.id ? 'border-[#c8ff00] bg-[#1a2a00]' : 'border-[#222] bg-[#1a1a1a]'}`}
                        >
                            <p className="font-bold">{b.name}</p>
                            <p className="text-xs text-gray-400">{b.address}</p>
                        </button>
                    ))}
                    <button className="p-4 rounded-lg border border-dashed border-[#444] text-gray-400 hover:border-[#c8ff00] hover:text-[#c8ff00]">
                        + Nueva Sucursal
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
