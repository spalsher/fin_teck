'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Package } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: string;
  uom: string;
  unitPrice: number;
  standardCost: number;
  isActive: boolean;
}

export default function ItemsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await apiClient.get('/items', { params: { pageSize: 100 } });
      setItems(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load items' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Item>[] = [
    { key: 'itemCode', header: 'Code', sortable: true, cell: (i) => <div className="font-medium">{i.itemCode}</div> },
    { key: 'itemName', header: 'Item Name', sortable: true, cell: (i) => <div className="font-medium">{i.itemName}</div> },
    { key: 'itemType', header: 'Type', sortable: true, cell: (i) => <Badge variant="outline">{i.itemType}</Badge> },
    { key: 'uom', header: 'UOM', cell: (i) => <Badge variant="secondary">{i.uom}</Badge> },
    { key: 'unitPrice', header: 'Unit Price', sortable: true, cell: (i) => <div className="font-mono">PKR {i.unitPrice.toLocaleString()}</div> },
    { key: 'standardCost', header: 'Cost', sortable: true, cell: (i) => <div className="font-mono">PKR {i.standardCost.toLocaleString()}</div> },
    { key: 'isActive', header: 'Status', sortable: true, cell: (i) => <Badge variant={i.isActive ? "success" : "destructive"}>{i.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: 'Actions', cell: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/scm/items/${i.id}`)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/scm/items/${i.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Items</h1><p className="text-muted-foreground mt-1">Manage inventory items</p></div>
        <Button onClick={() => router.push('/scm/items/new')}><Plus className="mr-2 h-4 w-4" />New Item</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Items</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{items.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{items.filter(i => i.isActive).length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{items.filter(i => !i.isActive).length}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={items} columns={columns} searchKey="itemName" searchPlaceholder="Search items..." emptyMessage="No items found." /></CardContent></Card>
    </div>
  );
}
