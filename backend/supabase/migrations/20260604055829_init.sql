-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles / Configuración de Negocio
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  business_name TEXT NOT NULL,
  currency TEXT DEFAULT 'CLP',
  monthly_revenue_goal NUMERIC DEFAULT 500000,
  current_plan TEXT DEFAULT 'gratis', -- 'gratis', 'pro', 'pro_whatsapp'
  sales_this_month NUMERIC DEFAULT 0,
  daily_ai_requests INT DEFAULT 0,
  last_ai_request_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Tabla de Productos / Inventario
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  name TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  cost_price NUMERIC NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  sale_price NUMERIC NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Tabla de Ventas / Historial de Caja
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('instagram', 'whatsapp', 'presencial', 'ia_whatsapp')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabla Relacional Venta-Productos (Estructura Carrito)
CREATE TABLE sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Crear Políticas RLS (Asegurar aislamiento multi-tenant)
CREATE POLICY "Usuarios pueden ver su propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios manejan sus propios productos" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios manejan sus propias ventas" ON sales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios manejan sus propios items de venta" ON sale_items FOR ALL 
  USING (EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
