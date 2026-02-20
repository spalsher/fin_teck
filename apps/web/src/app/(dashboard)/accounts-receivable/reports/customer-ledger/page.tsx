'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface LedgerRow {
  date: string;
  refNo: string;
  type: 'Invoice' | 'Receipt' | 'Credit Note' | 'Debit Note';
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

const CUSTOMERS = [
  { id: 'C001', name: 'Al-Habib Corporation' },
  { id: 'C002', name: 'Sunrise Trading Co.' },
  { id: 'C003', name: 'Metro Enterprises' },
];

const MOCK: LedgerRow[] = [
  { date: '2026-02-01', refNo: '', type: 'Invoice', description: 'Opening Balance', debit: 0, credit: 0, balance: 45000 },
  { date: '2026-02-05', refNo: 'INV-2026-001', type: 'Invoice', description: 'Consulting Services', debit: 109250, credit: 0, balance: 154250 },
  { date: '2026-02-08', refNo: 'RCP-2026-001', type: 'Receipt', description: 'Payment Received', debit: 0, credit: 50000, balance: 104250 },
  { date: '2026-02-12', refNo: 'CN-2026-001', type: 'Credit Note', description: 'Discount Allowed', debit: 0, credit: 5000, balance: 99250 },
  { date: '2026-02-17', refNo: 'INV-2026-003', type: 'Invoice', description: 'Annual Maintenance', debit: 63250, credit: 0, balance: 162500 },
];

const typeConfig: Record<LedgerRow['type'], { bg: string; text: string }> = {
  Invoice: { bg: 'bg-teal-500/15', text: 'text-teal-400' },
  Receipt: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  'Credit Note': { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  'Debit Note': { bg: 'bg-amber-500/15', text: 'text-amber-400' },
};

export default function ARCustomerLedgerPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<LedgerRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSearch() {
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 ring-1 ring-cyan-500/30">
          <BookOpen className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Customer Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › Customer Ledger</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-cyan-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Search className="h-3 w-3" /> Customer</label>
              <div className="flex gap-2">
                <select value={custId} onChange={(e) => { setCustId(e.target.value); setCustName(CUSTOMERS.find(c => c.id === e.target.value)?.name || ''); }}
                  className="w-28 rounded-lg border border-white/10 bg-slate-800 px-2 py-2.5 text-sm text-white focus:outline-none">
                  <option value="">All</option>
                  {CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
                <input type="text" value={custName} readOnly placeholder="All Customers"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-cyan-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-cyan-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Format</label>
            {(['PDF', 'Excel', 'CSV'] as FormatType[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${format === f ? 'bg-cyan-600/30 border-cyan-500/50 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/8">
            <button onClick={() => { setSearched(false); setResults([]); }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">Exit</button>
            <button onClick={handleSearch} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:from-cyan-500 hover:to-teal-500 disabled:opacity-60 transition-all shadow-lg shadow-cyan-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Debit', value: totalDebit, color: 'text-teal-400' },
              { label: 'Total Credit', value: totalCredit, color: 'text-emerald-400' },
              { label: 'Closing Balance', value: closingBalance, color: 'text-white' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`mt-1 text-xl font-bold font-mono ${stat.color}`}>{stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3">
              <span className="text-sm font-semibold text-white">Ledger Entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Date', 'Ref No', 'Type', 'Description', 'Debit', 'Credit', 'Balance'].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Debit', 'Credit', 'Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((row, idx) => {
                    const tc = typeConfig[row.type];
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                        <td className="px-4 py-3 font-mono text-xs text-cyan-300">{row.refNo || '—'}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tc.bg} ${tc.text}`}>{row.type}</span></td>
                        <td className="px-4 py-3 text-xs text-slate-300">{row.description}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-teal-400">{row.debit > 0 ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{row.credit > 0 ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                    <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Totals</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-teal-400">{totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">{totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
