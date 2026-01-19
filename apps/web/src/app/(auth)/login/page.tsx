'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user, expiresIn } = response.data;

      // Store token expiry time
      const expiryTime = Date.now() + (expiresIn || 3600) * 1000;
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <div className="relative h-20 w-full max-w-[280px]">
              <Image 
                src="/iteck-logo.png"
                alt="iTecknologi Logo" 
                width={280}
                height={80}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center mb-6">
            <CardDescription className="text-base">Sign in to your account</CardDescription>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@iteck.pk"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>Signing in...</>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>

            <div className="rounded-lg bg-muted p-4 text-center text-sm">
              <p className="font-medium text-muted-foreground">Default credentials for testing:</p>
              <p className="mt-2 font-mono text-xs">
                <span className="font-semibold">admin@iteck.pk</span> / <span className="font-semibold">Admin@123!</span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
