'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function ConfiguracionPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [goal, setGoal] = useState('');
  
  // Feedback states
  const [feedbackType, setFeedbackType] = useState('Reportar un problema');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
        setGoal(profileData.monthly_revenue_goal || '');
      }
    }
    loadData();
  }, []);

  async function updateGoal() {
    const { error } = await supabase
      .from('profiles')
      .update({ monthly_revenue_goal: Number(goal) })
      .eq('id', user?.id);
      
    if (error) toast.error('Error al actualizar');
    else toast.success('Meta actualizada');
  }

  async function sendFeedback(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from('user_feedback').insert({
        user_id: user.id,
        feedback_type: feedbackType,
        message
    });

    if (error) toast.error('Error al enviar feedback');
    else {
        toast.success('¡Gracias por tu aporte! Nuestro equipo lo revisará pronto.');
        setMessage('');
    }
    setSending(false);
  }

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-white">⚙️ Configuración</h1>
      
      <div className="bg-[#141414] p-6 rounded-[16px] border border-[#222222] space-y-4">
        <h2 className="text-white font-bold">Perfil de Usuario</h2>
        <p className="text-[#888]">Nombre: {profile?.admin_name || 'No definido'}</p>
        <p className="text-[#888]">Rol: {profile?.role || 'Admin'}</p>
        <p className="text-[#888]">Email: {user?.email || 'No disponible'}</p>
      </div>

      <div className="bg-[#141414] p-6 rounded-[16px] border border-[#222222] space-y-4">
        <h2 className="text-white font-bold">Preferencias del Sistema</h2>
        <label className="text-[#888] text-[12px]">Meta Mensual de Ganancia (CLP)</label>
        <input 
            type="number" 
            value={goal} 
            onChange={e => setGoal(e.target.value)} 
            className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white focus:border-[#c8ff00] outline-none" 
        />
        <button onClick={updateGoal} className="bg-[#c8ff00] text-black font-bold px-4 py-2 rounded hover:bg-[#a8ff00] transition-colors">Actualizar Meta</button>
      </div>

      <div className="bg-neutral-900/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-[16px] space-y-4">
        <h2 className="text-white font-bold">Ayúdanos a mejorar NETO</h2>
        <form onSubmit={sendFeedback} className="space-y-4">
            <select value={feedbackType} onChange={e => setFeedbackType(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white outline-none">
                <option>Reportar un problema</option>
                <option>Sugerir una mejora</option>
                <option>Mensaje para el desarrollador</option>
            </select>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Cuéntanos qué piensas..." className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white h-24 outline-none" required />
            <button type="submit" disabled={sending} className="bg-[#c8ff00] text-black font-bold px-4 py-2 rounded hover:bg-[#a8ff00] transition-colors disabled:opacity-50">Enviar Feedback</button>
        </form>
      </div>
    </div>
  );
}
