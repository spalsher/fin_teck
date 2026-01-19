'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface BOM {
  id: string;
  bomCode: string;
  bomName: string;
  version: string;
  status: string;
  _count?: { lines: number };
}

export default function BOMsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBOMs();
  }, []);

  async function fetchBOMs() {
    try {
      const response = await apiClient.get('/boms', { params: { pageSize: 100 } });
      setBoms(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load BOMs' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<BOM>[] = [
    { key: 'bomCode', header: 'Code', sortable: true, cell: (b) => <div className="font-medium">{b.bomCode}</div> },
    { key: 'bomName', header: 'BOM Name', sortable: true, cell: (b) => <div className="font-medium">{b.bomName}</div> },
    { key: 'version', header: 'Version', sortable: true, cell: (b) => <Badge variant="outline">{b.version}</Badge> },
    { key: 'status', header: 'Status', sortable: true, cell: (b) => <Badge variant={b.status === 'APPROVED' ? 'success' : 'outline'}>{b.status}</Badge> },
    { key: 'actions', header: 'Actions', cell: (b) => <Button variant="ghost" size="sm" onClick={() => router.push(`/manufacturing/boms/${b.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Bill of Materials</h1><p className="text-muted-foreground mt-1">Manage production BOMs</p></div>
        <Button onClick={() => router.push('/manufacturing/boms/new')}><Plus className="mr-2 h-4 w-4" />New BOM</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total BOMs</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{boms.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{boms.filter(b => b.status === 'APPROVED').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Draft</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{boms.filter(b => b.status === 'DRAFT').length}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={boms} columns={columns} searchKey="bomName" searchPlaceholder="Search BOMs..." emptyMessage="No BOMs found." /></CardContent></Card>
    </div>
  );
}
