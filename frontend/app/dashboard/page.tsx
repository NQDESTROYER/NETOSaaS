'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import { useBranch } from '@/hooks/useBranch'

export default function DashboardPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [branchForm, setBranchForm] = useState({ name: '', address: '', manager_name: '', phone: '' })
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

    const createBranch = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const { data, error } = await supabase.rpc('create_branch', {
            p_profile_id: user.id,
            p_name: branchForm.name,
            p_address: branchForm.address,
            p_manager_name: branchForm.manager_name,
            p_phone: branchForm.phone
        })
        
        if (error) alert("Error al crear sucursal")
        else {
            alert("Sucursal creada")
            setIsCreating(false)
            window.location.reload()
        }
    }

    if (loading) return <div className="p-8 text-white">Cargando...</div>

    return (
        <div className="p-8 space-y-6 text-white max-w-7xl mx-auto">
            {/* ... (Header y métricas previas) ... */}

            {/* SECCIÓN GESTIÓN DE SUCURSALES Y CREACIÓN */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}} className="bg-[#141414] border border-[#222] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-300">Gestión de Sucursales</h3>
                    <button onClick={() => setIsCreating(!isCreating)} className="bg-[#c8ff00] text-black font-bold px-4 py-2 rounded-lg text-sm">
                        {isCreating ? 'Cancelar' : '+ Nueva Sucursal'}
                    </button>
                </div>

                {isCreating && (
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#1a1a1a] rounded-lg">
                        <input placeholder="Nombre" className="p-2 bg-[#222] rounded" onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                        <input placeholder="Dirección" className="p-2 bg-[#222] rounded" onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                        <input placeholder="Encargado" className="p-2 bg-[#222] rounded" onChange={e => setBranchForm({...branchForm, manager_name: e.target.value})} />
                        <input placeholder="Teléfono" className="p-2 bg-[#222] rounded" onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
                        <button onClick={createBranch} className="col-span-2 bg-[#c8ff00] text-black font-bold p-2 rounded">Guardar Sucursal</button>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    {branches.map((b: any) => (
                        <div key={b.id} className="p-4 rounded-lg border border-[#222] bg-[#1a1a1a]">
                            <p className="font-bold">{b.name}</p>
                            <p className="text-xs text-gray-400">{b.address}</p>
                            <p className="text-xs text-gray-500 mt-1">Encargado: {b.manager_name}</p>
                            <div className="mt-4 text-[10px] bg-[#222] p-2 rounded break-all">
                                Link de registro: {window.location.origin}/auth/sucursal/{b.id}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
