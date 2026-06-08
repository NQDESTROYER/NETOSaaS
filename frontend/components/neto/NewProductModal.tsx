import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function NewProductModal({ isOpen, onClose, onProductAdded }: { isOpen: boolean, onClose: () => void, onProductAdded: () => void }) {
  const [name, setName] = useState('');
  const [stock, setStock] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [archived, setArchived] = useState<any[]>([]);
  const [selectedArchivedId, setSelectedArchivedId] = useState('');

  useEffect(() => {
    if (isOpen) fetchArchivedProducts();
  }, [isOpen]);

  async function fetchArchivedProducts() {
    const { data } = await supabase.from('products').select('*').eq('active', false);
    setArchived(data || []);
  }

  function handleSelectArchived(id: string) {
    const prod = archived.find(p => p.id === id);
    if (prod) {
      setName(prod.name);
      setCostPrice(prod.cost_price.toString());
      setSalePrice(prod.sale_price.toString());
      setSelectedArchivedId(id);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      
      // 1. Subir imagen a Supabase Storage
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('productos-fotos')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error("Error detallado al subir:", uploadError);
          throw new Error("No se pudo subir la imagen al servidor.");
        }
        
        const { data } = supabase.storage.from('productos-fotos').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // 2. Guardar producto
      const { error: insertError } = await supabase.from('products').insert({
        name,
        stock: Number(stock),
        cost_price: Number(costPrice),
        sale_price: Number(salePrice),
        user_id: user.id,
        image_url: imageUrl,
        active: true
      });

      if (insertError) {
        console.error("Error al insertar producto:", insertError);
        throw new Error("Error al guardar el producto en base de datos.");
      }

      toast.success('Producto creado con éxito');
      onProductAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-[#141414] p-6 rounded-[16px] border border-[#222222] w-[400px] space-y-4">
        <h2 className="text-white font-bold text-[18px]">Nuevo Producto</h2>
        
        <select onChange={(e) => handleSelectArchived(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-[#888] text-[12px] focus:border-[#c8ff00] outline-none transition-colors">
            <option value="">Enlazar o reactivar producto archivado...</option>
            {archived.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <input placeholder="Nombre del producto" value={name} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white focus:border-[#c8ff00] outline-none transition-colors" onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Stock disponible" value={stock} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white focus:border-[#c8ff00] outline-none transition-colors" onChange={e => setStock(Number(e.target.value))} required />
        <input type="number" placeholder="Costo de compra esperado" value={costPrice} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white focus:border-[#c8ff00] outline-none transition-colors" onChange={e => setCostPrice(e.target.value)} required />
        <input type="number" placeholder="Precio de venta proyectado" value={salePrice} className="w-full bg-[#1a1a1a] border border-[#222222] p-2 rounded text-white focus:border-[#c8ff00] outline-none transition-colors" onChange={e => setSalePrice(e.target.value)} required />
        <input type="file" accept="image/*" className="w-full text-[#888] text-[12px] file:text-[12px] file:bg-[#1a1a1a] file:text-white file:border-none file:rounded file:px-2" onChange={e => e.target.files && setFile(e.target.files[0])} />
        
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[#888]">Cancelar</button>
          <button type="submit" className="bg-[#c8ff00] text-black font-bold px-4 py-2 rounded hover:bg-[#a8ff00] transition-colors" disabled={loading}>
            {selectedArchivedId ? 'Reactivar Producto' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
