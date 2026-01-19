'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Building2, ListTree } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountCategory: string;
  level: number;
  isControlAccount: boolean;
  allowDirectPosting: boolean;
  isActive: boolean;
  children?: Account[];
}

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await apiClient.get('/chart-of-accounts', { params: { pageSize: 1000 } });
      setAccounts(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load accounts' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Account>[] = [
    { key: 'accountCode', header: 'Code', sortable: true, cell: (a) => <div className="font-mono font-medium">{a.accountCode}</div> },
    { key: 'accountName', header: 'Account Name', sortable: true, cell: (a) => <div className="font-medium">{a.accountName}</div> },
    { key: 'accountType', header: 'Type', sortable: true, cell: (a) => <Badge variant="outline">{a.accountType}</Badge> },
    { key: 'accountCategory', header: 'Category', sortable: true, cell: (a) => <Badge variant="secondary">{a.accountCategory}</Badge> },
    { key: 'level', header: 'Level', sortable: true, cell: (a) => <div className="text-center">{a.level}</div> },
    { key: 'isControlAccount', header: 'Control', cell: (a) => a.isControlAccount ? <Badge variant="success">Yes</Badge> : <Badge variant="outline">No</Badge> },
    { key: 'allowDirectPosting', header: 'Direct Post', cell: (a) => a.allowDirectPosting ? <Badge variant="success">Yes</Badge> : <Badge variant="outline">No</Badge> },
    { key: 'isActive', header: 'Status', sortable: true, cell: (a) => <Badge variant={a.isActive ? "success" : "destructive"}>{a.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', cell: (a) => <Button variant="ghost" size="sm" onClick={() => router.push(`/finance/accounts/${a.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1><p className="text-muted-foreground mt-1">Manage your accounting structure</p></div>
        <Button onClick={() => router.push('/finance/accounts/new')}><Plus className="mr-2 h-4 w-4" />New Account</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Accounts</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{accounts.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Control Accounts</CardTitle><ListTree className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{accounts.filter(a => a.isControlAccount).length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Direct Posting</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{accounts.filter(a => a.allowDirectPosting).length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{accounts.filter(a => a.isActive).length}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={accounts} columns={columns} searchKey="accountName" searchPlaceholder="Search accounts..." emptyMessage="No accounts found." /></CardContent></Card>
    </div>
  );
}
