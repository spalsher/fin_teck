'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Send, X, MoreHorizontal, Scale, FileText } from 'lucide-react';
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

interface JournalEntry {
  id: string;
  journalNo: string;
  entryDate: string;
  description: string;
  journalType: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
  _count?: { journalEntryLines: number };
}

export default function JournalEntriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'post' | 'void' | null; journal: JournalEntry | null }>({ open: false, action: null, journal: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchJournals();
  }, []);

  async function fetchJournals() {
    try {
      const response = await apiClient.get('/journal-entries', { params: { pageSize: 100 } });
      setJournals(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load journal entries' });
    } finally {
      setLoading(false);
    }
  }

  const filteredJournals = useMemo(() => statusFilter === 'ALL' ? journals : journals.filter((j) => j.status === statusFilter), [journals, statusFilter]);
  const totals = useMemo(() => ({ debit: filteredJournals.reduce((sum, j) => sum + j.totalDebit, 0), credit: filteredJournals.reduce((sum, j) => sum + j.totalCredit, 0) }), [filteredJournals]);

  async function handleAction() {
    if (!actionDialog.journal || !actionDialog.action) return;
    setProcessing(true);
    try {
      await apiClient.post(`/journal-entries/${actionDialog.journal.id}/${actionDialog.action}`);
      toast({ title: "Success", description: `Journal entry ${actionDialog.action}ed successfully.` });
      await fetchJournals();
      setActionDialog({ open: false, action: null, journal: null });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || `Failed to ${actionDialog.action} journal entry` });
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

  const columns: Column<JournalEntry>[] = [
    { key: 'journalNo', header: 'Journal #', sortable: true, cell: (j) => <div className="font-medium">{j.journalNo}</div> },
    { key: 'entryDate', header: 'Date', sortable: true, cell: (j) => new Date(j.entryDate).toLocaleDateString() },
    { key: 'description', header: 'Description', cell: (j) => (<div><div className="font-medium">{j.description}</div><div className="text-sm text-muted-foreground">{j.journalType}</div></div>) },
    { key: 'totalDebit', header: 'Debit', sortable: true, cell: (j) => <div className="font-mono">PKR {j.totalDebit.toLocaleString()}</div> },
    { key: 'totalCredit', header: 'Credit', sortable: true, cell: (j) => <div className="font-mono">PKR {j.totalCredit.toLocaleString()}</div> },
    { key: 'status', header: 'Status', sortable: true, cell: (j) => <Badge variant={getStatusVariant(j.status)}>{j.status}</Badge> },
    {
      key: 'actions', header: 'Actions', cell: (j) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/journals/${j.id}`)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            {j.status === 'DRAFT' && <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'post', journal: j })}><Send className="mr-2 h-4 w-4" />Post</DropdownMenuItem>}
            {j.status === 'POSTED' && <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'void', journal: j })} className="text-destructive focus:text-destructive"><X className="mr-2 h-4 w-4" />Void</DropdownMenuItem>}
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
        <div><h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1><p className="text-muted-foreground mt-1">Manage general ledger entries</p></div>
        <Button onClick={() => router.push('/finance/journals/new')}><Plus className="mr-2 h-4 w-4" />New Journal Entry</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Entries</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filteredJournals.length}</div><p className="text-xs text-muted-foreground mt-1">Journal entries</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Debits</CardTitle><Scale className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">PKR {totals.debit.toLocaleString()}</div><p className="text-xs text-muted-foreground mt-1">Debit side</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Credits</CardTitle><Scale className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">PKR {totals.credit.toLocaleString()}</div><p className="text-xs text-muted-foreground mt-1">Credit side</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Filter</CardTitle></CardHeader><CardContent><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="POSTED">Posted</SelectItem><SelectItem value="VOID">Void</SelectItem></SelectContent></Select></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={filteredJournals} columns={columns} searchKey="journalNo" searchPlaceholder="Search journal entries..." emptyMessage="No journal entries found." /></CardContent></Card>

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null, journal: null })}>
        <DialogContent><DialogHeader><DialogTitle>Confirm {actionDialog.action === 'post' ? 'Post' : 'Void'} Journal Entry</DialogTitle><DialogDescription>Are you sure you want to {actionDialog.action} journal entry <strong>{actionDialog.journal?.journalNo}</strong>?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, journal: null })} disabled={processing}>Cancel</Button><Button variant={actionDialog.action === 'void' ? 'destructive' : 'default'} onClick={handleAction} disabled={processing}>{processing ? 'Processing...' : actionDialog.action === 'post' ? 'Post' : 'Void'}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
