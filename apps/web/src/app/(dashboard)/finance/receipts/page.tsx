'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Send, X, MoreHorizontal, DollarSign, Receipt } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Receipt {
  id: string;
  receiptNo: string;
  receiptDate: string;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  status: string;
  customer: {
    id: string;
    customerCode: string;
    name: string;
  };
}

export default function ReceiptsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'post' | 'void' | null; receipt: Receipt | null }>({ open: false, action: null, receipt: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function fetchReceipts() {
    try {
      const response = await apiClient.get('/receipts', { params: { pageSize: 100 } });
      setReceipts(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load receipts' });
    } finally {
      setLoading(false);
    }
  }

  const filteredReceipts = useMemo(() => {
    return statusFilter === 'ALL' ? receipts : receipts.filter((r) => r.status === statusFilter);
  }, [receipts, statusFilter]);

  const total = useMemo(() => filteredReceipts.reduce((sum, r) => sum + r.amount, 0), [filteredReceipts]);

  async function handleAction() {
    if (!actionDialog.receipt || !actionDialog.action) return;
    setProcessing(true);
    try {
      await apiClient.post(`/receipts/${actionDialog.receipt.id}/${actionDialog.action}`);
      toast({ title: "Success", description: `Receipt ${actionDialog.action}ed successfully.` });
      await fetchReceipts();
      setActionDialog({ open: false, action: null, receipt: null });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || `Failed to ${actionDialog.action} receipt` });
    } finally {
      setProcessing(false);
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'outline';
      case 'POSTED': return 'success';
      case 'VOID': return 'destructive';
      default: return 'outline';
    }
  };

  const columns: Column<Receipt>[] = [
    { key: 'receiptNo', header: 'Receipt #', sortable: true, cell: (r) => <div className="font-medium">{r.receiptNo}</div> },
    { key: 'customer', header: 'Customer', cell: (r) => (<div><div className="font-medium">{r.customer.name}</div><div className="text-sm text-muted-foreground">{r.customer.customerCode}</div></div>) },
    { key: 'receiptDate', header: 'Date', sortable: true, cell: (r) => new Date(r.receiptDate).toLocaleDateString() },
    { key: 'amount', header: 'Amount', sortable: true, cell: (r) => <div className="font-mono">PKR {r.amount.toLocaleString()}</div> },
    { key: 'paymentMethod', header: 'Payment Method', cell: (r) => <Badge variant="outline">{r.paymentMethod}</Badge> },
    { key: 'status', header: 'Status', sortable: true, cell: (r) => <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge> },
    {
      key: 'actions', header: 'Actions', cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/receipts/${r.id}`)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            {r.status === 'DRAFT' && <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'post', receipt: r })}><Send className="mr-2 h-4 w-4" />Post</DropdownMenuItem>}
            {r.status === 'POSTED' && <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'void', receipt: r })} className="text-destructive focus:text-destructive"><X className="mr-2 h-4 w-4" />Void</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  if (loading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Receipts</h1><p className="text-muted-foreground mt-1">Manage customer receipts</p></div>
        <Button onClick={() => router.push('/finance/receipts/new')}><Plus className="mr-2 h-4 w-4" />New Receipt</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Receipts</CardTitle><Receipt className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">PKR {total.toLocaleString()}</div><p className="text-xs text-muted-foreground mt-1">{filteredReceipts.length} receipts</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Filter by Status</CardTitle></CardHeader><CardContent><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Statuses</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="POSTED">Posted</SelectItem><SelectItem value="VOID">Void</SelectItem></SelectContent></Select></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={filteredReceipts} columns={columns} searchKey="receiptNo" searchPlaceholder="Search receipts..." emptyMessage="No receipts found." /></CardContent></Card>

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null, receipt: null })}>
        <DialogContent><DialogHeader><DialogTitle>Confirm {actionDialog.action === 'post' ? 'Post' : 'Void'} Receipt</DialogTitle><DialogDescription>Are you sure you want to {actionDialog.action} receipt <strong>{actionDialog.receipt?.receiptNo}</strong>?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, receipt: null })} disabled={processing}>Cancel</Button><Button variant={actionDialog.action === 'void' ? 'destructive' : 'default'} onClick={handleAction} disabled={processing}>{processing ? 'Processing...' : actionDialog.action === 'post' ? 'Post' : 'Void'}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
