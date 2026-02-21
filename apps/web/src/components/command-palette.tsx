'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, DollarSign, FileText, Building2, Users } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const commands: Command[] = [
    { id: 'dashboard', label: 'Dashboard', description: 'Go to dashboard', icon: <DollarSign className="h-4 w-4" />, action: () => router.push('/dashboard') },
    { id: 'customers', label: 'Customers', description: 'Manage customers', icon: <Users className="h-4 w-4" />, action: () => router.push('/finance/customers'), keywords: ['finance'] },
    { id: 'invoices', label: 'Invoices', description: 'Manage invoices', icon: <FileText className="h-4 w-4" />, action: () => router.push('/finance/invoices'), keywords: ['finance'] },
    { id: 'receipts', label: 'Receipts', description: 'Manage receipts', icon: <DollarSign className="h-4 w-4" />, action: () => router.push('/finance/receipts'), keywords: ['finance'] },
    { id: 'vendors', label: 'Vendors', description: 'Manage vendors', icon: <Users className="h-4 w-4" />, action: () => router.push('/finance/vendors'), keywords: ['finance'] },
    { id: 'bills', label: 'Bills', description: 'Manage bills', icon: <FileText className="h-4 w-4" />, action: () => router.push('/finance/bills'), keywords: ['finance'] },
    { id: 'journals', label: 'Journal Entries', description: 'View journals', icon: <FileText className="h-4 w-4" />, action: () => router.push('/finance/journals'), keywords: ['finance'] },
    { id: 'accounts', label: 'Chart of Accounts', description: 'View accounts', icon: <FileText className="h-4 w-4" />, action: () => router.push('/finance/accounts'), keywords: ['finance'] },
    { id: 'banks', label: 'Bank Accounts', description: 'View bank accounts', icon: <Building2 className="h-4 w-4" />, action: () => router.push('/finance/banks'), keywords: ['finance'] },
    { id: 'reports', label: 'GL Reports', description: 'Finance reports', icon: <FileText className="h-4 w-4" />, action: () => router.push('/finance/reports'), keywords: ['finance'] },
  ];

  const filtered = search
    ? commands.filter((c) => {
        const s = search.toLowerCase();
        return c.label.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s) || c.keywords?.some((k) => k.toLowerCase().includes(s));
      })
    : commands;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const select = (cmd: Command) => {
    cmd.action();
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search finance pages..."
            className="flex h-12 w-full border-0 bg-transparent py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => select(cmd)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">{cmd.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{cmd.label}</p>
                    {cmd.description && <p className="text-xs text-muted-foreground">{cmd.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
