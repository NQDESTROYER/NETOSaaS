'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function VentasPage() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('Presencial')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).eq('active', true).gt('stock', 0)
    const { data: sales } = await supabase.from('sales').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    setProducts(prods || [])
    setSalesHistory(sales || [])
  }

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      return existing ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateCartQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
  }

  const handleConfirmSale = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const response = await fetch('http://localhost:3005/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, channel: selectedChannel, customerName, customerPhone, userId: user?.id })
    })
    const result = await response.json()
    if (result.success) {
      toast.success('¡Venta registrada con éxito! 🚀')
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      fetchData()
    } else {
      toast.error('Error: ' + result.error)
    }
  }

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.sale_price) * item.quantity), 0)

  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <h1 className="text-[20px] font-bold text-white">💰 Registrar Venta</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} className="bg-[#141414] p-4 rounded-[12px] border border-[#222222] hover:border-[#c8ff00]/30 transition-all cursor-pointer group">
                        <div className="relative mb-3">
                            {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-32 rounded-[8px] object-cover" />
                            ) : (
                                <div className="h-32 bg-[#1a1a1a] rounded-[8px] flex items-center justify-center text-[32px]">📦</div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-1 rounded">
                                {p.stock} disponibles
                            </div>
                        </div>
                        <p className="text-white font-bold text-[14px] truncate">{p.name}</p>
                        <p className="text-[#c8ff00] font-bold">${Number(p.sale_price).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-[#141414] border border-[#222222] rounded-[16px] p-6 h-fit sticky top-6 space-y-4">
            <h2 className="font-bold text-white">Resumen</h2>
            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-white text-[14px]">
                    <div className="flex items-center gap-2">
                        {item.image_url ? <img src={item.image_url} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 bg-neutral-800 rounded"></div>}
                        <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                        <input type="number" value={item.quantity} onChange={(e) => updateCartQuantity(item.id, Number(e.target.value))} className="w-10 bg-black text-center"/>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span>${(Number(item.sale_price) * item.quantity).toLocaleString()}</span>
                </div>
            ))}
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nombre Cliente" className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white"/>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Teléfono Cliente" className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white"/>
            <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white">
                {['Presencial', 'WhatsApp', 'Instagram', 'MercadoLibre', 'Otro'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={handleConfirmSale} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold p-3 rounded-[8px]">Confirmar Venta →</button>
        </div>
      </div>

      <div className="bg-[#141414] p-6 rounded-[16px] border border-[#222222]">
        <h2 className="text-white font-bold mb-4">Historial de Ventas</h2>
        <table className="w-full text-[#888] text-[14px]">
            <thead><tr className="border-b border-[#222222]"><th>Fecha</th><th>Cliente</th><th>Teléfono</th><th>Canal</th><th>Total</th></tr></thead>
            <tbody>{salesHistory.map(s => <tr key={s.id} className="border-b border-[#222222]"><td>{new Date(s.created_at).toLocaleDateString()}</td><td>{s.customer_name}</td><td>{s.customer_phone}</td><td>{s.channel}</td><td>${s.total_amount.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
