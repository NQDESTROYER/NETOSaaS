"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface DashboardStats {
  ventasHoy: number;
  productosStockBajo: number;
}

export default function DashboardSucursal() {
  const params = useParams();
  const branchId = params.id as string;
  const [stats, setStats] = useState<DashboardStats>({ ventasHoy: 0, productosStockBajo: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranchData() {
      if (!branchId) return;
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Parallel fetching for performance
        const [salesResult, productsResult] = await Promise.all([
          supabase
            .from('sales')
            .select('total_amount')
            .eq('branch_id', branchId)
            .gte('created_at', `${today}T00:00:00Z`),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branchId)
            .lt('stock', 5)
        ]);

        if (salesResult.error) throw salesResult.error;
        if (productsResult.error) throw productsResult.error;

        setStats({
          ventasHoy: salesResult.data?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0,
          productosStockBajo: productsResult.count || 0,
        });
      } catch (error) {
        toast.error("Error al cargar datos del panel");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchBranchData();
  }, [branchId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Sucursal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Ventas del día</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">${stats.ventasHoy.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Productos con Stock Bajo (&lt;5)</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-destructive">{stats.productosStockBajo}</CardContent>
        </Card>
      </div>
    </div>
  );
}
