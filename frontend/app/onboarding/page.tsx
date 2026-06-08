'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [formData, setFormData] = useState({ name: '', business: '', rubro: '', goal: '', currency: 'CLP' });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
        admin_name: formData.name,
        business_name: formData.business,
        monthly_revenue_goal: formData.goal,
        currency: formData.currency,
        onboarding_completed: true
    }).eq('id', user.id);

    if (error) toast.error('Error al guardar datos');
    else router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-[#141414] p-8 rounded-[24px] border border-[#222222] w-full max-w-[450px] space-y-4">
        <h1 className="text-2xl font-bold text-white mb-6">Bienvenido a NETO 🚀</h1>
        <input placeholder="Nombre del Administrador" className="w-full bg-[#1a1a1a] border border-[#222222] p-3 rounded-[8px] text-white" onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input placeholder="Nombre de tu negocio" className="w-full bg-[#1a1a1a] border border-[#222222] p-3 rounded-[8px] text-white" onChange={e => setFormData({...formData, business: e.target.value})} required />
        <input placeholder="Rubro" className="w-full bg-[#1a1a1a] border border-[#222222] p-3 rounded-[8px] text-white" onChange={e => setFormData({...formData, rubro: e.target.value})} required />
        <input type="number" placeholder="Meta Mensual (CLP)" className="w-full bg-[#1a1a1a] border border-[#222222] p-3 rounded-[8px] text-white" onChange={e => setFormData({...formData, goal: e.target.value})} required />
        <button type="submit" className="w-full bg-[#c8ff00] text-black font-bold py-3 rounded-[8px] hover:bg-[#a8ff00]">Comenzar</button>
      </form>
    </div>
  );
}
