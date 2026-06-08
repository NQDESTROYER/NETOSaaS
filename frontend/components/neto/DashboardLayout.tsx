import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#f0f0f0] font-sans">
      {/* Sidebar - exact mapping from HTML */}
      <aside className="w-[200px] min-w-[200px] bg-[#111] border-r border-[#222] flex flex-col z-10">
        <div className="p-6 border-b border-[#222]">
          <div className="text-[18px] font-extrabold tracking-tighter text-white">NETO</div>
          <div className="text-[10px] text-[#555] uppercase tracking-[1px] mt-[2px]">Micro-Entrepreneur Pro</div>
        </div>
        
        <nav className="flex-1 py-3">
          {[
            { name: 'Dashboard', icon: '📊', id: 'dashboard' },
            { name: 'Inventario', icon: '📦', id: 'inventario' },
            { name: 'Ventas', icon: '💰', id: 'ventas' },
            { name: 'Consultor IA', icon: '🤖', id: 'consultor' },
            { name: 'WhatsApp Bot', icon: '💬', id: 'whatsapp' },
            { name: 'Configuración', icon: '⚙️', id: 'config' },
          ].map((item) => (
            <Link key={item.id} href={`/app/dashboard?view=${item.id}`} className={`flex items-center gap-3 px-5 py-3 text-[13px] font-medium text-[#888] hover:bg-[#161616] hover:text-white transition-all border-l-4 border-transparent ${item.id === 'dashboard' ? 'bg-[#161616] text-white border-l-[#c8ff00]' : ''}`}>
              <span className="opacity-70">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#222]">
          <button className="w-full bg-[#c8ff00] text-black font-bold text-[12px] rounded-lg py-2 hover:bg-[#a8d400] transition-colors">Upgrade to Premium</button>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1c1c1c] flex items-center justify-center text-[11px] font-bold text-[#888]">A</div>
            <div>
              <div className="text-[12px] font-semibold text-white">Alex Rivera</div>
              <div className="text-[10px] text-[#555]">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[56px] border-b border-[#222] flex items-center px-6 gap-3 bg-[#0a0a0a] flex-shrink-0">
          <div className="relative flex-1 max-w-[360px]">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555]">⌕</span>
            <input 
              type="text" 
              placeholder="Buscar productos o ventas..." 
              className="w-full bg-[#161616] border border-[#222] rounded-full px-4 py-2 pl-9 text-[13px] text-white outline-none focus:border-[#2a2a2a]"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="w-[34px] h-[34px] border border-[#222] rounded-lg text-[#888] hover:text-white transition-colors">🔔</button>
            <div className="border border-[#888] rounded-md px-2 py-1 text-[12px] font-semibold text-white">Pro Plan</div>
            <button className="bg-white text-black font-bold rounded-lg px-4 py-2 text-[13px] hover:bg-[#e8e8e8]">Registrar Venta</button>
            <div className="w-[32px] h-[32px] rounded-full bg-[#333] overflow-hidden" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
