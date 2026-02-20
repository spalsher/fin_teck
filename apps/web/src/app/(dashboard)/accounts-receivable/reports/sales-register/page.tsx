'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface SalesRow {
  invoiceNo: string;
  date: string;
  customer: string;
  salesman: string;
  grossAmount: number;
  discount: number;
  tax: number;
  netAmount: number;
  status: 'POSTED' | 'DRAFT' | 'CANCELLED';
}

const CUSTOMERS = [
  { id: 'C001', name: 'Al-Habib Corporation' },
  { id: 'C002', name: 'Sunrise Trading Co.' },
  { id: 'C003', name: 'Metro Enterprises' },
];

const SALESMEN = ['Ahmed Raza', 'Sara Khan', 'Bilal Malik'];

const MOCK: SalesRow[] = [
  { invoiceNo: 'INV-2026-001', date: '2026-02-05', customer: 'Al-Habib Corporation', salesman: 'Ahmed Raza', grossAmount: 95000, discount: 0, tax: 14250, netAmount: 109250, status: 'POSTED' },
  { invoiceNo: 'INV-2026-002', date: '2026-02-10', customer: 'Sunrise Trading Co.', salesman: 'Sara Khan', grossAmount: 185000, discount: 15000, tax: 25500, netAmount: 195500, status: 'POSTED' },
  { invoiceNo: 'INV-2026-003', date: '2026-02-15', customer: 'Metro Enterprises', salesman: 'Ahmed Raza', grossAmount: 55000, discount: 0, tax: 8250, netAmount: 63250, status: 'DRAFT' },
  { invoiceNo: 'INV-2026-004', date: '2026-02-18', customer: 'Al-Habib Corporation', salesman: 'Bilal Malik', grossAmount: 40000, discount: 5000, tax: 5250, netAmount: 40250, status: 'POSTED' },
];

const statusConfig: Record<SalesRow['status'], { bg: string; text: string }> = {
  POSTED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  DRAFT: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  CANCELLED: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

export default function ARSalesRegisterPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [salesman, setSalesman] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<SalesRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    setLoading(true);
    setTimeout(() => {
      let filtered = MOCK;
      if (custId) filtered = filtered.filter(r => CUSTOMERS.find(c => c.id === custId)?.name === r.customer);
      if (salesman) filtered = filtered.filter(r => r.salesman === salesman);
      setResults(filtered);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  const totals = results.reduce((acc, r) => ({
    gross: acc.gross + r.grossAmount,
    discount: acc.discount + r.discount,
    tax: acc.tax + r.tax,
    net: acc.net + r.netAmount,
  }), { gross: 0, discount: 0, tax: 0, net: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/30">
          <ShoppingCart className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sales Register</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › Sales Register</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-violet-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
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
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Salesman</label>
              <select value={salesman} onChange={(e) => setSalesman(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none">
                <option value="">All</option>
                {SALESMEN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Format</label>
            {(['PDF', 'Excel', 'CSV'] as FormatType[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${format === f ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all shadow-lg shadow-violet-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Gross Sales', value: totals.gross, color: 'text-violet-400' },
              { label: 'Discount', value: totals.discount, color: 'text-red-400' },
              { label: 'Tax', value: totals.tax, color: 'text-amber-400' },
              { label: 'Net Sales', value: totals.net, color: 'text-white' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`mt-1 text-lg font-bold font-mono ${stat.color}`}>{stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Sales Register</span>
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300 ring-1 ring-violet-500/30">{results.length} invoices</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Invoice No', 'Date', 'Customer', 'Salesman', 'Gross', 'Discount', 'Tax', 'Net', 'Status'].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Gross', 'Discount', 'Tax', 'Net'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((row, idx) => {
                    const sc = statusConfig[row.status];
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-violet-300">{row.invoiceNo}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                        <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{row.salesman}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{row.discount > 0 ? `(${row.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })})` : '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">{row.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{row.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                    <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-300">{totals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-red-400">{totals.discount > 0 ? `(${totals.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })})` : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">{totals.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td />
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
