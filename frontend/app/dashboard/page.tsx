'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Copy, Plus, BarChart3, Store, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalIngresos: 0, totalVentas: 0, totalSucursales: 0 });
  const [chartType, setChartType] = useState('line');
  const [timeframe, setTimeframe] = useState<'semana' | 'mes'>('semana');
  const [chartData, setChartData] = useState<any[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', manager_name: '', phone: '', branch_username: '', branch_password: '' });

  const handleCreateBranch = async () => {
    try {
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert({
          name: newBranch.name,
          address: newBranch.address,
          manager_name: newBranch.manager_name,
          phone: newBranch.phone,
        })
        .select()
        .single();
      
      if (branchError) throw branchError;

      const { error: credError } = await supabase
        .from('branch_credentials')
        .insert({
          branch_id: branch.id,
          username: newBranch.branch_username,
          password_hash: newBranch.branch_password, 
        });

      if (credError) throw credError;
      
      toast.success('Sucursal creada exitosamente');
      setNewBranch({ name: '', address: '', manager_name: '', phone: '', branch_username: '', branch_password: '' });
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error('Error al crear sucursal');
    }
  };

  useEffect(() => {
    async function loadData() {
      // Fetch branches with credentials (username)
      const { data: branchesData, error } = await supabase
        .from('branches')
        .select('*, branch_credentials(username)');
        
      if (branchesData) {
        setBranches(branchesData);
        setStats(prev => ({ ...prev, totalSucursales: branchesData.length }));
      }

      // Fetch analytics (example: total sales per branch for last week/month)
      const { data: salesData } = await supabase.from('sales').select('total_amount, created_at');
      
      const totalIngresos = salesData?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
      setStats(prev => ({ ...prev, totalIngresos, totalVentas: salesData?.length || 0 }));
      
      // Prepare chart data (e.g., grouped by day)
      // This is a simplified grouping for demonstration
      setChartData([
        { name: 'Lun', value: 400 },
        { name: 'Mar', value: 300 },
        { name: 'Mié', value: 600 },
        { name: 'Jue', value: 800 },
        { name: 'Vie', value: 1200 },
        { name: 'Sáb', value: 900 },
        { name: 'Dom', value: 500 },
      ]);
    }
    loadData();
  }, []);

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    
    // Delete credentials first (due to foreign key)
    await supabase.from('branch_credentials').delete().eq('branch_id', id);
    await supabase.from('branches').delete().eq('id', id);
    
    setBranches(branches.filter(b => b.id !== id));
    toast.success('Sucursal eliminada');
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      <Tabs defaultValue="analiticas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analiticas"><BarChart3 className="mr-2 h-4 w-4" /> Analíticas</TabsTrigger>
          <TabsTrigger value="sucursales"><Store className="mr-2 h-4 w-4" /> Gestión de Sucursales</TabsTrigger>
        </TabsList>

        <TabsContent value="analiticas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardHeader><CardTitle>Ingresos Totales</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${stats.totalIngresos.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>Total Ventas</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.totalVentas}</CardContent></Card>
            <Card><CardHeader><CardTitle>Sucursales</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.totalSucursales}</CardContent></Card>
            <Card><CardHeader><CardTitle>Consultas IA</CardTitle></CardHeader><CardContent className="text-2xl font-bold">120 / 200</CardContent></Card>
          </div>

          <div className="flex gap-4">
            <Select value={chartType} onValueChange={(value) => value && setChartType(value)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo de gráfico" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Líneas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="min-h-[300px] w-full p-4">
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#8884d8" /></LineChart>
              ) : (
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#8884d8" /></BarChart>
              )}
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="sucursales">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Listado de Sucursales</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Añadir Sucursal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nueva Sucursal</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Nombre" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                    <Input placeholder="Dirección" value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                    <Input placeholder="Encargado" value={newBranch.manager_name} onChange={e => setNewBranch({...newBranch, manager_name: e.target.value})} />
                    <Input placeholder="Teléfono" value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
                    <Input placeholder="Usuario" value={newBranch.branch_username} onChange={e => setNewBranch({...newBranch, branch_username: e.target.value})} />
                    <Input type="password" placeholder="Contraseña" value={newBranch.branch_password} onChange={e => setNewBranch({...newBranch, branch_password: e.target.value})} />
                    <Button className="w-full" onClick={handleCreateBranch}>Guardar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead><TableHead>Encargado</TableHead>
                    <TableHead>Usuario</TableHead><TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.name}</TableCell><TableCell>{b.manager_name}</TableCell>
                      <TableCell>{b.branch_credentials?.[0]?.username || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={handleCopyLink}><Copy size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => alert('Reset password feature placeholder')}><RefreshCw size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBranch(b.id)}><Trash2 size={16} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
