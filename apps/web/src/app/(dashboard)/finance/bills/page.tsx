'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Send, X, MoreHorizontal, DollarSign, FileText } from 'lucide-react';
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

interface Bill {
  id: string;
  billNo: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  balanceDue: number;
  status: string;
  vendor: {
    id: string;
    vendorCode: string;
    name: string;
  };
}

export default function BillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'post' | 'void' | null; bill: Bill | null }>({ open: false, action: null, bill: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    try {
      const response = await apiClient.get('/bills', { params: { pageSize: 100 } });
      setBills(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load bills' });
    } finally {
      setLoading(false);
    }
  }

  const filteredBills = useMemo(() => statusFilter === 'ALL' ? bills : bills.filter((b) => b.status === statusFilter), [bills, statusFilter]);
  const totals = useMemo(() => ({ total: filteredBills.reduce((sum, b) => sum + b.totalAmount, 0), due: filteredBills.reduce((sum, b) => sum + b.balanceDue, 0) }), [filteredBills]);

  async function handleAction() {
    if (!actionDialog.bill || !actionDialog.action) return;
    setProcessing(true);
    try {
      await apiClient.post(`/bills/${actionDialog.bill.id}/${actionDialog.action}`);
      toast({ title: "Success", description: `Bill ${actionDialog.action}ed successfully.` });
      await fetchBills();
      setActionDialog({ open: false, action: null, bill: null });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || `Failed to ${actionDialog.action} bill` });
    } finally {
      setProcessing(false);
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'outline';
      case 'POSTED': return 'default';
      case 'PAID': return 'success';
      case 'VOID': return 'destructive';
      default: return 'outline';
    }
  };

  const columns: Column<Bill>[] = [
    { key: 'billNo', header: 'Bill #', sortable: true, cell: (b) => <div className="font-medium">{b.billNo}</div> },
    { key: 'vendor', header: 'Vendor', cell: (b) => (<div><div className="font-medium">{b.vendor.name}</div><div className="text-sm text-muted-foreground">{b.vendor.vendorCode}</div></div>) },
    { key: 'billDate', header: 'Date', sortable: true, cell: (b) => new Date(b.billDate).toLocaleDateString() },
    { key: 'dueDate', header: 'Due Date', sortable: true, cell: (b) => new Date(b.dueDate).toLocaleDateString() },
    { key: 'totalAmount', header: 'Amount', sortable: true, cell: (b) => <div className="font-mono">PKR {b.totalAmount.toLocaleString()}</div> },
    { key: 'balanceDue', header: 'Balance Due', sortable: true, cell: (b) => <div className="font-mono text-orange-600">PKR {b.balanceDue.toLocaleString()}</div> },
    { key: 'status', header: 'Status', sortable: true, cell: (b) => <Badge variant={getStatusVariant(b.status)}>{b.status}</Badge> },
    {
      key: 'actions', header: 'Actions', cell: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/bills/${b.id}`)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            {b.status === 'DRAFT' && <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'post', bill: b })}><Send className="mr-2 h-4 w-4" />Post</DropdownMenuItem>}
            {b.status === 'POSTED' && <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'void', bill: b })} className="text-destructive focus:text-destructive"><X className="mr-2 h-4 w-4" />Void</DropdownMenuItem>}
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
        <div><h1 className="text-3xl font-bold tracking-tight">Bills</h1><p className="text-muted-foreground mt-1">Manage vendor bills</p></div>
        <Button onClick={() => router.push('/finance/bills/new')}><Plus className="mr-2 h-4 w-4" />New Bill</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Bills</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">PKR {totals.total.toLocaleString()}</div><p className="text-xs text-muted-foreground mt-1">{filteredBills.length} bills</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Balance Due</CardTitle><DollarSign className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">PKR {totals.due.toLocaleString()}</div><p className="text-xs text-muted-foreground mt-1">Outstanding</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Filter by Status</CardTitle></CardHeader><CardContent><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Statuses</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="POSTED">Posted</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="VOID">Void</SelectItem></SelectContent></Select></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={filteredBills} columns={columns} searchKey="billNo" searchPlaceholder="Search bills..." emptyMessage="No bills found." /></CardContent></Card>

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null, bill: null })}>
        <DialogContent><DialogHeader><DialogTitle>Confirm {actionDialog.action === 'post' ? 'Post' : 'Void'} Bill</DialogTitle><DialogDescription>Are you sure you want to {actionDialog.action} bill <strong>{actionDialog.bill?.billNo}</strong>?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, bill: null })} disabled={processing}>Cancel</Button><Button variant={actionDialog.action === 'void' ? 'destructive' : 'default'} onClick={handleAction} disabled={processing}>{processing ? 'Processing...' : actionDialog.action === 'post' ? 'Post' : 'Void'}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
