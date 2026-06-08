'use client'
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Topbar({ profile }: { profile: any }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const initials = profile?.admin_name ? profile.admin_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'A';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleRegisterSale = () => {
    if (pathname !== '/dashboard/ventas') {
        router.push('/dashboard/ventas');
    }
  };

  return (
    <header className="h-[56px] border-b border-[#222222] bg-[#111111] flex items-center justify-between px-6">
      <input 
        type="text" 
        placeholder="Buscar..." 
        className="max-w-[360px] w-full bg-[#161616] border border-[#222222] rounded-[20px] px-4 py-2 text-[13px] text-white placeholder-[#888]"
      />
      <div className="flex items-center gap-4">
        <button onClick={() => setIsUpgradeOpen(true)} className={`text-[12px] border px-2 py-1 rounded hover:text-white cursor-pointer ${profile?.pro_plan ? 'border-emerald-500 text-emerald-400' : 'border-[#888] text-[#888]'}`}>
            {profile?.pro_plan ? 'Plan Pro' : 'Plan Gratis'}
        </button>
        <button onClick={handleRegisterSale} className="relative overflow-hidden bg-white text-black font-bold text-[13px] px-4 py-2 rounded-[8px] transition-all hover:scale-105 active:scale-95">
          <span className="relative z-10">Registrar Venta</span>
          <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%)] bg-[length:200%_200%] animate-shimmer" />
        </button>

        <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black border-2 border-white">{initials}</button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-[#222222] rounded-[12px] shadow-xl py-2 text-[13px] z-50">
                    <button onClick={() => router.push('/dashboard/configuracion')} className="block w-full text-left px-4 py-2 text-white hover:bg-[#1a1a1a]">Mi Perfil</button>
                    <button onClick={() => router.push('/dashboard/configuracion')} className="block w-full text-left px-4 py-2 text-white hover:bg-[#1a1a1a]">Configuración</button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#1a1a1a]">Cerrar Sesión</button>
                </div>
            )}
        </div>
      </div>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </header>
  );
}

