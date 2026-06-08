import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-payment-signature');

  // Validación simplificada de firma (se debe implementar con el secreto real del proveedor)
  if (!signature) return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });

  // Evento: invoice.payment_succeeded
  if (body.type === 'invoice.payment_succeeded') {
    const { userId, plan } = body.data;
    
    await supabase
      .from('profiles')
      .update({ current_plan: plan })
      .eq('id', userId);
  }

  return NextResponse.json({ received: true });
}
