'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import NewProductModal from '@/components/neto/NewProductModal'
import { motion, AnimatePresence } from 'framer-motion'

export default function InventarioPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActive, setShowActive] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      toast.error('Error al cargar productos')
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = p.active === showActive
      return matchesSearch && matchesStatus
    })
  }, [products, searchTerm, showActive])

  async function updateStock(id: string, currentStock: number, delta: number) {
    const newStock = Math.max(0, currentStock + delta);
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (error) { toast.error('Error al actualizar stock'); return; }
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  }

  async function archiveProduct(id: string, active: boolean) {
    if (!confirm(active ? '¿Archivar este producto?' : '¿Reactivar este producto?')) return;
    const { error } = await supabase.from('products').update({ active: active }).eq('id', id);
    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      toast.success(active ? 'Producto reactivado' : 'Producto archivado');
      setProducts(products.map(p => p.id === id ? { ...p, active } : p));
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-white flex items-center gap-2">📦 Inventario de Stock</h1>
          <p className="text-[#888] text-[14px]">Gestiona tus productos en tiempo real.</p>
        </div>
        <div className="flex gap-2">
            <input 
                placeholder="Buscar producto..." 
                className="bg-[#141414] border border-[#222222] rounded-[8px] p-2 text-white text-[12px] focus:border-[#c8ff00] outline-none"
                onChange={e => setSearchTerm(e.target.value)}
            />
            <button 
                onClick={() => setShowActive(!showActive)}
                className={`border rounded-[8px] px-4 py-2 text-[12px] transition-colors ${showActive ? 'border-[#c8ff00] text-[#c8ff00]' : 'border-[#222222] text-[#888] hover:bg-[#222]'}`}
            >
                {showActive ? 'Ver Archivados' : 'Ver Activos'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#c8ff00] text-black font-bold px-4 py-2 rounded-[8px] hover:bg-[#a8ff00] transition-colors">+ Nuevo Producto</button>
        </div>
      </div>
      
      <NewProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onProductAdded={fetchProducts} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
            <p className="text-white">Cargando productos...</p>
        ) : (
            <AnimatePresence>
                {filteredProducts.map((p) => (
                    <motion.div 
                        key={p.id} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-[#141414] p-4 rounded-[12px] border border-[#222222] hover:border-[#444] transition-all relative group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[20px]">📦</div>
                            )}
                            <button 
                                onClick={() => archiveProduct(p.id, !p.active)}
                                className="p-1 text-neutral-600 hover:text-red-500 transition-colors"
                                title={p.active ? "Archivar" : "Reactivar"}
                            >
                                {p.active ? '🗑️' : '♻️'}
                            </button>
                        </div>
                        <p className="text-[12px] text-white font-bold">${p.sale_price}</p>
                        <p className="text-[14px] font-bold text-white mb-1">{p.name}</p>
                        <p className="text-[#888] text-[12px] mb-4">COSTO: ${p.cost_price}</p>
                        
                        {p.active && (
                          <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#222222] p-2 rounded-[8px]">
                              <span className="text-[#888] text-[12px]">STOCK: <span className="text-white font-bold">{p.stock}</span></span>
                              <div className="flex gap-1">
                                  <button onClick={() => updateStock(p.id, p.stock, -1)} className="text-white bg-[#222] px-2 py-0.5 rounded hover:bg-[#333]">−</button>
                                  <button onClick={() => updateStock(p.id, p.stock, 1)} className="text-white bg-[#222] px-2 py-0.5 rounded hover:bg-[#333]">+</button>
                              </div>
                          </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        )}
      </div>
    </div>
  );
}
