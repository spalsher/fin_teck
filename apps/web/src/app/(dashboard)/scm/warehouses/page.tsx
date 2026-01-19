'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Warehouse } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  location?: string;
  isActive: boolean;
}

export default function WarehousesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    try {
      const response = await apiClient.get('/warehouses', { params: { pageSize: 100 } });
      setWarehouses(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load warehouses' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Warehouse>[] = [
    { key: 'warehouseCode', header: 'Code', sortable: true, cell: (w) => <div className="font-medium">{w.warehouseCode}</div> },
    { key: 'warehouseName', header: 'Name', sortable: true, cell: (w) => <div className="font-medium">{w.warehouseName}</div> },
    { key: 'location', header: 'Location', cell: (w) => w.location || <span className="text-muted-foreground">-</span> },
    { key: 'isActive', header: 'Status', sortable: true, cell: (w) => <Badge variant={w.isActive ? "success" : "destructive"}>{w.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', cell: (w) => <Button variant="ghost" size="sm" onClick={() => router.push(`/scm/warehouses/${w.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Warehouses</h1><p className="text-muted-foreground mt-1">Manage warehouse locations</p></div>
        <Button onClick={() => router.push('/scm/warehouses/new')}><Plus className="mr-2 h-4 w-4" />New Warehouse</Button>
      </div>

      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Warehouses</CardTitle><Warehouse className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{warehouses.length}</div></CardContent></Card>

      <Card><CardContent className="pt-6"><DataTable data={warehouses} columns={columns} searchKey="warehouseName" searchPlaceholder="Search warehouses..." emptyMessage="No warehouses found." /></CardContent></Card>
    </div>
  );
}
