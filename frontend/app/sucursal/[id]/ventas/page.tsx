"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function PosPage() {
  const params = useParams();
  const branchId = params.id as string;
  const [productos, setProductos] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    async function loadProductos() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('branch_id', branchId)
        .gt('stock', 0);
      setProductos(data || []);
    }
    loadProductos();
  }, [branchId]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const confirmarVenta = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Branch-Id": branchId
        },
        body: JSON.stringify({ cart }),
      });
      
      if (!response.ok) throw new Error("Error en venta");
      
      toast.success("Venta registrada exitosamente");
      setCart([]);
    } catch (e) {
      console.error(e);
      toast.error("Error al registrar venta");
    }
  };

  const total = cart.reduce((acc, item) => acc + item.sale_price * item.quantity, 0);

  return (
    <div className="flex h-screen gap-4 p-4">
      <div className="flex-1 grid grid-cols-3 gap-4 h-full overflow-y-auto">
        {productos.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:bg-muted" onClick={() => addToCart(p)}>
            <CardContent className="p-4">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm">Precio: ${p.sale_price}</p>
              <p className="text-sm">Stock: {p.stock}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="w-80 border p-4 flex flex-col gap-4">
        <h2 className="font-bold text-xl">Carrito</h2>
        <div className="flex-1 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.name} x{item.quantity}</span>
              <span>${item.sale_price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
        <Button onClick={confirmarVenta} className="w-full" disabled={cart.length === 0}>
          Confirmar Venta
        </Button>
      </div>
    </div>
  );
}
