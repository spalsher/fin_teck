'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Landmark } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  iban?: string;
  isActive: boolean;
}

export default function BankAccountsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; account: BankAccount | null }>({ open: false, account: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  async function fetchBankAccounts() {
    try {
      const response = await apiClient.get('/bank-accounts', { params: { pageSize: 100 } });
      setBankAccounts(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load bank accounts' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteDialog.account) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/bank-accounts/${deleteDialog.account.id}`);
      toast({ title: "Bank account deleted", description: `${deleteDialog.account.accountName} has been deleted.` });
      setBankAccounts(bankAccounts.filter((a) => a.id !== deleteDialog.account!.id));
      setDeleteDialog({ open: false, account: null });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || 'Failed to delete bank account' });
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<BankAccount>[] = [
    { key: 'accountName', header: 'Account Name', sortable: true, cell: (a) => <div className="font-medium">{a.accountName}</div> },
    { key: 'accountNumber', header: 'Account Number', sortable: true, cell: (a) => <div className="font-mono">{a.accountNumber}</div> },
    { key: 'bankName', header: 'Bank Name', sortable: true, cell: (a) => (<div><div className="font-medium">{a.bankName}</div>{a.branchName && <div className="text-sm text-muted-foreground">{a.branchName}</div>}</div>) },
    { key: 'iban', header: 'IBAN', cell: (a) => a.iban ? <div className="font-mono text-sm">{a.iban}</div> : <span className="text-muted-foreground">-</span> },
    { key: 'isActive', header: 'Status', sortable: true, cell: (a) => <Badge variant={a.isActive ? "success" : "destructive"}>{a.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: 'Actions', cell: (a) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/banks/${a.id}`)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/finance/banks/${a.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, account: a })} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
        <div><h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1><p className="text-muted-foreground mt-1">Manage company bank accounts</p></div>
        <Button onClick={() => router.push('/finance/banks/new')}><Plus className="mr-2 h-4 w-4" />New Bank Account</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Accounts</CardTitle><Landmark className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{bankAccounts.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{bankAccounts.filter(a => a.isActive).length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{bankAccounts.filter(a => !a.isActive).length}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={bankAccounts} columns={columns} searchKey="accountName" searchPlaceholder="Search bank accounts..." emptyMessage="No bank accounts found." /></CardContent></Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, account: null })}>
        <DialogContent><DialogHeader><DialogTitle>Delete Bank Account</DialogTitle><DialogDescription>Are you sure you want to delete <strong>{deleteDialog.account?.accountName}</strong>? This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteDialog({ open: false, account: null })} disabled={deleting}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
