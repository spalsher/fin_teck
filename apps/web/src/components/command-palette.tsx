'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Users, Package, DollarSign, Building2, Factory, BarChart3, Settings, Shield, Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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
    // Dashboard
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Go to dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push('/dashboard'),
      keywords: ['home', 'main'],
    },
    
    // Finance
    {
      id: 'customers',
      label: 'Customers',
      description: 'View and manage customers',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/finance/customers'),
      keywords: ['finance', 'sales'],
    },
    {
      id: 'invoices',
      label: 'Invoices',
      description: 'View and manage invoices',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/finance/invoices'),
      keywords: ['finance', 'sales', 'billing'],
    },
    {
      id: 'receipts',
      label: 'Receipts',
      description: 'View payment receipts',
      icon: <DollarSign className="h-4 w-4" />,
      action: () => router.push('/finance/receipts'),
      keywords: ['finance', 'payments'],
    },
    {
      id: 'vendors',
      label: 'Vendors',
      description: 'View and manage vendors',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/finance/vendors'),
      keywords: ['finance', 'suppliers'],
    },
    {
      id: 'bills',
      label: 'Bills',
      description: 'View and manage bills',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/finance/bills'),
      keywords: ['finance', 'payables'],
    },
    {
      id: 'journals',
      label: 'Journal Entries',
      description: 'View journal entries',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/finance/journals'),
      keywords: ['finance', 'accounting'],
    },
    {
      id: 'accounts',
      label: 'Chart of Accounts',
      description: 'View chart of accounts',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/finance/accounts'),
      keywords: ['finance', 'accounting'],
    },
    {
      id: 'banks',
      label: 'Bank Accounts',
      description: 'View bank accounts',
      icon: <Building2 className="h-4 w-4" />,
      action: () => router.push('/finance/banks'),
      keywords: ['finance', 'banking'],
    },
    
    // SCM
    {
      id: 'items',
      label: 'Items',
      description: 'View and manage items',
      icon: <Package className="h-4 w-4" />,
      action: () => router.push('/scm/items'),
      keywords: ['scm', 'inventory', 'products'],
    },
    {
      id: 'warehouses',
      label: 'Warehouses',
      description: 'View and manage warehouses',
      icon: <Building2 className="h-4 w-4" />,
      action: () => router.push('/scm/warehouses'),
      keywords: ['scm', 'inventory'],
    },
    {
      id: 'purchase-orders',
      label: 'Purchase Orders',
      description: 'View and manage purchase orders',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/scm/purchase-orders'),
      keywords: ['scm', 'procurement'],
    },
    
    // HRMS
    {
      id: 'employees',
      label: 'Employees',
      description: 'View and manage employees',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/hrms/employees'),
      keywords: ['hrms', 'hr', 'staff'],
    },
    
    // Assets
    {
      id: 'assets',
      label: 'Assets',
      description: 'View and manage assets',
      icon: <Building2 className="h-4 w-4" />,
      action: () => router.push('/assets'),
      keywords: ['fixed assets'],
    },
    
    // Manufacturing
    {
      id: 'boms',
      label: 'Bill of Materials',
      description: 'View and manage BOMs',
      icon: <Factory className="h-4 w-4" />,
      action: () => router.push('/manufacturing/boms'),
      keywords: ['manufacturing', 'production'],
    },
    {
      id: 'production-orders',
      label: 'Production Orders',
      description: 'View and manage production orders',
      icon: <Factory className="h-4 w-4" />,
      action: () => router.push('/manufacturing/production-orders'),
      keywords: ['manufacturing', 'production'],
    },
    
    // Settings
    {
      id: 'settings',
      label: 'Settings',
      description: 'Application settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
    },
    {
      id: 'users',
      label: 'User Management',
      description: 'Manage users',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/users'),
      keywords: ['admin', 'users'],
    },
    {
      id: 'roles',
      label: 'Role Management',
      description: 'Manage roles and permissions',
      icon: <Shield className="h-4 w-4" />,
      action: () => router.push('/roles'),
      keywords: ['admin', 'permissions', 'security'],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'View all notifications',
      icon: <Bell className="h-4 w-4" />,
      action: () => router.push('/notifications'),
    },
  ];

  const filteredCommands = search
    ? commands.filter((command) => {
        const searchLower = search.toLowerCase();
        return (
          command.label.toLowerCase().includes(searchLower) ||
          command.description?.toLowerCase().includes(searchLower) ||
          command.keywords?.some((keyword) => keyword.toLowerCase().includes(searchLower))
        );
      })
    : commands;

  const handleSelect = (command: Command) => {
    command.action();
    setOpen(false);
    setSearch('');
  };

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for pages, features..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => handleSelect(command)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {command.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{command.label}</p>
                    {command.description && (
                      <p className="text-xs text-muted-foreground">
                        {command.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+K</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded">⌘K</kbd> to open</span>
            <span>Press <kbd className="px-1 py-0.5 bg-muted rounded">ESC</kbd> to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
