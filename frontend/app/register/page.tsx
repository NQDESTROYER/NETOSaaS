'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [goal, setGoal] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message === 'email rate limit exceeded') {
        toast.error('Demasiados intentos. Por favor, espera un momento.');
      } else {
        toast.error('Error: ' + authError.message);
      }
      return;
    }

    // Asegurarse de tener el usuario antes de actualizar el perfil
    const { data: userData } = await supabase.auth.getUser();
    const user = authData.user || userData?.user;

    if (user) {
      const { error: profileError } = await supabase.from('profiles').update(
        {
          business_name: businessName,
          monthly_revenue_goal: parseFloat(goal),
        }
      ).eq('id', user.id);

      if (profileError) {
        toast.error('Error al actualizar el perfil: ' + profileError.message);
        return;
      }

      toast.success('Registro exitoso. Redirigiendo...');
      router.push('/dashboard');
    } else {
      toast.error('Error: No se pudo obtener el usuario después del registro.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Registro en NETO</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <Label>Contraseña</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <Label>Nombre del Negocio</Label>
        <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        
        <Label>Meta de Ganancia Mensual (CLP)</Label>
        <Input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} required />
        
        <Button type="submit">Registrarse</Button>
      </form>
    </div>
  );
}
