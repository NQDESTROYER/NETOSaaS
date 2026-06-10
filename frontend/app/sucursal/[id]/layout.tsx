"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBranchAuthStore } from "@/store/branchAuthStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SucursalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { token, branch, logout } = useBranchAuthStore();

  useEffect(() => {
    // Si no hay token o la sucursal activa no coincide con la URL
    if (!token || branch?.id !== params.id) {
      logout();
      router.push("/auth/sucursal-login");
    }
  }, [token, branch, params.id, router, logout]);

  if (!token || !branch || branch.id !== params.id) return null;

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r p-4 space-y-4">
        <h2 className="font-bold text-lg">{branch.name}</h2>
        <nav className="space-y-2">
          <Link href={`/sucursal/${branch.id}`} className="block p-2 hover:bg-gray-100 rounded">Inicio</Link>
          <Link href={`/sucursal/${branch.id}/inventario`} className="block p-2 hover:bg-gray-100 rounded">Inventario</Link>
          <Link href={`/sucursal/${branch.id}/ventas`} className="block p-2 hover:bg-gray-100 rounded">Nueva Venta (POS)</Link>
        </nav>
        <Button variant="outline" onClick={logout} className="w-full">Cerrar Sesión</Button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
