'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, AlertTriangle } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface AgeingRow {
  customerId: string;
  customerName: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90Plus: number;
  total: number;
}

const CUSTOMERS = [
  { id: 'C001', name: 'Al-Habib Corporation' },
  { id: 'C002', name: 'Sunrise Trading Co.' },
  { id: 'C003', name: 'Metro Enterprises' },
];

const MOCK: AgeingRow[] = [
  { customerId: 'C001', customerName: 'Al-Habib Corporation', current: 109250, days30: 45000, days60: 0, days90: 0, days90Plus: 0, total: 154250 },
  { customerId: 'C002', customerName: 'Sunrise Trading Co.', current: 0, days30: 95000, days60: 50000, days90: 20000, days90Plus: 35000, total: 200000 },
  { customerId: 'C003', customerName: 'Metro Enterprises', current: 63250, days30: 0, days60: 15000, days90: 0, days90Plus: 0, total: 78250 },
];

export default function ARAgeingReportPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [asOfDate, setAsOfDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<AgeingRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    setLoading(true);
    setTimeout(() => {
      const filtered = custId ? MOCK.filter(r => r.customerId === custId) : MOCK;
      setResults(filtered);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  const totals = results.reduce((acc, r) => ({
    current: acc.current + r.current,
    days30: acc.days30 + r.days30,
    days60: acc.days60 + r.days60,
    days90: acc.days90 + r.days90,
    days90Plus: acc.days90Plus + r.days90Plus,
    total: acc.total + r.total,
  }), { current: 0, days30: 0, days60: 0, days90: 0, days90Plus: 0, total: 0 });

  const fmt = (n: number) => n > 0 ? n.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
          <Clock className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Ageing Report</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › Ageing Report</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-orange-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> As of Date</label>
              <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-orange-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none">
                <option value="PDF">PDF</option><option value="Excel">Excel</option><option value="CSV">CSV</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/8">
            <button onClick={() => { setSearched(false); setResults([]); }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">Exit</button>
            <button onClick={handleSearch} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:from-orange-500 hover:to-amber-500 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Current', value: totals.current, color: 'text-emerald-400', dot: 'bg-emerald-400' },
              { label: '1-30 Days', value: totals.days30, color: 'text-yellow-400', dot: 'bg-yellow-400' },
              { label: '31-60 Days', value: totals.days60, color: 'text-orange-400', dot: 'bg-orange-400' },
              { label: '61-90 Days', value: totals.days90, color: 'text-red-400', dot: 'bg-red-400' },
              { label: '90+ Days', value: totals.days90Plus, color: 'text-rose-400', dot: 'bg-rose-400' },
              { label: 'Total', value: totals.total, color: 'text-white', dot: 'bg-white' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 mb-1"><div className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} /><p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p></div>
                <p className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Ageing Summary by Customer</span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400"><AlertTriangle className="h-3.5 w-3.5" /> As of {asOfDate}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider text-right">Current</th>
                    <th className="px-4 py-3 text-xs font-semibold text-yellow-400 uppercase tracking-wider text-right">1-30 Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-orange-400 uppercase tracking-wider text-right">31-60 Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-red-400 uppercase tracking-wider text-right">61-90 Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-rose-400 uppercase tracking-wider text-right">90+ Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-white">{row.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{row.customerId}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{fmt(row.current)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-yellow-400">{fmt(row.days30)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-orange-400">{fmt(row.days60)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{fmt(row.days90)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-rose-400">{fmt(row.days90Plus)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                    <td className="px-4 py-3 text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">{fmt(totals.current)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-yellow-400">{fmt(totals.days30)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-orange-400">{fmt(totals.days60)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-red-400">{fmt(totals.days90)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-rose-400">{fmt(totals.days90Plus)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
