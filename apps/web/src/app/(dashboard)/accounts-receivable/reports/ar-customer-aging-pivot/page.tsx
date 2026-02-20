'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table2, Calendar, Printer, FileDown, X, ArrowLeft, Filter } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';

interface PivotRow {
  customerId: string;
  customerName: string;
  invoices: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90Plus: number;
  totalDue: number;
  creditLimit: number;
  availableCredit: number;
}

const MOCK: PivotRow[] = [
  { customerId: 'C001', customerName: 'Al-Habib Corporation', invoices: 3, current: 109250, days30: 45000, days60: 0, days90: 0, days90Plus: 0, totalDue: 154250, creditLimit: 500000, availableCredit: 345750 },
  { customerId: 'C002', customerName: 'Sunrise Trading Co.', invoices: 2, current: 0, days30: 95000, days60: 50000, days90: 20000, days90Plus: 35000, totalDue: 200000, creditLimit: 300000, availableCredit: 100000 },
  { customerId: 'C003', customerName: 'Metro Enterprises', invoices: 1, current: 63250, days30: 0, days60: 15000, days90: 0, days90Plus: 0, totalDue: 78250, creditLimit: 200000, availableCredit: 121750 },
  { customerId: 'C004', customerName: 'Global Tech Solutions', invoices: 4, current: 22000, days30: 38000, days60: 12000, days90: 8000, days90Plus: 5000, totalDue: 85000, creditLimit: 150000, availableCredit: 65000 },
];

export default function ARCustomerAgingPivotPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [asOfDate, setAsOfDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('Excel');
  const [results, setResults] = useState<PivotRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightOverdue, setHighlightOverdue] = useState(true);

  function handleGenerate() {
    setLoading(true);
    setTimeout(() => { setResults(MOCK); setSearched(true); setLoading(false); }, 800);
  }

  const totals = results.reduce((acc, r) => ({
    invoices: acc.invoices + r.invoices,
    current: acc.current + r.current,
    days30: acc.days30 + r.days30,
    days60: acc.days60 + r.days60,
    days90: acc.days90 + r.days90,
    days90Plus: acc.days90Plus + r.days90Plus,
    totalDue: acc.totalDue + r.totalDue,
    creditLimit: acc.creditLimit + r.creditLimit,
    availableCredit: acc.availableCredit + r.availableCredit,
  }), { invoices: 0, current: 0, days30: 0, days60: 0, days90: 0, days90Plus: 0, totalDue: 0, creditLimit: 0, availableCredit: 0 });

  const fmt = (n: number) => n > 0 ? n.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—';
  const isHighRisk = (row: PivotRow) => (row.days60 + row.days90 + row.days90Plus) > (row.totalDue * 0.3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 ring-1 ring-fuchsia-500/30">
          <Table2 className="h-5 w-5 text-fuchsia-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AR Customer Aging Pivot Table</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › AR Customer Aging Pivot Table</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-fuchsia-600/30 via-pink-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-fuchsia-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> As of Date</label>
              <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Export Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none">
                <option value="Excel">Excel (Pivot)</option><option value="PDF">PDF</option><option value="CSV">CSV</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setHighlightOverdue(!highlightOverdue)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${highlightOverdue ? 'bg-fuchsia-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${highlightOverdue ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs text-slate-300">Highlight Overdue</span>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/8">
            <button onClick={() => { setSearched(false); setResults([]); }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">Exit</button>
            <button onClick={handleGenerate} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-2.5 text-sm font-medium text-white hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-60 transition-all shadow-lg shadow-fuchsia-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Generate</> : <><FileDown className="h-4 w-4" /> Export Pivot</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Outstanding', value: totals.totalDue, color: 'text-fuchsia-400' },
              { label: 'Overdue (60+ days)', value: totals.days60 + totals.days90 + totals.days90Plus, color: 'text-red-400' },
              { label: 'Total Credit Limit', value: totals.creditLimit, color: 'text-blue-400' },
              { label: 'Available Credit', value: totals.availableCredit, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`mt-1 text-lg font-bold font-mono ${stat.color}`}>{stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Customer Aging Pivot — As of {asOfDate}</span>
              <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-medium text-fuchsia-300 ring-1 ring-fuchsia-500/30">{results.length} customers</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left sticky left-0 bg-slate-900/80">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Inv.</th>
                    <th className="px-4 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider text-right">Current</th>
                    <th className="px-4 py-3 text-xs font-semibold text-yellow-400 uppercase tracking-wider text-right">1-30 Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-orange-400 uppercase tracking-wider text-right">31-60 Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-red-400 uppercase tracking-wider text-right">61-90 Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-rose-400 uppercase tracking-wider text-right">90+ Days</th>
                    <th className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider text-right">Total Due</th>
                    <th className="px-4 py-3 text-xs font-semibold text-blue-400 uppercase tracking-wider text-right">Credit Limit</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-400 uppercase tracking-wider text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((row, idx) => {
                    const highRisk = highlightOverdue && isHighRisk(row);
                    return (
                      <tr key={idx} className={`transition-colors ${highRisk ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-white/5'}`}>
                        <td className={`px-4 py-3 sticky left-0 ${highRisk ? 'bg-red-950/20' : 'bg-slate-900/80'}`}>
                          <div className="flex items-center gap-2">
                            {highRisk && <div className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                            <div>
                              <div className="text-xs font-medium text-white">{row.customerName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{row.customerId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">{row.invoices}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{fmt(row.current)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-yellow-400">{fmt(row.days30)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-orange-400">{fmt(row.days60)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{fmt(row.days90)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-rose-400">{fmt(row.days90Plus)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-blue-400">{row.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className={`px-4 py-3 text-right font-mono text-xs font-semibold ${row.availableCredit < 50000 ? 'text-red-400' : 'text-teal-400'}`}>
                          {row.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t-2 border-fuchsia-500/30">
                    <td className="px-4 py-3 text-xs font-bold text-slate-300 uppercase sticky left-0 bg-slate-800">Grand Total</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-300">{totals.invoices}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">{fmt(totals.current)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-yellow-400">{fmt(totals.days30)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-orange-400">{fmt(totals.days60)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-red-400">{fmt(totals.days90)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-rose-400">{fmt(totals.days90Plus)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{totals.totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-blue-400">{totals.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-teal-400">{totals.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
