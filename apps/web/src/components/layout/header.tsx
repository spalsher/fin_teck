'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from './notification-bell';

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="text-sm text-gray-600">
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      <div className="flex items-center space-x-4">
        <NotificationBell />
        <div className="flex items-center space-x-3 rounded-md border px-3 py-2">
          <User className="h-5 w-5 text-gray-500" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
