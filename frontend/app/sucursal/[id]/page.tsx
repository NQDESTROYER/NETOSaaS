"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useBranchAuthStore } from "@/store/branchAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSucursal() {
  const params = useParams();
  const { token } = useBranchAuthStore();
  const [stats, setStats] = useState({ ventasHoy: 0, stockBajo: [] });

  useEffect(() => {
    // Aquí fetch al backend enviando el header Authorization: Bearer ${token}
    // y X-Branch-Id: ${params.id}
  }, [token, params.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inicio de Sucursal</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Ventas del día</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">${stats.ventasHoy}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Productos con Stock Bajo (&lt;5)</CardTitle></CardHeader>
          <CardContent>
            <ul>{stats.stockBajo.map((p: any) => <li key={p.id}>{p.name}: {p.stock}</li>)}</ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
