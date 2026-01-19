'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Building2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  assetCategory: string;
  acquisitionCost: number;
  netBookValue: number;
  status: string;
}

export default function AssetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      const response = await apiClient.get('/assets', { params: { pageSize: 100 } });
      setAssets(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load assets' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Asset>[] = [
    { key: 'assetCode', header: 'Code', sortable: true, cell: (a) => <div className="font-medium">{a.assetCode}</div> },
    { key: 'assetName', header: 'Asset Name', sortable: true, cell: (a) => <div className="font-medium">{a.assetName}</div> },
    { key: 'assetCategory', header: 'Category', sortable: true, cell: (a) => <Badge variant="outline">{a.assetCategory}</Badge> },
    { key: 'acquisitionCost', header: 'Acquisition Cost', sortable: true, cell: (a) => <div className="font-mono">PKR {a.acquisitionCost.toLocaleString()}</div> },
    { key: 'netBookValue', header: 'Net Book Value', sortable: true, cell: (a) => <div className="font-mono">PKR {a.netBookValue.toLocaleString()}</div> },
    { key: 'status', header: 'Status', sortable: true, cell: (a) => <Badge variant={a.status === 'IN_USE' ? 'success' : a.status === 'DISPOSED' ? 'destructive' : 'outline'}>{a.status}</Badge> },
    { key: 'actions', header: 'Actions', cell: (a) => <Button variant="ghost" size="sm" onClick={() => router.push(`/assets/${a.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Assets</h1><p className="text-muted-foreground mt-1">Manage fixed assets</p></div>
        <Button onClick={() => router.push('/assets/new')}><Plus className="mr-2 h-4 w-4" />New Asset</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Assets</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{assets.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PKR {assets.reduce((sum, a) => sum + a.netBookValue, 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">In Use</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{assets.filter(a => a.status === 'IN_USE').length}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={assets} columns={columns} searchKey="assetName" searchPlaceholder="Search assets..." emptyMessage="No assets found." /></CardContent></Card>
    </div>
  );
}
