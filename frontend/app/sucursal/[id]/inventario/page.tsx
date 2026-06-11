"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Product } from "@/types";

export default function InventarioPage() {
  const params = useParams();
  const branchId = params.id as string;
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProductos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('branch_id', branchId);
      
      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      toast.error("Error al cargar inventario");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (branchId) fetchProductos();
  }, [branchId]);

  const updateStock = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Stock actualizado");
      fetchProductos();
    } catch (error) {
      toast.error("Error al actualizar stock");
      console.error(error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventario</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  defaultValue={p.stock} 
                  className="w-20"
                  onBlur={(e) => updateStock(p.id, parseInt(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline">Editar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
