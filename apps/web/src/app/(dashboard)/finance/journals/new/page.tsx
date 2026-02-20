'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, Save, Search, X, Upload, FileText,
  CheckCircle2, AlertCircle, BookOpen, Calendar, Hash,
  Tag, User, Eye
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
}

interface JournalLine {
  id: string;
  acId: string;
  accountId: string;
  accountCode: string;
  accountDescription: string;
  description: string;
  debit: number | string;
  credit: number | string;
  acType: string;
}

const emptyLine = (): JournalLine => ({
  id: Date.now().toString() + Math.random(),
  acId: '',
  accountId: '',
  accountCode: '',
  accountDescription: '',
  description: '',
  debit: '',
  credit: '',
  acType: '',
});

export default function NewJournalEntryPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    voucherNo: 'JV-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
    voucherDate: today,
    description: '',
    name: '',
    category: 'Manual',
  });

  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await apiClient.get('/chart-of-accounts', { params: { pageSize: 1000, isActive: true } });
      setAccounts(res.data.data || []);
    } catch {
      /* silent */
    }
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(id: string) {
    if (lines.length > 2) setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLine(id: string, field: keyof JournalLine, value: string) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        if (field === 'accountId') {
          const acc = accounts.find((a) => a.id === value);
          return {
            ...line,
            accountId: value,
            accountCode: acc?.accountCode || '',
            accountDescription: acc?.accountName || '',
            acType: acc?.accountType || '',
          };
        }
        return { ...line, [field]: value };
      })
    );
  }

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(String(l.debit)) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(String(l.credit)) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  async function handleInsert() {
    setError(null);
    if (!form.description.trim()) return setError('Description is required.');
    if (!isBalanced) return setError('Debit and Credit totals must be equal and greater than zero.');

    const validLines = lines.filter((l) => l.accountId && (parseFloat(String(l.debit)) > 0 || parseFloat(String(l.credit)) > 0));
    if (validLines.length < 2) return setError('At least two lines with accounts and amounts are required.');

    setLoading(true);
    try {
      await apiClient.post('/journal-entries', {
        fiscalPeriodId: 'default',
        entryDate: new Date(form.voucherDate),
        description: form.description,
        journalType: form.category.toUpperCase().replace(' ', '_'),
        source: 'MANUAL',
        lines: validLines.map((l) => ({
          accountId: l.accountId,
          description: l.description || form.description,
          debit: parseFloat(String(l.debit)) || 0,
          credit: parseFloat(String(l.credit)) || 0,
        })),
      });
      setSaved(true);
      setTimeout(() => router.push('/finance/journals'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save journal entry.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    router.push('/finance/journals');
  }

  const categoryOptions = ['Manual', 'Adjustment', 'Closing', 'Opening', 'Reversal'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
          <BookOpen className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Journal Entries</h1>
          <p className="text-xs text-slate-400 mt-0.5">Finance › Transactions › Journal Entries</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-sm font-semibold text-white">New Journal Voucher</span>
            </div>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
              DRAFT
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {/* Voucher No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Voucher No
              </label>
              <input
                type="text"
                value={form.voucherNo}
                onChange={(e) => setForm({ ...form, voucherNo: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500/60 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                placeholder="Auto-generated"
              />
            </div>

            {/* Voucher Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Voucher Date
              </label>
              <input
                type="date"
                value={form.voucherDate}
                onChange={(e) => setForm({ ...form, voucherDate: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                placeholder="Entered by"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Description - full width */}
            <div className="col-span-2 md:col-span-3 lg:col-span-3 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3 w-3" /> Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                placeholder="Brief description of this journal entry..."
              />
            </div>

            {/* Upload PDF */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Upload className="h-3 w-3" /> Upload PDF
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all truncate"
                >
                  <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{fileName || 'Choose file...'}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                />
                {fileName && (
                  <button
                    type="button"
                    onClick={() => setFileName('')}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10">
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600/60 hover:text-white transition-all"
            >
              <Plus className="h-4 w-4" /> Add Row
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={loading || saved}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20"
            >
              {saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved!</>
              ) : loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Insert</>
              )}
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all"
            >
              <Search className="h-4 w-4" /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setLines([emptyLine(), emptyLine()]);
                setForm({ ...form, description: '', name: '' });
                setError(null);
              }}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
            >
              <X className="h-4 w-4" /> Exit
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Journal Lines Table */}
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800/80 to-slate-700/50">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
                    S.No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">
                    AC ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-36">
                    Account Code
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Account Description
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                    Debit
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                    Credit
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">
                    A/C
                  </th>
                  <th className="px-2 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lines.map((line, idx) => (
                  <tr
                    key={line.id}
                    className="group bg-white/2 hover:bg-white/5 transition-colors"
                  >
                    {/* S.No */}
                    <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">{idx + 1}</td>

                    {/* AC ID (account select) */}
                    <td className="px-2 py-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white focus:border-indigo-500/60 focus:outline-none transition-all"
                      >
                        <option value="">—</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.accountCode}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Account Code (auto-filled) */}
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs text-indigo-300">
                        {line.accountCode || <span className="text-slate-600">—</span>}
                      </span>
                    </td>

                    {/* Account Description (auto-filled) */}
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-slate-300">
                        {line.accountDescription || <span className="text-slate-600">Select account above</span>}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        placeholder="Line description..."
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/60 focus:outline-none transition-all"
                      />
                    </td>

                    {/* Debit */}
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit}
                        onChange={(e) => {
                          updateLine(line.id, 'debit', e.target.value);
                          if (parseFloat(e.target.value) > 0) updateLine(line.id, 'credit', '');
                        }}
                        placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-emerald-400 text-right placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none transition-all"
                      />
                    </td>

                    {/* Credit */}
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit}
                        onChange={(e) => {
                          updateLine(line.id, 'credit', e.target.value);
                          if (parseFloat(e.target.value) > 0) updateLine(line.id, 'debit', '');
                        }}
                        placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-sky-400 text-right placeholder-slate-600 focus:border-sky-500/60 focus:outline-none transition-all"
                      />
                    </td>

                    {/* A/C type */}
                    <td className="px-3 py-2.5 text-center">
                      {line.acType && (
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400 uppercase">
                          {line.acType.slice(0, 3)}
                        </span>
                      )}
                    </td>

                    {/* Remove */}
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length <= 2}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-0 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals Footer */}
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={5} className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Totals
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className={`font-mono text-sm font-bold ${isBalanced ? 'text-emerald-400' : totalDebit > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className={`font-mono text-sm font-bold ${isBalanced ? 'text-sky-400' : totalCredit > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td colSpan={2} className="px-3 py-3 text-center">
                    {isBalanced ? (
                      <span className="flex items-center justify-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Balanced
                      </span>
                    ) : (totalDebit > 0 || totalCredit > 0) ? (
                      <span className="flex items-center justify-center gap-1 text-xs text-amber-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> Off by {Math.abs(totalDebit - totalCredit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    ) : null}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom info */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>{lines.length} line{lines.length !== 1 ? 's' : ''} · Click &ldquo;Add Row&rdquo; to add more</span>
            <span className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${isBalanced ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              {isBalanced ? 'Entry is balanced and ready to post' : 'Entry not balanced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
