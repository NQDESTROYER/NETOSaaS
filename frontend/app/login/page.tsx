'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Inicio de sesión exitoso');
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <Label>Contraseña</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
}
