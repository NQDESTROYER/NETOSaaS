"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Plus, Trash2, Edit2 } from "lucide-react";

// Tipos básicos para la sucursal
interface Branch {
  id: string;
  name: string;
  address: string;
  manager_name: string;
  phone: string;
  branch_username: string;
}

export default function SucursalesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Simulación de carga (sustituir por llamada a API real en producción)
  useEffect(() => {
    // Ejemplo de fetch inicial
    // fetchBranches().then(setBranches);
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/auth/sucursal-login`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace de acceso copiado al portapapeles");
  };

  const handleCreateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la llamada al backend para crear la sucursal
    toast.success("Sucursal creada con éxito");
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Sucursales</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Añadir Sucursal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Sucursal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <Input placeholder="Nombre de la sucursal" required />
              <Input placeholder="Dirección" required />
              <Input placeholder="Nombre del Encargado" required />
              <Input placeholder="Teléfono" type="tel" required />
              <Input placeholder="Usuario de acceso" required />
              <Input placeholder="Contraseña" type="password" required />
              <Button type="submit" className="w-full">Crear Sucursal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Encargado</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>{branch.name}</TableCell>
              <TableCell>{branch.address}</TableCell>
              <TableCell>{branch.manager_name}</TableCell>
              <TableCell>{branch.phone}</TableCell>
              <TableCell>{branch.branch_username}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
