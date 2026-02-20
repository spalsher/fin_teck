'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  Building2,
  Factory,
  BarChart3,
  Settings,
  UserCog,
  ChevronRight,
  Landmark,
  Receipt,
} from 'lucide-react';

type NavChild = { name: string; href: string; group?: string };
type NavItem =
  | { name: string; href: string; icon: React.ComponentType<{ className?: string }>; children?: never }
  | { name: string; icon: React.ComponentType<{ className?: string }>; href?: never; children: NavChild[] };

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Finance',
    icon: DollarSign,
    children: [
      { name: 'Customers', href: '/finance/customers', group: 'Master Files' },
      { name: 'Vendors', href: '/finance/vendors', group: 'Master Files' },
      { name: 'Chart of Accounts', href: '/finance/accounts', group: 'Master Files' },
      { name: 'Bank Accounts', href: '/finance/banks', group: 'Master Files' },
      { name: 'Invoices', href: '/finance/invoices', group: 'Transactions' },
      { name: 'Receipts', href: '/finance/receipts', group: 'Transactions' },
      { name: 'Bills', href: '/finance/bills', group: 'Transactions' },
      { name: 'Journal Entries', href: '/finance/journals/new', group: 'Transactions' },
      { name: 'Audit Trial', href: '/finance/reports/audit-trial', group: 'Reports' },
      { name: 'Accounts Ledger', href: '/finance/reports/accounts-ledger', group: 'Reports' },
      { name: 'JV Print Out', href: '/finance/reports/jv-printout', group: 'Reports' },
    ],
  },
  {
    name: 'Supply Chain',
    icon: Package,
    children: [
      { name: 'Items', href: '/scm/items' },
      { name: 'Warehouses', href: '/scm/warehouses' },
      { name: 'Inventory', href: '/scm/inventory' },
      { name: 'Purchase Orders', href: '/scm/purchase-orders' },
      { name: 'Goods Receipt', href: '/scm/grn' },
    ],
  },
  {
    name: 'HRMS',
    icon: Users,
    children: [
      { name: 'Employees', href: '/hrms/employees' },
      { name: 'Departments', href: '/hrms/departments' },
      { name: 'Designations', href: '/hrms/designations' },
      { name: 'My Leaves', href: '/hrms/my-leaves' },
      { name: 'Attendance', href: '/hrms/attendance' },
      { name: 'Payroll', href: '/hrms/payroll' },
    ],
  },
  {
    name: 'Accounts Payable',
    icon: Landmark,
    children: [
      { name: 'Supplier Master', href: '/accounts-payable/master-files/supplier-master', group: 'Master Files' },
      { name: 'Enter Invoice', href: '/accounts-payable/invoices', group: 'Transactions' },
      { name: 'Payment Voucher', href: '/accounts-payable/payment-voucher', group: 'Transactions' },
      { name: 'Debit / Credit Memo', href: '/accounts-payable/debit-credit-memo', group: 'Transactions' },
      { name: 'Ledger Report', href: '/accounts-payable/reports/ledger', group: 'Reports' },
      { name: 'Dues Report', href: '/accounts-payable/reports/dues', group: 'Reports' },
      { name: 'Invoice Printout', href: '/accounts-payable/reports/invoice-printout', group: 'Reports' },
      { name: 'Payment Receipts', href: '/accounts-payable/reports/payment-receipts', group: 'Reports' },
    ],
  },
  {
    name: 'Accounts Receivable',
    icon: Receipt,
    children: [
      { name: 'Customer Master', href: '/accounts-receivable/master-files/customer-master', group: 'Master Files' },
      { name: 'AR Invoice Information', href: '/accounts-receivable/master-files/ar-invoice-info', group: 'Master Files' },
      { name: 'Manual Invoice', href: '/accounts-receivable/transactions/manual-invoice', group: 'Transactions' },
      { name: 'Create Bill', href: '/accounts-receivable/transactions/create-bill', group: 'Transactions' },
      { name: 'Payment Receipt', href: '/accounts-receivable/transactions/payment-receipt', group: 'Transactions' },
      { name: 'Debit / Credit Note', href: '/accounts-receivable/transactions/debit-credit-note', group: 'Transactions' },
    ],
  },
  { name: 'Assets', href: '/assets', icon: Building2 },
  { name: 'Manufacturing', href: '/manufacturing', icon: Factory },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'User Management', href: '/users', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function renderChildren(children: NavChild[]) {
    const groups: Record<string, NavChild[]> = {};
    const ungrouped: NavChild[] = [];

    children.forEach((child) => {
      if (child.group) {
        if (!groups[child.group]) groups[child.group] = [];
        groups[child.group].push(child);
      } else {
        ungrouped.push(child);
      }
    });

    const hasGroups = Object.keys(groups).length > 0;

    if (!hasGroups) {
      return (
        <div className="ml-9 space-y-0.5">
          {ungrouped.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === child.href || pathname.startsWith(child.href + '/')
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      );
    }

    const groupColors: Record<string, string> = {
      'Master Files': 'text-blue-400',
      'Transactions': 'text-emerald-400',
      'Reports': 'text-violet-400',
      'Accounts Payable': 'text-orange-400',
    };

    return (
      <div className="ml-9 space-y-3 mt-1">
        {ungrouped.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              pathname === child.href
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
            }`}
          >
            {child.name}
          </Link>
        ))}
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName}>
            <div className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${groupColors[groupName] || 'text-gray-500'}`}>
              <ChevronRight className="h-2.5 w-2.5" />
              {groupName}
            </div>
            <div className="space-y-0.5 mt-0.5">
              {items.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                    pathname === child.href || pathname.startsWith(child.href.replace('/new', '') + '/')
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-64 flex-col bg-gray-900">
      <div className="flex h-24 items-center justify-center border-b border-gray-800 px-4 py-3 bg-white">
        <div className="relative h-full w-full">
          <Image
            src="/iteck-logo.png"
            alt="iTecknologi"
            width={220}
            height={72}
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300">
                  {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                  {item.name}
                </div>
                {renderChildren(item.children)}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon && <item.icon className="mr-3 h-5 w-5" />}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
