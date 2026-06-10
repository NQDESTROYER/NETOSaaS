"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useBranchAuthStore } from "@/store/branchAuthStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function InventarioPage() {
  const params = useParams();
  const { token } = useBranchAuthStore();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Fetch a /api/products con headers: Authorization: Bearer ${token}, X-Branch-Id: ${params.id}
  }, [token, params.id]);

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
          {productos.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell><Button size="sm">Actualizar</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
