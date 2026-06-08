import { supabase } from '@/lib/supabaseClient';

export async function checkPaywall(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_plan, sales_this_month')
    .eq('id', userId)
    .single();

  if (profile?.current_plan === 'gratis' && profile.sales_this_month >= 1000000) {
    return { blocked: true };
  }
  
  return { blocked: false };
}
