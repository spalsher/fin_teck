'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  vendor: { id: string; name: string };
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const response = await apiClient.get('/purchase-orders', { params: { pageSize: 100 } });
      setOrders(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load purchase orders' });
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => statusFilter === 'ALL' ? orders : orders.filter(o => o.status === statusFilter), [orders, statusFilter]);
  const total = useMemo(() => filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0), [filteredOrders]);

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO #', sortable: true, cell: (o) => <div className="font-medium">{o.poNumber}</div> },
    { key: 'vendor', header: 'Vendor', cell: (o) => <div className="font-medium">{o.vendor.name}</div> },
    { key: 'orderDate', header: 'Date', sortable: true, cell: (o) => new Date(o.orderDate).toLocaleDateString() },
    { key: 'totalAmount', header: 'Amount', sortable: true, cell: (o) => <div className="font-mono">PKR {o.totalAmount.toLocaleString()}</div> },
    { key: 'status', header: 'Status', sortable: true, cell: (o) => <Badge variant={o.status === 'APPROVED' ? 'success' : o.status === 'CANCELLED' ? 'destructive' : 'outline'}>{o.status}</Badge> },
    { key: 'actions', header: 'Actions', cell: (o) => <Button variant="ghost" size="sm" onClick={() => router.push(`/scm/purchase-orders/${o.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1><p className="text-muted-foreground mt-1">Manage purchase orders</p></div>
        <Button onClick={() => router.push('/scm/purchase-orders/new')}><Plus className="mr-2 h-4 w-4" />New PO</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filteredOrders.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PKR {total.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle><CheckCircle className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'APPROVED').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Filter</CardTitle></CardHeader><CardContent><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="APPROVED">Approved</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent></Select></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={filteredOrders} columns={columns} searchKey="poNumber" searchPlaceholder="Search purchase orders..." emptyMessage="No purchase orders found." /></CardContent></Card>
    </div>
  );
}
