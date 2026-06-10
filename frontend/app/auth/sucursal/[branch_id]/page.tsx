'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

export default function BranchLogin() {
    const { branch_id } = useParams()
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const router = useRouter()

    const handleLogin = async () => {
        const { data, error } = await supabase
            .from('branch_credentials')
            .select('*, branches(name)')
            .eq('branch_id', branch_id)
            .eq('username', credentials.username)
            .eq('password_hash', credentials.password)
            .single()

        if (data) {
            localStorage.setItem('activeBranch', branch_id as string)
            localStorage.setItem('userRole', 'sucursal') // Identificador simple de rol
            router.push('/dashboard')
        } else {
            alert("Credenciales incorrectas")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#080808]">
            <div className="bg-[#141414] p-8 rounded-xl border border-[#222] w-96">
                <h2 className="text-white font-bold mb-6 text-center">Acceso Sucursal</h2>
                <input className="block w-full p-3 bg-[#222] text-white rounded mb-3 border border-[#333]" placeholder="Usuario" onChange={e => setCredentials({...credentials, username: e.target.value})} />
                <input type="password" className="block w-full p-3 bg-[#222] text-white rounded mb-6 border border-[#333]" placeholder="Contraseña" onChange={e => setCredentials({...credentials, password: e.target.value})} />
                <button onClick={handleLogin} className="w-full bg-[#c8ff00] text-black font-bold p-3 rounded">Entrar</button>
            </div>
        </div>
    )
}
