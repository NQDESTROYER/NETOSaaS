'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Edit2, Trash2, CheckCircle, XCircle, PlusCircle, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBranch } from '@/hooks/useBranch'

export default function DashboardPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [branchForm, setBranchForm] = useState({ name: '', address: '', manager_name: '', phone: '', username: '', password: '' })
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
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

    const toggleBranchStatus = async (id: string, currentStatus: boolean) => {
        await supabase.from('branches').update({ is_active: !currentStatus }).eq('id', id)
        window.location.reload()
    }

    const createBranch = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !branchForm.name) return
        
        const { error } = await supabase.rpc('create_branch', {
            p_profile_id: user.id,
            p_name: branchForm.name,
            p_address: branchForm.address,
            p_manager_name: branchForm.manager_name,
            p_phone: branchForm.phone
        })
        
        if (error) alert("Error al crear sucursal")
        else {
            setIsCreating(false)
            setBranchForm({ name: '', address: '', manager_name: '', phone: '', username: '', password: '' })
            window.location.reload()
        }
    }

    const deleteBranch = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta sucursal?")) return
        await supabase.from('branches').delete().eq('id', id)
        window.location.reload()
    }

    if (loading) return <div className="p-8 text-white">Cargando...</div>

    return (
        <div className="p-8 space-y-6 text-white max-w-7xl mx-auto">
            {/* ... (Header y métricas previas) ... */}

                        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}} className="bg-[#141414] border border-[#222] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-300">Gestión de Sucursales</h3>
                    <button onClick={() => setIsCreating(!isCreating)} className="bg-[#c8ff00] text-black font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <PlusCircle size={16} /> {isCreating ? 'Cancelar' : 'Nueva Sucursal'}
                    </button>
                </div>

                {isCreating && (
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#222]">
                        <input placeholder="Nombre" className="p-2 bg-[#222] rounded border border-[#333]" onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                        <input placeholder="Dirección" className="p-2 bg-[#222] rounded border border-[#333]" onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                        <input placeholder="Encargado" className="p-2 bg-[#222] rounded border border-[#333]" onChange={e => setBranchForm({...branchForm, manager_name: e.target.value})} />
                        <input placeholder="Teléfono" className="p-2 bg-[#222] rounded border border-[#333]" onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
                        <button onClick={createBranch} className="col-span-2 bg-[#c8ff00] text-black font-bold p-2 rounded flex items-center justify-center gap-2">
                            <Save size={16} /> Guardar Sucursal
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {branches.map((b: any) => (
                        <div key={b.id} className={`p-4 rounded-lg border ${b.is_active ? 'border-[#222] bg-[#1a1a1a]' : 'border-red-900 bg-red-950/20'} relative`}>
                            <div className="flex justify-between items-start">
                                <p className="font-bold">{b.name}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleBranchStatus(b.id, b.is_active)}>
                                        {b.is_active ? <CheckCircle size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}
                                    </button>
                                    <button onClick={() => deleteBranch(b.id)}>
                                        <Trash2 size={16} className="text-red-400 hover:text-red-600"/>
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">{b.address}</p>
                            <p className="text-xs text-gray-500 mt-1">Encargado: {b.manager_name}</p>
                            <div className="mt-4 flex items-center justify-between bg-[#222] p-2 rounded text-[10px]">
                                <span>User: admin_{b.name.toLowerCase().replace(/\s/g,'')}</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono">{visiblePasswords[b.id] ? 'password123' : '*******'}</span>
                                    <button onClick={() => setVisiblePasswords({...visiblePasswords, [b.id]: !visiblePasswords[b.id]})}>
                                        {visiblePasswords[b.id] ? <EyeOff size={12}/> : <Eye size={12}/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
