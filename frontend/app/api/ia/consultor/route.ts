import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabaseClient';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { prompt, userId } = await req.json();

  // 1. Check and Update Quota
  let { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('current_plan, daily_ai_requests, last_ai_request_date')
    .eq('id', userId)
    .single();

  if (pError || !profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

  const today = new Date().toISOString().split('T')[0];
  
  if (profile.last_ai_request_date !== today) {
    await supabase.from('profiles').update({ daily_ai_requests: 0, last_ai_request_date: today }).eq('id', userId);
    profile.daily_ai_requests = 0;
  }

  if (profile.current_plan === 'gratis' && profile.daily_ai_requests >= 4) {
    return NextResponse.json({ error: 'Límite diario alcanzado' }, { status: 403 });
  }

  // 2. Fetch Context
  const { data: sales } = await supabase.from('sales').select('*').eq('user_id', userId);
  const { data: products } = await supabase.from('products').select('*').eq('user_id', userId);

  // 3. AI Query
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(`
    Contexto financiero del usuario:
    Ventas: ${JSON.stringify(sales)}
    Productos: ${JSON.stringify(products)}
    
    Pregunta: ${prompt}
    
    Responde de forma clara y directa como un consultor financiero.
  `);

  // 4. Increment Count
  await supabase.from('profiles').update({ daily_ai_requests: profile.daily_ai_requests + 1 }).eq('id', userId);

  return NextResponse.json({ response: result.response.text() });
}
