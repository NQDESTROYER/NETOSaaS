import Link from 'next/link';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';

export default function Sidebar({ profile }: { profile: any }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const initials = profile?.admin_name ? profile.admin_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'A';

  return (
    <aside className="w-[200px] bg-[#111111] border-r border-[#222222] h-screen flex flex-col justify-between p-4">
      <div>
        <div className="mb-8">
          <h1 className="text-white font-bold text-[18px]">NETO</h1>
          <p className="text-[10px] text-[#888] uppercase">Micro-Entrepreneur Pro</p>
        </div>
        <nav className="flex flex-col gap-2">
          {['Dashboard', 'Inventario', 'Ventas', 'Consultor IA'].map((item) => (
            <Link 
              key={item}
              href={item === 'Dashboard' ? '/dashboard' : `/dashboard/${item.toLowerCase().replace(' ', '-')}`}
              className="px-4 py-2 text-[13px] text-[#888] rounded hover:bg-[#161616] flex items-center gap-2"
            >
              {item}
            </Link>
          ))}
          <div className="mt-6 px-4 py-2 text-[13px] text-[#888] cursor-not-allowed flex items-center gap-2">
            WhatsApp Bot <span className="text-[9px] text-[#555] bg-[#1a1a1a] px-1 rounded">Próximamente</span>
          </div>
        </nav>
      </div>
      
      <div className="flex flex-col gap-4">
        <button onClick={() => setIsUpgradeOpen(true)} className="bg-[#c8ff00] text-[#000] font-bold text-[13px] py-2 rounded">
          Activar Plan Pro
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[12px] border border-white/10">{initials}</div>
          <div className="truncate">
            <p className="text-[13px] text-white truncate">{profile?.admin_name}</p>
            <p className="text-[10px] text-[#888] truncate">{profile?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </aside>
  );
}
