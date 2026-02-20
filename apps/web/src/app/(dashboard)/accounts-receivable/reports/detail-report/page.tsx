'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface DetailRow {
  invoiceNo: string;
  date: string;
  customer: string;
  itemDesc: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

const CUSTOMERS = [
  { id: 'C001', name: 'Al-Habib Corporation' },
  { id: 'C002', name: 'Sunrise Trading Co.' },
  { id: 'C003', name: 'Metro Enterprises' },
];

const MOCK: DetailRow[] = [
  { invoiceNo: 'INV-2026-001', date: '2026-02-05', customer: 'Al-Habib Corporation', itemDesc: 'IT Consulting (per day)', qty: 5, unitPrice: 15000, discount: 0, tax: 11250, total: 86250 },
  { invoiceNo: 'INV-2026-001', date: '2026-02-05', customer: 'Al-Habib Corporation', itemDesc: 'Software License', qty: 1, unitPrice: 20000, discount: 2000, tax: 2700, total: 20700 },
  { invoiceNo: 'INV-2026-002', date: '2026-02-10', customer: 'Sunrise Trading Co.', itemDesc: 'Hardware Supply', qty: 10, unitPrice: 18000, discount: 5000, tax: 25500, total: 195500 },
  { invoiceNo: 'INV-2026-003', date: '2026-02-17', customer: 'Metro Enterprises', itemDesc: 'Annual Support Contract', qty: 1, unitPrice: 55000, discount: 0, tax: 8250, total: 63250 },
];

export default function ARDetailReportPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<DetailRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    setLoading(true);
    setTimeout(() => {
      const filtered = custId ? MOCK.filter(r => CUSTOMERS.find(c => c.id === custId)?.name === r.customer) : MOCK;
      setResults(filtered);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  const grandTotal = results.reduce((s, r) => s + r.total, 0);
  const grandTax = results.reduce((s, r) => s + r.tax, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Detail Report</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › Detail Report</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-indigo-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Format</label>
            {(['PDF', 'Excel', 'CSV'] as FormatType[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${format === f ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Invoice Detail</span>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">{results.length} line items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Invoice No', 'Date', 'Customer', 'Item / Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Qty', 'Unit Price', 'Discount', 'Tax', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300">{row.invoiceNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.itemDesc}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.qty}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{row.discount > 0 ? `(${row.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })})` : '-'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">{row.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={7} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">{grandTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
