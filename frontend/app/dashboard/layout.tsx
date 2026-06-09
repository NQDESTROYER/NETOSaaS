'use client'
import Sidebar from "@/components/neto/Sidebar";
import Topbar from "@/components/neto/Topbar";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkOnboarding() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If there's an error (like 406), consider treating it as not completed to be safe, 
        // or redirect to a profile completion page if appropriate.
        router.push('/onboarding');
        return;
      }

      if (!profile || !profile.onboarding_completed) {
        router.push('/onboarding');
        return;
      }
      
      setProfile(profile);
      setLoading(false);
    }
    checkOnboarding();
  }, [router]);

  if (loading) return <div className="h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Cargando...</div>;

  return (
    <div className="relative h-screen bg-[#0a0a0a] overflow-hidden text-white">
      <div className="fixed top-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse [animation-duration:10s] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full animate-pulse [animation-duration:12s] pointer-events-none" />
      
      <div className="flex h-screen relative z-10">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar profile={profile} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
