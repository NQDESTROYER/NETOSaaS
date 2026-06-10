"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useBranchAuthStore } from "@/store/branchAuthStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PosPage() {
  const params = useParams();
  const { token } = useBranchAuthStore();
  const [cart, setCart] = useState([]);

  const confirmarVenta = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Branch-Id": params.id as string
        },
        body: JSON.stringify({ cart }),
      });
      
      if (!response.ok) throw new Error("Error en venta");
      toast.success("Venta registrada");
      setCart([]);
    } catch (e) {
      toast.error("Error al registrar venta");
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 border p-4">Productos (Selector)</div>
      <div className="w-80 border p-4 flex flex-col">
        <h2 className="font-bold">Carrito</h2>
        <div className="flex-1">...</div>
        <Button onClick={confirmarVenta} className="w-full">Confirmar Venta</Button>
      </div>
    </div>
  );
}
