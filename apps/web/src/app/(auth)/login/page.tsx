'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, Building2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: loginId.trim(),
        password,
      });
      const { accessToken, refreshToken, user, expiresIn } = response.data;

      const expiryTime = Date.now() + (expiresIn || 3600) * 1000;
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      const lower = (msg as string).toLowerCase();
      if (lower.includes('invalid') || lower.includes('password')) {
        setError('Invalid username/email or password. Please check your credentials and try again.');
      } else if (!err.response && (err.message === 'Network Error' || err.apiHint)) {
        setError(err.apiHint || 'Cannot reach the API. Start the API from apps/api: pnpm run start:dev');
      } else if (lower.includes('connect') || lower.includes('network')) {
        setError('Cannot connect to server. Please ensure the backend is running on the configured port.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-0 font-sans">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-[length:400%_400%] animate-[gradientShift_18s_ease_infinite]"
          style={{
            background: 'linear-gradient(145deg, #0c4a6e 0%, #0369a1 22%, #0284c7 45%, #0ea5e9 70%, #38bdf8 90%, #7dd3fc 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(circle at 15% 40%, rgba(14, 165, 233, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 15%, rgba(125, 211, 252, 0.25) 0%, transparent 40%)',
          }}
        />
        <div className="absolute inset-0">
          <div className="absolute w-[480px] h-[480px] -top-32 -left-32 rounded-full bg-gradient-to-br from-sky-700 to-sky-500 opacity-40 blur-3xl animate-pulse" />
          <div className="absolute w-[380px] h-[380px] -bottom-20 -right-20 rounded-full bg-gradient-to-br from-sky-600 to-sky-400 opacity-40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute w-[320px] h-[320px] top-[45%] right-[8%] rounded-full bg-gradient-to-br from-sky-500 to-sky-300 opacity-40 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 p-6 lg:p-12 items-center">
        {/* Branding */}
        <div className="text-white flex flex-col gap-6 order-2 lg:order-1">
          <div className="w-28 h-28 bg-white/95 backdrop-blur border-2 border-white/70 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
            <Image src="/iteck-logo.png" alt="iTecknologi" width={112} height={112} className="object-contain w-full h-full" priority />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-sm tracking-tight leading-tight">
              iTeck ERP
            </h1>
            <p className="text-lg text-white/90 mt-2">
              Your gateway to seamless workplace management
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-3 text-white/95 text-base font-medium">
              <Sparkles className="h-5 w-5 text-sky-200 shrink-0" />
              <span>Secure Access</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-base font-medium">
              <Sparkles className="h-5 w-5 text-sky-200 shrink-0" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-base font-medium">
              <Sparkles className="h-5 w-5 text-sky-200 shrink-0" />
              <span>Requisitions & Approvals</span>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="order-1 lg:order-2 flex justify-center items-center">
          <div className="w-full max-w-[440px] bg-sky-50/95 border border-sky-200/30 rounded-2xl p-10 shadow-xl shadow-sky-500/10 hover:shadow-2xl hover:shadow-sky-500/15 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <LogIn className="h-4 w-4" />
                Welcome Back
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sign in to continue</h2>
              <p className="text-sm text-sky-600 mt-1">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-200 text-red-800 font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="loginId"
                  className={`text-sm font-semibold block transition-colors ${focusedField === 'loginId' || loginId ? 'text-sky-700' : 'text-sky-600'}`}
                >
                  Username or Email
                </label>
                <div
                  className={`flex items-center bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                    focusedField === 'loginId' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-gray-200'
                  } ${error ? 'border-red-300 bg-red-50/50' : ''}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center text-gray-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(e) => { setLoginId(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('loginId')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Username or email address"
                    required
                    autoComplete="username"
                    className="flex-1 min-w-0 py-3 px-2 bg-transparent border-none text-gray-800 text-[15px] font-medium outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className={`text-sm font-semibold block transition-colors ${focusedField === 'password' || password ? 'text-sky-700' : 'text-sky-600'}`}
                >
                  Password
                </label>
                <div
                  className={`flex items-center bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                    focusedField === 'password' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-gray-200'
                  } ${error ? 'border-red-300 bg-red-50/50' : ''}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center text-gray-400 shrink-0">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="flex-1 min-w-0 py-3 px-2 bg-transparent border-none text-gray-800 text-[15px] font-medium outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-3 text-gray-400 hover:text-gray-600 shrink-0"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-white/60 border border-sky-100 text-center text-sm">
              <p className="font-medium text-sky-700">Default credentials</p>
              <p className="mt-1 font-mono text-xs text-sky-600">admin@iteck.pk / Admin@123!</p>
              <p className="mt-2 text-xs text-sky-600">First time? From repo root: <code className="bg-white/80 px-1 rounded">cd apps/api &amp;&amp; pnpm run seed</code></p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
