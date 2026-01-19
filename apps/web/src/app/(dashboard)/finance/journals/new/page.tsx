'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
}

interface FiscalPeriod {
  id: string;
  periodName: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fiscalPeriods, setFiscalPeriods] = useState<FiscalPeriod[]>([]);

  const [formData, setFormData] = useState({
    fiscalPeriodId: '',
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    journalType: 'MANUAL',
    source: 'MANUAL',
    sourceRef: '',
  });

  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountId: '', description: '', debit: 0, credit: 0 },
    { id: '2', accountId: '', description: '', debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    fetchAccounts();
    fetchFiscalPeriods();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await apiClient.get('/chart-of-accounts', {
        params: { pageSize: 1000, isActive: true },
      });
      setAccounts(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
    }
  }

  async function fetchFiscalPeriods() {
    try {
      // For now, we'll create a mock fiscal period since the endpoint may not exist
      // In a real app, you'd call the fiscal periods endpoint
      const currentYear = new Date().getFullYear();
      setFiscalPeriods([
        {
          id: 'default',
          periodName: `FY ${currentYear}`,
          fiscalYear: currentYear,
          startDate: `${currentYear}-01-01`,
          endDate: `${currentYear}-12-31`,
          status: 'OPEN',
        },
      ]);
      setFormData((prev) => ({ ...prev, fiscalPeriodId: 'default' }));
    } catch (err: any) {
      console.error('Failed to load fiscal periods:', err);
    }
  }

  function handleAddLine() {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        accountId: '',
        description: '',
        debit: 0,
        credit: 0,
      },
    ]);
  }

  function handleRemoveLine(id: string) {
    if (lines.length > 2) {
      setLines(lines.filter((line) => line.id !== id));
    }
  }

  function handleLineChange(id: string, field: keyof JournalLine, value: any) {
    setLines(
      lines.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]: field === 'debit' || field === 'credit' ? parseFloat(value) || 0 : value,
            }
          : line
      )
    );
  }

  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isBalanced) {
      setError('Journal entry must be balanced (total debit = total credit)');
      setLoading(false);
      return;
    }

    const validLines = lines.filter((line) => line.accountId && (line.debit > 0 || line.credit > 0));
    if (validLines.length < 2) {
      setError('Journal entry must have at least two lines');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/journal-entries', {
        fiscalPeriodId: formData.fiscalPeriodId,
        entryDate: new Date(formData.entryDate),
        description: formData.description,
        journalType: formData.journalType,
        source: formData.source,
        sourceRef: formData.sourceRef || undefined,
        lines: validLines.map((line) => ({
          accountId: line.accountId,
          description: line.description,
          debit: line.debit,
          credit: line.credit,
        })),
      });

      router.push('/finance/journals');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Journal Entry</h1>
        <p className="text-gray-600 mt-1">Create a manual journal posting</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Journal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Date *
              </label>
              <input
                type="date"
                required
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Journal Type *
              </label>
              <select
                value={formData.journalType}
                onChange={(e) => setFormData({ ...formData, journalType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MANUAL">Manual</option>
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="CLOSING">Closing</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the transaction"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={formData.sourceRef}
                onChange={(e) => setFormData({ ...formData, sourceRef: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="External reference"
              />
            </div>
          </div>
        </div>

        {/* Journal Lines */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Journal Lines</h2>
            <button
              type="button"
              onClick={handleAddLine}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Line
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={line.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-600 pt-2">
                  {index + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleLineChange(line.id, 'accountId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountCode} - {account.accountName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Line description"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.debit || ''}
                      onChange={(e) => {
                        handleLineChange(line.id, 'debit', e.target.value);
                        if (parseFloat(e.target.value) > 0) {
                          handleLineChange(line.id, 'credit', 0);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Debit"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.credit || ''}
                      onChange={(e) => {
                        handleLineChange(line.id, 'credit', e.target.value);
                        if (parseFloat(e.target.value) > 0) {
                          handleLineChange(line.id, 'debit', 0);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Credit"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                      disabled={lines.length <= 2}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Total Debit:</span>
              <span className="text-gray-900">PKR {totalDebit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Total Credit:</span>
              <span className="text-gray-900">PKR {totalCredit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t">
              <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>Difference:</span>
              <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                PKR {Math.abs(totalDebit - totalCredit).toLocaleString()}
                {isBalanced && ' ✓'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isBalanced}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Journal Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
