'use client';

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface AccountLedgerRow {
  entryDate: string;
  journalNo: string;
  journalId: string;
  lineNo: number;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface ChartAccount {
  id: string;
  accountCode: string;
  accountName: string;
}

export default function AccountLedgerPage() {
  const { toast } = useToast();
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    rows: AccountLedgerRow[];
    accountCode: string;
    accountName: string;
    fromDate: string;
    toDate: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/chart-of-accounts', { params: { pageSize: 500 } });
        const list = res.data?.data ?? [];
        setAccounts(list);
        if (list.length > 0 && !accountId) setAccountId(list[0].id);
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load accounts' });
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, [toast]);

  const runReport = useCallback(async () => {
    if (!accountId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Select an account' });
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get('/finance/reports/account-ledger', {
        params: { accountId, fromDate, toDate },
      });
      setData(res.data);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load account ledger',
      });
    } finally {
      setLoading(false);
    }
  }, [accountId, fromDate, toDate, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Account Ledger</h1>
          <p className="text-muted-foreground">Transaction history and running balance for an account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <div className="flex flex-wrap items-end gap-4 pt-2">
            <div className="space-y-2 min-w-[200px]">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId} disabled={loadingAccounts}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.accountCode} – {a.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From date</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To date</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <Button onClick={runReport} disabled={loading || loadingAccounts}>
              {loading ? 'Loading...' : 'Run report'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading && <Skeleton className="h-64 w-full" />}
      {!loading && data && (
        <Card>
          <CardHeader>
            <CardTitle>Account Ledger – {data.accountCode} {data.accountName}</CardTitle>
            <CardContent className="p-0 pt-2">
              <p className="text-sm text-muted-foreground">
                From {data.fromDate} to {data.toDate}
              </p>
            </CardContent>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Journal #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No transactions for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  data.rows.map((r, i) => (
                    <TableRow key={`${r.journalId}-${r.lineNo}-${i}`}>
                      <TableCell>{r.entryDate}</TableCell>
                      <TableCell className="font-mono">{r.journalNo}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell className="text-right font-mono">{r.debit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.credit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.runningBalance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
