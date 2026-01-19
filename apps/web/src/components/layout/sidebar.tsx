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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Finance',
    icon: DollarSign,
    children: [
      { name: 'Customers', href: '/finance/customers' },
      { name: 'Invoices', href: '/finance/invoices' },
      { name: 'Receipts', href: '/finance/receipts' },
      { name: 'Vendors', href: '/finance/vendors' },
      { name: 'Bills', href: '/finance/bills' },
      { name: 'Journal Entries', href: '/finance/journals' },
      { name: 'Chart of Accounts', href: '/finance/accounts' },
      { name: 'Bank Accounts', href: '/finance/banks' },
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
  { name: 'Assets', href: '/assets', icon: Building2 },
  { name: 'Manufacturing', href: '/manufacturing', icon: Factory },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'User Management', href: '/users', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sidebar.tsx:Sidebar',message:'Sidebar render',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

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
                <div className="ml-9 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => {
                        // #region agent log
                        fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sidebar.tsx:Link:onClick',message:'Child link clicked',data:{href:child.href,name:child.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
                        // #endregion
                      }}
                      className={`block rounded-md px-3 py-2 text-sm ${
                        pathname === child.href
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sidebar.tsx:Link:onClick',message:'Top-level link clicked',data:{href:item.href,name:item.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
                // #endregion
              }}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? 'bg-gray-800 text-white'
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
