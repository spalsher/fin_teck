'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, FileText, TrendingUp, TrendingDown, Scale, DollarSign } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';

interface LedgerRow { date: string; voucherNo: string; description: string; debit: number; credit: number; balance: number; }

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
  { id: 'S004', name: 'Concrete Plus' },
];

const MOCK: LedgerRow[] = [
  { date: '2026-02-01', voucherNo: 'OB-2026', description: 'Opening Balance', debit: 0, credit: 250000, balance: -250000 },
  { date: '2026-02-05', voucherNo: 'PI-2026-001', description: 'Purchase Invoice - Office Supplies', debit: 0, credit: 85000, balance: -335000 },
  { date: '2026-02-10', voucherNo: 'PV-2026-001', description: 'Payment against PI-2026-001', debit: 85000, credit: 0, balance: -250000 },
  { date: '2026-02-15', voucherNo: 'PI-2026-002', description: 'Purchase Invoice - IT Equipment', debit: 0, credit: 150000, balance: -400000 },
  { date: '2026-02-18', voucherNo: 'DN-2026-001', description: 'Debit Note - Returned goods', debit: 25000, credit: 0, balance: -375000 },
  { date: '2026-02-20', voucherNo: 'PV-2026-002', description: 'Partial payment PI-2026-002', debit: 100000, credit: 0, balance: -275000 },
];

export default function APLedgerPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromSuppId, setFromSuppId] = useState('');
  const [fromSuppName, setFromSuppName] = useState('');
  const [toSuppId, setToSuppId] = useState('');
  const [toSuppName, setToSuppName] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<LedgerRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => { setResults(MOCK); setSearched(true); setLoading(false); }, 700);
  }

  const totalDebit = results.reduce((s, r) => s + r.debit, 0);
  const totalCredit = results.reduce((s, r) => s + r.credit, 0);
  const closingBalance = results.length > 0 ? results[results.length - 1].balance : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
          <BookOpen className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Supplier Accounts Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Reports › Ledger Report</p>
        </div>
      </div>

      {searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Debit', value: `PKR ${totalDebit.toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
            { label: 'Total Credit', value: `PKR ${totalCredit.toLocaleString()}`, icon: TrendingDown, color: 'rose' },
            { label: 'Closing Balance', value: `PKR ${Math.abs(closingBalance).toLocaleString()}`, icon: Scale, color: 'indigo' },
            { label: 'Transactions', value: results.length, icon: DollarSign, color: 'violet' },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                  <p className={`text-lg font-bold text-${c.color}-400`}>{c.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${c.color}-500/20`}>
                  <c.icon className={`h-4 w-4 text-${c.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600/30 via-blue-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-indigo-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6 space-y-5">
          {/* Supplier Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">From Supplier</p>
              <div className="flex gap-2">
                <select value={fromSuppId} onChange={(e) => { setFromSuppId(e.target.value); setFromSuppName(SUPPLIERS.find(s => s.id === e.target.value)?.name || ''); }}
                  className="w-28 rounded-lg border border-white/10 bg-slate-800 px-2 py-2 text-xs text-white focus:outline-none transition-all">
                  <option value="">ID</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={fromSuppName} readOnly placeholder="Supplier Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-indigo-400 transition-all">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">To Supplier</p>
              <div className="flex gap-2">
                <select value={toSuppId} onChange={(e) => { setToSuppId(e.target.value); setToSuppName(SUPPLIERS.find(s => s.id === e.target.value)?.name || ''); }}
                  className="w-28 rounded-lg border border-white/10 bg-slate-800 px-2 py-2 text-xs text-white focus:outline-none transition-all">
                  <option value="">ID</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={toSuppName} readOnly placeholder="Supplier Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-indigo-400 transition-all">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Date + Actions */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end pt-2 border-t border-white/8">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><FileText className="h-3 w-3" /> Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
                <option value="PDF">PDF</option><option value="Excel">Excel</option><option value="CSV">CSV</option>
              </select>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button onClick={() => { setSearched(false); setResults([]); }}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="h-4 w-4" /> Cancel
              </button>
              <button onClick={() => router.back()}
                className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">Exit</button>
              <button onClick={handlePrint} disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25">
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Ledger Detail</span>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">{results.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Date', 'Voucher No', 'Description', 'Debit', 'Credit', 'Balance'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Debit', 'Credit', 'Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300">{row.voucherNo}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{row.debit > 0 ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-rose-400">{row.credit > 0 ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs font-semibold ${row.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.abs(row.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} {row.balance < 0 ? 'Cr' : 'Dr'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-300 uppercase">Closing Balance</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">{totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-rose-400">{totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className={`px-4 py-3 text-right font-mono text-sm font-bold ${closingBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {Math.abs(closingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} {closingBalance < 0 ? 'Cr' : 'Dr'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
