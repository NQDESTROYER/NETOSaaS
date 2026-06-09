require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3005;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(helmet()); 
app.use(cors({ 
  origin: [
    'http://localhost:5078', 
    'https://neto-saa-ah38ro72l-tomasychristian-projects.vercel.app',
    'https://neto-saa-kl25mfpo5-tomasychristian-projects.vercel.app',
    'https://neto-saa-s.vercel.app'
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Neto Backend API operational' }));
app.get('/', (req, res) => res.json({ message: 'Bienvenido a la API de Neto' }));

app.post('/api/sales', async (req, res) => {
  const { cart, channel, userId, customerName, customerPhone } = req.body;
  try {
    const totalAmount = cart.reduce((acc, item) => acc + item.sale_price * item.quantity, 0);
    const totalCost = cart.reduce((acc, item) => acc + item.cost_price * item.quantity, 0);
    const netProfit = totalAmount - totalCost;

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({ 
        channel, 
        total_amount: totalAmount, 
        total_cost: totalCost, 
        net_profit: netProfit, 
        user_id: userId,
        customer_name: customerName || 'Cliente Anónimo',
        customer_phone: customerPhone || null
      })
      .select()
      .single();


    if (saleError) throw saleError;

    for (const item of cart) {
      await supabase.from('sale_items').insert({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price
      });
      await supabase.from('products').update({ stock: item.stock - item.quantity }).eq('id', item.id);
    }
    res.json({ success: true, saleId: sale.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de IA optimizado con OpenAI
app.post('/api/ia/consultor', async (req, res) => {
  const { question, userId } = req.body;

  try {
    if (!userId) throw new Error("Usuario no autenticado");

    // 1. Verificar límites diarios
    const { data: profile } = await supabase.from('profiles').select('pro_plan, daily_ai_requests, last_ai_request_date').eq('id', userId).single();
    const today = new Date().toISOString().split('T')[0];
    let count = profile.last_ai_request_date === today ? (profile.daily_ai_requests || 0) : 0;
    
    const limit = profile.pro_plan ? 25 : 4;

    if (count >= limit) {
        return res.status(429).json({ error: "Límite diario alcanzado" });
    }

    // 2. Obtener y minificar contexto (Ahorro de tokens)
    const { data: products } = await supabase.from('products').select('name, stock, cost_price, sale_price').eq('user_id', userId);
    const { data: sales } = await supabase.from('sales').select('total_amount, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
    
    const compactProducts = products?.map(p => ({ n: p.name, s: p.stock, c: p.cost_price, p: p.sale_price })) || [];
    const compactSales = sales?.map(s => ({ d: s.created_at.split('T')[0], t: s.total_amount })) || [];
    
    const context = `INV:${JSON.stringify(compactProducts)}.VTAS:${JSON.stringify(compactSales)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres NEIA, la consultora financiera experta de la plataforma NETO. Tu objetivo es analizar los datos comerciales proporcionados (${context}) y ayudar al usuario a vender más.
            REGLAS ESTRICTAS:
            1. Mantén un tono profesional, ejecutivo y directo.
            2. Usa EXCLUSIVAMENTE los nombres de productos y datos que están en el contexto proporcionado.
            3. PROHIBIDO generar código, configuraciones técnicas o hablar de temas fuera del negocio. Si te solicitan temas ajenos, declina cortésmente.
            4. Sé extremadamente breve (máximo 50 palabras).
            5. Finaliza siempre con una pregunta estratégica accionable sobre los datos presentados.`
        },
        { role: "user", content: `Analiza los datos y responde: ${question}` }
      ],
      max_tokens: 150
    });

    // 3. Incrementar contador
    await supabase.from('profiles').update({ daily_ai_requests: count + 1, last_ai_request_date: today }).eq('id', userId);

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error IA:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));

app.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));
