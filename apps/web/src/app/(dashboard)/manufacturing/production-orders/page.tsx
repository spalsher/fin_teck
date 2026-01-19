'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Factory } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface ProductionOrder {
  id: string;
  productionOrderNo: string;
  orderDate: string;
  status: string;
  quantityOrdered: number;
  quantityProduced: number;
}

export default function ProductionOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await apiClient.get('/production-orders', { params: { pageSize: 100 } });
      setOrders(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load production orders' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<ProductionOrder>[] = [
    { key: 'productionOrderNo', header: 'Order #', sortable: true, cell: (o) => <div className="font-medium">{o.productionOrderNo}</div> },
    { key: 'orderDate', header: 'Date', sortable: true, cell: (o) => new Date(o.orderDate).toLocaleDateString() },
    { key: 'quantityOrdered', header: 'Ordered', sortable: true, cell: (o) => <div className="font-mono">{o.quantityOrdered}</div> },
    { key: 'quantityProduced', header: 'Produced', sortable: true, cell: (o) => <div className="font-mono">{o.quantityProduced}</div> },
    { key: 'status', header: 'Status', sortable: true, cell: (o) => <Badge variant={o.status === 'COMPLETED' ? 'success' : o.status === 'IN_PROGRESS' ? 'default' : 'outline'}>{o.status}</Badge> },
    { key: 'actions', header: 'Actions', cell: (o) => <Button variant="ghost" size="sm" onClick={() => router.push(`/manufacturing/production-orders/${o.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Production Orders</h1><p className="text-muted-foreground mt-1">Manage manufacturing orders</p></div>
        <Button onClick={() => router.push('/manufacturing/production-orders/new')}><Plus className="mr-2 h-4 w-4" />New Order</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle><Factory className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'IN_PROGRESS').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'COMPLETED').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Produced</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{orders.reduce((sum, o) => sum + o.quantityProduced, 0)}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={orders} columns={columns} searchKey="productionOrderNo" searchPlaceholder="Search production orders..." emptyMessage="No production orders found." /></CardContent></Card>
    </div>
  );
}
