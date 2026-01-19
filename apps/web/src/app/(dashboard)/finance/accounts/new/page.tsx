'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  level: number;
}

export default function NewAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'ASSET',
    accountCategory: 'CURRENT_ASSET',
    parentId: '',
    level: 1,
    isControlAccount: false,
    allowDirectPosting: true,
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await apiClient.get('/chart-of-accounts', {
        params: { pageSize: 1000 },
      });
      setAccounts(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
    }
  }

  const categoryOptions: Record<string, string[]> = {
    ASSET: ['CURRENT_ASSET', 'FIXED_ASSET', 'OTHER_ASSET'],
    LIABILITY: ['CURRENT_LIABILITY', 'LONG_TERM_LIABILITY', 'OTHER_LIABILITY'],
    EQUITY: ['CAPITAL', 'RETAINED_EARNINGS', 'OTHER_EQUITY'],
    INCOME: ['OPERATING_INCOME', 'NON_OPERATING_INCOME', 'OTHER_INCOME'],
    EXPENSE: ['OPERATING_EXPENSE', 'NON_OPERATING_EXPENSE', 'OTHER_EXPENSE'],
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/chart-of-accounts', {
        ...formData,
        parentId: formData.parentId || undefined,
      });

      router.push('/finance/accounts');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Account</h1>
        <p className="text-gray-600 mt-1">Create a new chart of accounts entry</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Code *
              </label>
              <input
                type="text"
                required
                value={formData.accountCode}
                onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1010"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cash in Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData,
                    accountType: newType,
                    accountCategory: categoryOptions[newType][0],
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.accountCategory}
                onChange={(e) => setFormData({ ...formData, accountCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions[formData.accountType].map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Account
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => {
                  const parent = accounts.find((a) => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    parentId: e.target.value,
                    level: parent ? parent.level + 1 : 1,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (Top Level)</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {'  '.repeat(account.level - 1)}
                    {account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isControlAccount}
                onChange={(e) =>
                  setFormData({ ...formData, isControlAccount: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Control Account (has sub-accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowDirectPosting}
                onChange={(e) =>
                  setFormData({ ...formData, allowDirectPosting: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Allow Direct Posting (transactions can be posted to this account)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
