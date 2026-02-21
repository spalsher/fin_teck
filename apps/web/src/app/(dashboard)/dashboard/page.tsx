import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const financeLinks = [
  { title: 'Customers', href: '/finance/customers' },
  { title: 'Vendors', href: '/finance/vendors' },
  { title: 'Invoices', href: '/finance/invoices' },
  { title: 'Bills', href: '/finance/bills' },
  { title: 'Receipts', href: '/finance/receipts' },
  { title: 'Journal Entries', href: '/finance/journals' },
  { title: 'Chart of Accounts', href: '/finance/accounts' },
  { title: 'Bank Accounts', href: '/finance/banks' },
  { title: 'GL Reports', href: '/finance/reports' },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Workspace</h1>
        <p className="text-muted-foreground mt-1">Only finance resources are enabled.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financeLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Open {item.title.toLowerCase()}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
