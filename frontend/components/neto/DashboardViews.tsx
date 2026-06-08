import { useState } from 'react';

// --- Dashboard Sub-views ---

export function DashboardView({ stats }: { stats: any }) {
  const progress = Math.min((stats.monthlyProfit / stats.goal) * 100, 100);
  return (
    <div className="space-y-5">
      {/* Progreso Mensual */}
      <div className="bg-[#111] border border-[#222] rounded-[14px] p-7">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#555] mb-1">Progreso Mensual</div>
            <div className="text-[14px] text-[#888]">Meta Mensual de Ganancia</div>
          </div>
          <div className="text-right">
            <div className="text-[32px] font-extrabold tracking-[-1px] text-white">
              ${stats.monthlyProfit.toLocaleString('es-CL')} 
              <span className="text-[16px] font-normal text-[#888]"> / ${stats.goal.toLocaleString('es-CL')} CLP</span>
            </div>
          </div>
        </div>
        <div className="bg-[#1e1e1e] rounded-full h-[10px] overflow-hidden mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-[#8aee00] to-[#e8ff80] transition-all duration-1000" style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(200,255,0,.4)' }} />
        </div>
        <div className="flex justify-between text-[12px] text-[#555]">
          <span>{progress.toFixed(0)}% de la meta alcanzada</span>
          <span>Faltan ${(stats.goal - stats.monthlyProfit).toLocaleString('es-CL')} CLP</span>
        </div>
      </div>
      {/* ... other metrics ... */}
    </div>
  );
}

export function InventarioView() {
  return <div className="text-white">Inventario Content...</div>;
}

export function VentasView() {
  return <div className="text-white">Ventas Content...</div>;
}

export function ConsultoriaView() {
  return <div className="text-white">Consultor IA Content...</div>;
}
