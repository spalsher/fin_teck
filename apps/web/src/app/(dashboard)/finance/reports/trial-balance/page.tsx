'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function TrialBalancePage() {
  const { toast } = useToast();
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ rows: TrialBalanceRow[]; fromDate: string; toDate: string } | null>(null);

  const runReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/finance/reports/trial-balance', {
        params: { fromDate, toDate },
      });
      setData(res.data);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load trial balance',
      });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, toast]);

  const totalDebit = data?.rows?.reduce((s, r) => s + r.debit, 0) ?? 0;
  const totalCredit = data?.rows?.reduce((s, r) => s + r.credit, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground">Summary of account balances for the selected period</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <div className="flex flex-wrap items-end gap-4 pt-2">
            <div className="space-y-2">
              <Label>From date</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To date</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <Button onClick={runReport} disabled={loading}>
              {loading ? 'Loading...' : 'Run report'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading && <Skeleton className="h-64 w-full" />}
      {!loading && data && (
        <Card>
          <CardHeader>
            <CardTitle>Trial Balance</CardTitle>
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
                  <TableHead>Account code</TableHead>
                  <TableHead>Account name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No data for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  data.rows.map((r) => (
                    <TableRow key={r.accountId}>
                      <TableCell className="font-mono">{r.accountCode}</TableCell>
                      <TableCell>{r.accountName}</TableCell>
                      <TableCell>{r.accountType}</TableCell>
                      <TableCell className="text-right font-mono">{r.debit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.credit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
                {data.rows.length > 0 && (
                  <TableRow className="font-medium">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right font-mono">{totalDebit.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{totalCredit.toLocaleString()}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
