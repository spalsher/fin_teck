'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  DollarSign,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const navigation = [
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
      { name: 'GL Reports', href: '/finance/reports' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(() => {
    const open = new Set<string>();
    if (pathname?.startsWith('/finance')) open.add('Finance');
    return open;
  });

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

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
          const isOpen = openDropdowns.has(item.name);
          return (
            <div key={item.name} className="space-y-1">
              <button
                onClick={() => toggleDropdown(item.name)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <div className="flex items-center">
                  {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                  {item.name}
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {isOpen && (
                <div className="ml-9 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block rounded-md px-3 py-2 text-sm hover:bg-gray-800 hover:text-white ${isActive(child.href) ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
