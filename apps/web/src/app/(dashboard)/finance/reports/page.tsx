'use client';

import Link from 'next/link';
import { FileText, Scale, List, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const reportLinks = [
  { href: '/finance/reports/trial-balance', title: 'Trial Balance', description: 'Summary of account balances for a date range', icon: Scale },
  { href: '/finance/reports/audit-trial', title: 'Audit Trial', description: 'Chronological list of all posted journal lines', icon: List },
  { href: '/finance/reports/account-ledger', title: 'Account Ledger', description: 'Transaction history and running balance for an account', icon: BookOpen },
];

export default function FinanceReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">GL reports (Trial Balance, Audit Trial, Account Ledger)</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportLinks.map((r) => (
          <Card key={r.href}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <r.icon className="h-5 w-5" />
                {r.title}
              </CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href={r.href}>Open report</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
