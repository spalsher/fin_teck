'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, FileText, Send, X, MoreHorizontal, DollarSign } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  invoiceType: string;
  status: string;
  totalAmount: number;
  balanceDue: number;
  customer?: {
    id: string;
    customerCode: string;
    name: string;
  };
}

export default function InvoicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'post' | 'void' | null; invoice: Invoice | null }>({
    open: false,
    action: null,
    invoice: null,
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const response = await apiClient.get('/invoices');
      setInvoices(response.data.data || []);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to load invoices',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = useMemo(() => {
    return statusFilter === 'ALL'
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const totals = useMemo(() => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const balanceDue = filteredInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    return { totalAmount, balanceDue };
  }, [filteredInvoices]);

  async function handleAction() {
    if (!actionDialog.invoice || !actionDialog.action) return;

    setProcessing(true);
    try {
      await apiClient.post(`/invoices/${actionDialog.invoice.id}/${actionDialog.action}`);
      toast({
        title: "Success",
        description: `Invoice ${actionDialog.action === 'post' ? 'posted' : 'voided'} successfully.`,
      });
      await fetchInvoices();
      setActionDialog({ open: false, action: null, invoice: null });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || `Failed to ${actionDialog.action} invoice`,
      });
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

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice #',
      sortable: true,
      cell: (invoice) => (
        <div className="font-medium">{invoice.invoiceNo}</div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (invoice) => (
        <div>
          <div className="font-medium">{invoice.customer?.name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{invoice.customer?.customerCode}</div>
        </div>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Date',
      sortable: true,
      cell: (invoice) => new Date(invoice.invoiceDate).toLocaleDateString(),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      cell: (invoice) => new Date(invoice.dueDate).toLocaleDateString(),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      cell: (invoice) => (
        <div className="font-mono">PKR {invoice.totalAmount.toLocaleString()}</div>
      ),
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      sortable: true,
      cell: (invoice) => (
        <div className="font-mono text-orange-600">PKR {invoice.balanceDue.toLocaleString()}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (invoice) => (
        <Badge variant={getStatusVariant(invoice.status)}>
          {invoice.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (invoice) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${invoice.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            {invoice.status === 'DRAFT' && (
              <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'post', invoice })}>
                <Send className="mr-2 h-4 w-4" />
                Post
              </DropdownMenuItem>
            )}
            {invoice.status === 'POSTED' && (
              <DropdownMenuItem 
                onClick={() => setActionDialog({ open: true, action: 'void', invoice })}
                className="text-destructive focus:text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Void
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage your sales invoices</p>
        </div>
        <Button onClick={() => router.push('/finance/invoices/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totals.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">PKR {totals.balanceDue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="VOID">Void</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={filteredInvoices}
            columns={columns}
            searchKey="invoiceNo"
            searchPlaceholder="Search by invoice number or customer..."
            emptyMessage="No invoices found."
          />
        </CardContent>
      </Card>

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null, invoice: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {actionDialog.action === 'post' ? 'Post' : 'Void'} Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionDialog.action} invoice <strong>{actionDialog.invoice?.invoiceNo}</strong>?
              {actionDialog.action === 'void' && ' This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null, invoice: null })}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'void' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? 'Processing...' : actionDialog.action === 'post' ? 'Post' : 'Void'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
