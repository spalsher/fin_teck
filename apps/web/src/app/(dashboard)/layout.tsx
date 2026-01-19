'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CommandPalette } from '@/components/command-palette';
import { Toaster } from '@/components/ui/toaster';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [isChecking, setIsChecking] = useState(true);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:DashboardLayout',message:'Layout render',data:{pathname,isAuthenticated,hasHydrated,isChecking},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // Wait for the store to rehydrate from localStorage
    if (!hasHydrated) {
      return;
    }

    // Once hydrated, check authentication
    setIsChecking(false);

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router, pathname]);

  // Show loading state while checking authentication
  if (!hasHydrated || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <CommandPalette />
      <Toaster />
    </div>
  );
}
