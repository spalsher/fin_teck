'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftRight, Calendar, Plus, Trash2, Save,
  Search, X, ArrowLeft, Hash, FileCheck,
  CheckCircle2, AlertCircle, User, Tag
} from 'lucide-react';

interface MemoLine {
  id: string;
  acId: string;
  combination: string;
  description: string;
  amount: number | string;
  taxId: string;
  taxDescription: string;
  acType: string;
  tax: number | string;
}

const emptyLine = (): MemoLine => ({
  id: Date.now().toString() + Math.random(),
  acId: '',
  combination: '',
  description: '',
  amount: '',
  taxId: '',
  taxDescription: '',
  acType: '',
  tax: '',
});

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
  { id: 'S004', name: 'Concrete Plus' },
];

export default function DebitCreditMemoPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [memoType, setMemoType] = useState<'Debit' | 'Credit'>('Debit');
  const [form, setForm] = useState({
    dnNo: '',
    dnDate: today,
    drCrMemo: 'Debit Memo',
    againstInv: '',
    supplierId: '',
    supplierName: '',
  });

  const [lines, setLines] = useState<MemoLine[]>([emptyLine(), emptyLine()]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = lines.reduce((s, l) => s + (parseFloat(String(l.amount)) || 0), 0);
  const totalTax = lines.reduce((s, l) => s + (parseFloat(String(l.tax)) || 0), 0);

  function handleSupplierChange(id: string) {
    const s = SUPPLIERS.find((x) => x.id === id);
    setForm((f) => ({ ...f, supplierId: id, supplierName: s?.name || '' }));
  }

  function addLine() { setLines((p) => [...p, emptyLine()]); }
  function removeLine(id: string) { if (lines.length > 1) setLines((p) => p.filter((l) => l.id !== id)); }
  function updateLine(id: string, field: keyof MemoLine, value: string) {
    setLines((p) => p.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  function handleInsert() {
    setError(null);
    if (!form.supplierId) return setError('Please select a supplier.');
    if (totalAmount <= 0) return setError('At least one line with amount is required.');
    setLoading(true);
    setTimeout(() => { setSaved(true); setLoading(false); setTimeout(() => router.back(), 1200); }, 800);
  }

  function handleMemoTypeChange(type: 'Debit' | 'Credit') {
    setMemoType(type);
    setForm((f) => ({ ...f, drCrMemo: `${type} Memo` }));
  }

  const accentColor = memoType === 'Debit' ? 'rose' : 'teal';
  const accentFrom = memoType === 'Debit' ? 'from-rose-600/30' : 'from-teal-600/30';
  const accentVia = memoType === 'Debit' ? 'via-red-600/20' : 'via-emerald-600/20';
  const dotColor = memoType === 'Debit' ? 'bg-rose-400' : 'bg-teal-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accentColor}-500/20 ring-1 ring-${accentColor}-500/30`}>
          <ArrowLeftRight className={`h-5 w-5 text-${accentColor}-400`} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Debit / Credit Memo</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Transactions › Debit / Credit Memo</p>
        </div>

        {/* Toggle Debit/Credit */}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          <button type="button" onClick={() => handleMemoTypeChange('Debit')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${memoType === 'Debit' ? 'bg-rose-600/40 text-rose-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            Debit Memo
          </button>
          <button type="button" onClick={() => handleMemoTypeChange('Credit')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${memoType === 'Credit' ? 'bg-teal-600/40 text-teal-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            Credit Memo
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className={`bg-gradient-to-r ${accentFrom} ${accentVia} to-slate-800/50 border-b border-white/10 px-6 py-4`}>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
            <span className="text-sm font-semibold text-white">New {memoType} Note</span>
            <span className={`ml-2 rounded-full bg-${accentColor}-500/20 px-2.5 py-0.5 text-xs font-semibold text-${accentColor}-400 ring-1 ring-${accentColor}-500/30`}>
              {memoType === 'Debit' ? 'DN' : 'CN'}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Form Fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* DN/CN No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> {memoType === 'Debit' ? 'DN' : 'CN'} No
              </label>
              <input type="text" value={form.dnNo} onChange={(e) => setForm({ ...form, dnNo: e.target.value })} placeholder="Note No"
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-${accentColor}-500/60 focus:outline-none focus:ring-1 focus:ring-${accentColor}-500/30 transition-all`} />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> {memoType === 'Debit' ? 'DN' : 'CN'} Date
              </label>
              <input type="date" value={form.dnDate} onChange={(e) => setForm({ ...form, dnDate: e.target.value })}
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-${accentColor}-500/60 focus:outline-none focus:ring-1 focus:ring-${accentColor}-500/30 transition-all [color-scheme:dark]`} />
            </div>

            {/* Dr/Cr Memo */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Dr/Cr Memo
              </label>
              <input type="text" value={form.drCrMemo} onChange={(e) => setForm({ ...form, drCrMemo: e.target.value })}
                className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-${accentColor}-500/60 focus:outline-none focus:ring-1 focus:ring-${accentColor}-500/30 transition-all`} />
            </div>

            {/* Against Invoice */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileCheck className="h-3 w-3" /> Against Inv
              </label>
              <div className="flex gap-2">
                <input type="text" value={form.againstInv} onChange={(e) => setForm({ ...form, againstInv: e.target.value })} placeholder="Invoice No"
                  className={`flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-${accentColor}-500/60 focus:outline-none focus:ring-1 focus:ring-${accentColor}-500/30 transition-all font-mono`} />
                <button className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-${accentColor}-400 hover:border-${accentColor}-500/40 transition-all`}>
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Supplier */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Supplier
              </label>
              <div className="flex gap-2">
                <select value={form.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-36 flex-shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
                  <option value="">ID</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={form.supplierName} readOnly placeholder="Supplier Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10">
            <button type="button" onClick={addLine}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">
              <Plus className="h-4 w-4" /> Add Row
            </button>
            <button type="button" onClick={handleInsert} disabled={loading || saved}
              className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-${accentColor}-600 to-${accentColor === 'rose' ? 'red' : 'emerald'}-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 transition-all shadow-lg shadow-${accentColor}-500/20`}>
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><Save className="h-4 w-4" /> Insert</>}
            </button>
            <button type="button" onClick={() => router.push('/accounts-payable/debit-credit-memo')}
              className="flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all">
              <Search className="h-4 w-4" /> Search
            </button>
            <button type="button" onClick={() => { setLines([emptyLine(), emptyLine()]); setForm({ dnNo: '', dnDate: today, drCrMemo: `${memoType} Memo`, againstInv: '', supplierId: '', supplierName: '' }); setError(null); }}
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800/80 to-slate-700/50">
                  {['#', 'AC ID', 'Combination', 'Description', 'Amount', 'Tax ID', 'Tax Description', 'A/C', 'Tax', ''].map((h, i) => (
                    <th key={i} className={`px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Amount', 'Tax'].includes(h) ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lines.map((line, idx) => (
                  <tr key={line.id} className="group bg-white/2 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 text-slate-500 font-mono text-xs w-8">{idx + 1}</td>
                    <td className="px-2 py-2 w-20">
                      <input type="text" value={line.acId} onChange={(e) => updateLine(line.id, 'acId', e.target.value)} placeholder="AC ID"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-rose-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={line.combination} onChange={(e) => updateLine(line.id, 'combination', e.target.value)} placeholder="Combination..."
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-indigo-300 placeholder-slate-600 focus:border-rose-500/60 focus:outline-none transition-all font-mono" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} placeholder="Description..."
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-rose-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-28">
                      <input type="number" step="0.01" min="0" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', e.target.value)} placeholder="0.00"
                        className={`w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-${accentColor}-400 text-right placeholder-slate-600 focus:outline-none transition-all`} />
                    </td>
                    <td className="px-2 py-2 w-20">
                      <input type="text" value={line.taxId} onChange={(e) => updateLine(line.id, 'taxId', e.target.value)} placeholder="Tax ID"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={line.taxDescription} onChange={(e) => updateLine(line.id, 'taxDescription', e.target.value)} placeholder="Tax desc..."
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-16">
                      <select value={line.acType} onChange={(e) => updateLine(line.id, 'acType', e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-slate-800 px-1.5 py-1.5 text-xs text-violet-400 focus:outline-none transition-all">
                        <option value="">—</option>
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 w-24">
                      <input type="number" step="0.01" min="0" value={line.tax} onChange={(e) => updateLine(line.id, 'tax', e.target.value)} placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:outline-none transition-all" />
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
                  <td colSpan={4} className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Totals</td>
                  <td className={`px-2 py-3 text-right font-mono text-sm font-bold text-${accentColor}-400`}>
                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={3} />
                  <td className="px-2 py-3 text-right font-mono text-sm font-bold text-amber-400">
                    {totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
