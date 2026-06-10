'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Trash2, Edit2, Copy, Plus, BarChart3, Store } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, ComposedChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar } from 'recharts';

// Datos OHLC mejorados
const rawData = {
  dia: [
    { name: 'Lun', open: 300, close: 400, high: 450, low: 250 },
    { name: 'Mar', open: 400, close: 300, high: 420, low: 280 },
    { name: 'Mié', open: 300, close: 600, high: 650, low: 290 },
    { name: 'Jue', open: 600, close: 800, high: 850, low: 580 },
    { name: 'Vie', open: 800, close: 1200, high: 1250, low: 780 },
    { name: 'Sáb', open: 1200, close: 900, high: 1220, low: 880 },
    { name: 'Dom', open: 900, close: 500, high: 950, low: 480 },
  ],
  semana: Array.from({ length: 4 }, (_, i) => ({
    name: `Sem ${i + 1}`,
    open: 1000 + i * 500,
    close: 1500 + i * 600,
    high: 2000 + i * 700,
    low: 800 + i * 400,
  })),
  mes: [
    { name: 'Ene', open: 5000, close: 7000, high: 7500, low: 4800 },
    { name: 'Feb', open: 7000, close: 6500, high: 7200, low: 6000 },
    { name: 'Mar', open: 6500, close: 9000, high: 9500, low: 6200 },
    { name: 'Abr', open: 9000, close: 8500, high: 9200, low: 8000 },
    { name: 'May', open: 8500, close: 10000, high: 10500, low: 8200 },
    { name: 'Jun', open: 10000, close: 11000, high: 11500, low: 9500 },
    { name: 'Jul', open: 11000, close: 10500, high: 11200, low: 10000 },
    { name: 'Ago', open: 10500, close: 12000, high: 12500, low: 10200 },
    { name: 'Sep', open: 12000, close: 11500, high: 12200, low: 11000 },
    { name: 'Oct', open: 11500, close: 13000, high: 13500, low: 11200 },
    { name: 'Nov', open: 13000, close: 12500, high: 13200, low: 12000 },
    { name: 'Dic', open: 12500, close: 15000, high: 16000, low: 12200 },
  ]
};

const mockBranches = [
  { id: '1', name: 'Sucursal Centro', address: 'Av. Principal 123', manager: 'Juan Pérez', user: 'admin_centro', pass: 'secret123' },
  { id: '2', name: 'Sucursal Norte', address: 'Calle Falsa 456', manager: 'María López', user: 'admin_norte', pass: 'norte456' },
];

export default function DashboardPage() {
  const [branches, setBranches] = useState(mockBranches);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [chartType, setChartType] = useState('bar');
  const [timeframe, setTimeframe] = useState<'dia' | 'semana' | 'mes'>('semana');

  const chartData = useMemo(() => rawData[timeframe], [timeframe]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', manager_name: '', phone: '', branch_username: '', branch_password: '' });

  const handleCreateBranch = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch),
      });
      if (!response.ok) throw new Error('Error al crear sucursal');
      
      toast.success('Sucursal creada exitosamente');
      setBranches([...branches, { ...newBranch, id: Date.now().toString(), manager: newBranch.manager_name, user: newBranch.branch_username, pass: newBranch.branch_password }]);
      setIsDialogOpen(false);
      setNewBranch({ name: '', address: '', manager_name: '', phone: '', branch_username: '', branch_password: '' });
    } catch (error) {
      toast.error('Error al crear sucursal');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/auth/sucursal-login`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado');
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
            <Card><CardHeader><CardTitle>Ingresos Totales</CardTitle></CardHeader><CardContent className="text-2xl font-bold">$45,000</CardContent></Card>
            <Card><CardHeader><CardTitle>Total Ventas</CardTitle></CardHeader><CardContent className="text-2xl font-bold">1,200</CardContent></Card>
            <Card><CardHeader><CardTitle>Sucursales</CardTitle></CardHeader><CardContent className="text-2xl font-bold">5</CardContent></Card>
            <Card><CardHeader><CardTitle>Consultas IA</CardTitle></CardHeader><CardContent className="text-2xl font-bold">120 / 200</CardContent></Card>
          </div>

          <div className="flex gap-4">
            <Select value={chartType} onValueChange={(value: string) => setChartType(value)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo de gráfico" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Líneas</SelectItem>
                <SelectItem value="candlestick">Velas Japonesas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={(value: 'dia' | 'semana' | 'mes') => setTimeframe(value)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Timeframe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dia">Por Día</SelectItem>
                <SelectItem value="semana">Por Semana</SelectItem>
                <SelectItem value="mes">Por Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="h-96 p-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="close" stroke="#8884d8" /></LineChart>
              ) : chartType === 'candlestick' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={['auto', 'auto']} /><Tooltip />
                  <Bar dataKey="close" barSize={20} fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.close > entry.open ? '#22c55e' : '#ef4444'} />
                    ))}
                    <ErrorBar dataKey="high" width={4} strokeWidth={2} stroke="gray" direction="plus" />
                    <ErrorBar dataKey="low" width={4} strokeWidth={2} stroke="gray" direction="minus" />
                  </Bar>
                </ComposedChart>
              ) : (
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="close" fill="#8884d8" /></BarChart>
              )}
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="sucursales">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Listado de Sucursales</CardTitle>
              <Dialog>
                <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                  <Plus className="mr-2 h-4 w-4" /> Añadir Sucursal
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
                    <TableHead>Nombre</TableHead><TableHead>Dirección</TableHead><TableHead>Encargado</TableHead>
                    <TableHead>Usuario</TableHead><TableHead>Contraseña</TableHead><TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.name}</TableCell><TableCell>{b.address}</TableCell><TableCell>{b.manager}</TableCell>
                      <TableCell>{b.user}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {visiblePasswords[b.id] ? b.pass : '••••••••'}
                        <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility(b.id)}>
                          {visiblePasswords[b.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={handleCopyLink}><Copy size={16} /></Button>
                          <Button variant="ghost" size="icon"><Edit2 size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 size={16} /></Button>
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
