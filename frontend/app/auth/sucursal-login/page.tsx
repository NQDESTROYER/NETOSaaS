"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBranchAuthStore } from "@/store/branchAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SucursalLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setAuth = useBranchAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/branch-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Credenciales inválidas");

      const data = await response.json();
      setAuth(data.token, data.branch);
      router.push(`/sucursal/${data.branch.id}`);
    } catch (error) {
      toast.error("Error al iniciar sesión");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-96 space-y-4 p-8 border rounded-lg">
        <h1 className="text-xl font-bold">Login Sucursal</h1>
        <Input placeholder="Usuario" onChange={(e) => setUsername(e.target.value)} required />
        <Input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} required />
        <Button className="w-full">Ingresar</Button>
      </form>
    </div>
  );
}
