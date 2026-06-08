'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { MetricSkeleton } from '@/components/neto/Skeletons'

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    totalSales: 0, dailyBilling: 0, lowStock: 0, totalProducts: 0, 
    monthlyMeta: 0, dailyAiRequests: 0, proPlan: false, monthlySales: [] as number[] 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return;
        
        const { data: profile } = await supabase.from('profiles').select('monthly_revenue_goal, daily_ai_requests, pro_plan').eq('id', user.id).single()
        const monthlyMeta = profile?.monthly_revenue_goal || 0
        const dailyAiRequests = profile?.daily_ai_requests || 0
        const proPlan = profile?.pro_plan || false

        const { data: sales } = await supabase.from('sales').select('total_amount, created_at').eq('user_id', user.id)
        const totalSales = sales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0
        
        // Ventas por mes para el gráfico (enero-diciembre)
        const monthlySales = Array(12).fill(0);
        sales?.forEach(s => {
            const month = new Date(s.created_at).getMonth();
            monthlySales[month] += Number(s.total_amount);
        });

        const today = new Date().toISOString().split('T')[0]
        const { data: dailySales } = await supabase.from('sales').select('total_amount').eq('user_id', user.id).gte('created_at', today)
        const dailyBilling = dailySales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0
        
        const { data: products } = await supabase.from('products').select('stock').eq('user_id', user.id)
        const totalProducts = products?.length || 0
        const lowStock = products?.filter(p => p.stock < 5).length || 0
        
        setStats({ totalSales, dailyBilling, lowStock, totalProducts, monthlyMeta, dailyAiRequests, proPlan, monthlySales })
        setLoading(false)
    }
    fetchData()
  }, [])

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }
  const cardClass = "border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 p-6 rounded-[16px]";

  const maxSales = Math.max(...stats.monthlySales, 1000);
  const chartPoints = stats.monthlySales.map(v => (v / maxSales) * 100);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 lg:p-8">
      <motion.h1 variants={item} className="text-[20px] font-bold text-white flex items-center gap-2">📊 Dashboard</motion.h1>
      
      {/* Progress Card */}
      {loading ? <MetricSkeleton /> : (
        <motion.div variants={item} className={cardClass + " relative group"}>
            {/* ... (código existente del progreso) ... */}
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-5 gap-4">
            <div>
                <p className="text-[11px] font-semibold tracking-widest text-[#555] uppercase mb-1">PROGRESO MENSUAL</p>
                <p className="text-[14px] text-[#888]">Meta Mensual de Ganancia</p>
            </div>
            <div className="text-left md:text-right relative">
                <span className="text-[28px] md:text-[32px] font-extrabold tracking-tighter text-white">${stats.totalSales.toLocaleString()} </span>
                <span className="text-[14px] md:text-[16px] text-[#888]">/ ${stats.monthlyMeta.toLocaleString()} CLP</span>
            </div>
            </div>
            <div className="w-full h-[10px] bg-black/40 rounded-[99px] mb-3 overflow-hidden">
                <div style={{ width: `${stats.monthlyMeta > 0 ? Math.min((stats.totalSales / stats.monthlyMeta) * 100, 100) : 0}%` }} className="h-full rounded-[99px] bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
            </div>
        </motion.div>
      )}

      {/* Gráfico de Ventas Anual */}
      <motion.div variants={item} className={cardClass}>
        <h3 className="text-white font-bold mb-6">Tendencia de Ventas (Año)</h3>
        <div className="flex items-end justify-between h-[150px] gap-2">
            {chartPoints.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#1a1a1a] rounded-t-lg relative" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-t-lg"/>
                    </div>
                    <span className="text-[10px] text-[#555] uppercase">{['E','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                </div>
            ))}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={item} className={cardClass}>
           {/* ... (Facturación diaria igual) ... */}
        </motion.div>
        
        <motion.div variants={item} className={cardClass + " flex flex-col items-center justify-center gap-3"}>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="#222" strokeWidth="8" fill="none" />
                <circle cx="40" cy="40" r="36" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="226" strokeDashoffset={stats.proPlan ? 0 : 226 - (stats.dailyAiRequests / 4) * 226} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-extrabold text-[20px] text-white">
                {stats.proPlan ? '∞' : `${stats.dailyAiRequests}/4`}
            </div>
          </div>
          <button className="bg-neutral-800 border border-neutral-700 text-white rounded-[8px] px-5 py-2 text-[12px] font-semibold hover:bg-emerald-500 hover:text-black transition-all">
            Nueva Consulta
          </button>
        </motion.div>
        {/* ... (resto igual) ... */}
      </div>
    </motion.div>
  )
}
