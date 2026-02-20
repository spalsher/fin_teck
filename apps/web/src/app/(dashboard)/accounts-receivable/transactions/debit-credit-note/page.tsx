'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftRight, Calendar, Plus, Trash2, Save,
  Search, X, ArrowLeft, Hash, FileCheck,
  CheckCircle2, AlertCircle, User, Tag, ChevronRight
} from 'lucide-react';

interface MemoLine {
  id: string;
  elementId: string;
  description: string;
  amount: number | string;
  taxDescription: string;
  taxPercent: number | string;
  taxAmount: number | string;
  total: number | string;
  elementList: string;
}

const emptyLine = (): MemoLine => ({
  id: Date.now().toString() + Math.random(),
  elementId: '',
  description: '',
  amount: '',
  taxDescription: '',
  taxPercent: '',
  taxAmount: '',
  total: '',
  elementList: '',
});

const CUSTOMERS = [
  { id: 'C001', name: 'MOHAMMAD MOHTASHIM Engr# X852251' },
  { id: 'C002', name: 'MUHAMMAD SHAHZAD Engr# Z909080' },
  { id: 'C003', name: 'Pak Qatar General Takaful Limited' },
  { id: 'C004', name: 'UBL Insurers Limited' },
  { id: 'C005', name: 'Habib Insurance Co. Limited' },
];

export default function ARDebitCreditNotePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [memoType, setMemoType] = useState<'Debit' | 'Credit'>('Credit');
  const [form, setForm] = useState({
    memoNo: '',
    date: today,
    agtInvNo: '',
    invDate: '',
    customerId: '',
    customerName: '',
    description: '',
  });

  const [lines, setLines] = useState<MemoLine[]>([emptyLine(), emptyLine()]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCustomerChange(id: string) {
    const c = CUSTOMERS.find((x) => x.id === id);
    setForm((f) => ({ ...f, customerId: id, customerName: c?.name || '' }));
  }

  function addLine() { setLines((p) => [...p, emptyLine()]); }
  function removeLine(id: string) { if (lines.length > 1) setLines((p) => p.filter((l) => l.id !== id)); }
  function updateLine(id: string, field: keyof MemoLine, value: string) {
    setLines((p) => p.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      const amt = parseFloat(String(field === 'amount' ? value : updated.amount)) || 0;
      const pct = parseFloat(String(field === 'taxPercent' ? value : updated.taxPercent)) || 0;
      const taxAmt = field === 'taxAmount' ? (parseFloat(value) || 0) : (amt * pct) / 100;
      updated.taxAmount = taxAmt ? taxAmt.toFixed(2) : updated.taxAmount;
      updated.total = (amt + (parseFloat(String(updated.taxAmount)) || 0)).toFixed(2);
      return updated;
    }));
  }

  function handleInsert() {
    setError(null);
    if (!form.customerId) return setError('Please select a customer / company.');
    setLoading(true);
    setTimeout(() => { setSaved(true); setLoading(false); setTimeout(() => router.back(), 1200); }, 800);
  }

  const accentColor = memoType === 'Debit' ? 'rose' : 'teal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${memoType === 'Debit' ? 'bg-rose-500/20 ring-1 ring-rose-500/30' : 'bg-teal-500/20 ring-1 ring-teal-500/30'}`}>
          <ArrowLeftRight className={`h-5 w-5 ${memoType === 'Debit' ? 'text-rose-400' : 'text-teal-400'}`} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Debit / Credit Note</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Transactions</span>
            <ChevronRight className="h-3 w-3" />
            <span className={memoType === 'Debit' ? 'text-rose-400' : 'text-teal-400'}>Debit / Credit Note</span>
          </div>
        </div>
        {/* Toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          <button type="button" onClick={() => setMemoType('Debit')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${memoType === 'Debit' ? 'bg-rose-600/40 text-rose-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            Debit Memo
          </button>
          <button type="button" onClick={() => setMemoType('Credit')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${memoType === 'Credit' ? 'bg-teal-600/40 text-teal-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            Credit Memo
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className={`border-b border-white/10 px-6 py-4 flex items-center gap-2 ${memoType === 'Debit' ? 'bg-gradient-to-r from-rose-600/30 via-red-600/20 to-slate-800/50' : 'bg-gradient-to-r from-teal-600/30 via-emerald-600/20 to-slate-800/50'}`}>
          <div className={`h-2 w-2 rounded-full animate-pulse ${memoType === 'Debit' ? 'bg-rose-400' : 'bg-teal-400'}`} />
          <span className="text-sm font-semibold text-white">New {memoType} Memo</span>
          <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${memoType === 'Debit' ? 'bg-rose-500/20 text-rose-400 ring-rose-500/30' : 'bg-teal-500/20 text-teal-400 ring-teal-500/30'}`}>
            {memoType === 'Debit' ? 'DM' : 'CM'}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Memo No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Memo No
              </label>
              <input type="text" value={form.memoNo} onChange={(e) => setForm({ ...form, memoNo: e.target.value })} placeholder="Memo No"
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-${accentColor}-500/60 focus:outline-none focus:ring-1 focus:ring-${accentColor}-500/30 transition-all`} />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-${accentColor}-500/60 focus:outline-none focus:ring-1 focus:ring-${accentColor}-500/30 transition-all [color-scheme:dark]`} />
            </div>

            {/* Memo Type */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Memo Type
              </label>
              <input type="text" value={`${memoType} Memo`} readOnly
                className={`w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2.5 text-sm ${memoType === 'Debit' ? 'text-rose-400' : 'text-teal-400'} cursor-default focus:outline-none`} />
            </div>

            {/* Against Invoice No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileCheck className="h-3 w-3" /> Agt Inv No
              </label>
              <div className="flex gap-2">
                <input type="text" value={form.agtInvNo} onChange={(e) => setForm({ ...form, agtInvNo: e.target.value })} placeholder="Invoice No"
                  className={`flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-${accentColor}-500/60 focus:outline-none font-mono transition-all`} />
                <button className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-${accentColor}-400 transition-all`}>
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Inv Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Inv Date
              </label>
              <input type="date" value={form.invDate} onChange={(e) => setForm({ ...form, invDate: e.target.value })}
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-${accentColor}-500/60 focus:outline-none transition-all [color-scheme:dark]`} />
            </div>

            {/* Company */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Company
              </label>
              <div className="flex gap-2">
                <select value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-28 flex-shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
                  <option value="">ID</option>
                  {CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
                <input type="text" value={form.customerName} readOnly placeholder="Company Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2 md:col-span-3 lg:col-span-4 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Description
              </label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-${accentColor}-500/60 focus:outline-none transition-all`} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10">
            <button type="button" onClick={addLine}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">
              <Plus className="h-4 w-4" /> Add Row
            </button>
            <button type="button" onClick={handleInsert} disabled={loading || saved}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 transition-all shadow-lg ${memoType === 'Debit' ? 'bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/20' : 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-teal-500/20'}`}>
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><Save className="h-4 w-4" /> Insert</>}
            </button>
            <button type="button"
              className="flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all">
              <Search className="h-4 w-4" /> Search
            </button>
            <button type="button" onClick={() => { setLines([emptyLine(), emptyLine()]); setForm({ memoNo: '', date: today, agtInvNo: '', invDate: '', customerId: '', customerName: '', description: '' }); setError(null); }}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="button" onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all">
              <X className="h-4 w-4" /> Exit
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Lines Table */}
          <div className="rounded-xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800/80 to-slate-700/50">
                    {['#', 'Element ID', 'Description', 'Amount', 'Tax Description', 'Tax %', 'Tax Amount', 'Total', 'Element List', ''].map((h, i) => (
                      <th key={i} className={`px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${['Amount', 'Tax %', 'Tax Amount', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="group bg-white/2 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500 font-mono text-xs w-8">{idx + 1}</td>
                      <td className="px-2 py-2 w-24">
                        <input type="text" value={line.elementId} onChange={(e) => updateLine(line.id, 'elementId', e.target.value)} placeholder="Element ID"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-indigo-300 placeholder-slate-600 focus:border-indigo-500/60 focus:outline-none transition-all font-mono" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} placeholder="Description..."
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="number" step="0.01" min="0" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', e.target.value)} placeholder="0.00"
                          className={`w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs ${memoType === 'Debit' ? 'text-rose-400' : 'text-teal-400'} text-right placeholder-slate-600 focus:outline-none transition-all`} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.taxDescription} onChange={(e) => updateLine(line.id, 'taxDescription', e.target.value)} placeholder="Tax description..."
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-20">
                        <input type="number" step="0.01" min="0" max="100" value={line.taxPercent} onChange={(e) => updateLine(line.id, 'taxPercent', e.target.value)} placeholder="0"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="number" step="0.01" min="0" value={line.taxAmount} onChange={(e) => updateLine(line.id, 'taxAmount', e.target.value)} placeholder="0.00"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="number" step="0.01" value={line.total} readOnly placeholder="0.00"
                          className="w-full rounded-md border border-white/10 bg-slate-800/40 px-2 py-1.5 text-xs text-emerald-400 text-right placeholder-slate-600 focus:outline-none cursor-default" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="text" value={line.elementList} onChange={(e) => updateLine(line.id, 'elementList', e.target.value)} placeholder="List"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-violet-400 placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-8">
                        <button type="button" onClick={() => removeLine(line.id)} disabled={lines.length <= 1}
                          className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-0 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                    <td colSpan={3} className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Totals</td>
                    <td className={`px-2 py-3 text-right font-mono text-sm font-bold ${memoType === 'Debit' ? 'text-rose-400' : 'text-teal-400'}`}>
                      {lines.reduce((s, l) => s + (parseFloat(String(l.amount)) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} />
                    <td className="px-2 py-3 text-right font-mono text-sm font-bold text-amber-400">
                      {lines.reduce((s, l) => s + (parseFloat(String(l.taxAmount)) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-sm font-bold text-emerald-400">
                      {lines.reduce((s, l) => s + (parseFloat(String(l.total)) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
