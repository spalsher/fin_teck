'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  finance: 'Finance',
  customers: 'Customers',
  invoices: 'Invoices',
  receipts: 'Receipts',
  vendors: 'Vendors',
  bills: 'Bills',
  journals: 'Journal Entries',
  accounts: 'Chart of Accounts',
  banks: 'Bank Accounts',
  scm: 'Supply Chain',
  items: 'Items',
  warehouses: 'Warehouses',
  inventory: 'Inventory',
  'purchase-orders': 'Purchase Orders',
  grn: 'Goods Receipt',
  hrms: 'HRMS',
  employees: 'Employees',
  payroll: 'Payroll',
  assets: 'Assets',
  manufacturing: 'Manufacturing',
  boms: 'Bill of Materials',
  'production-orders': 'Production Orders',
  reports: 'Reports',
  settings: 'Settings',
  users: 'User Management',
  roles: 'Role Management',
  notifications: 'Notifications',
  new: 'New',
  edit: 'Edit',
  permissions: 'Permissions',
  kanban: 'Kanban View',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Split path and filter out empty segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on root or dashboard
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
