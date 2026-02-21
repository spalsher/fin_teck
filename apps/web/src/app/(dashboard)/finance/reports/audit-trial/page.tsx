'use client';

import { useState, useCallback } from 'react';
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
import { format } from 'date-fns';

type AuditRow = {
  entryDate: string;
  journalNo: string;
  journalId: string;
  lineNo: number;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
};

export default function AuditTrialPage() {
  const { toast } = useToast();
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ rows: AuditRow[]; total: number } | null>(null);

  const runReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/finance/reports/audit-trial', {
        params: { fromDate, toDate, limit: 2000 },
      });
      setData(res.data);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load audit trial',
      });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/finance/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Audit Trial</h1>
          <p className="text-muted-foreground">Chronological list of all posted journal lines</p>
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
            <CardTitle>Audit Trial</CardTitle>
            <CardContent className="p-0 pt-2">
              <p className="text-sm text-muted-foreground">
                Showing up to 2,000 lines. Total: {data.total}
              </p>
            </CardContent>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Journal #</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
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
                  data.rows.map((r, i) => (
                    <TableRow key={`${r.journalId}-${r.lineNo}-${i}`}>
                      <TableCell>{r.entryDate}</TableCell>
                      <TableCell className="font-mono">{r.journalNo}</TableCell>
                      <TableCell><span className="font-mono">{r.accountCode}</span> {r.accountName}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell className="text-right font-mono">{r.debit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.credit.toLocaleString()}</TableCell>
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
