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
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo de gráfico" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Líneas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="h-96 p-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
