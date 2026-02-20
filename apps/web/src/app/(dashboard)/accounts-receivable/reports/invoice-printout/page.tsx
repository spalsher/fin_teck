'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, Hash, CheckCircle2 } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface InvRow { invoiceNo: string; date: string; customer: string; description: string; amount: number; tax: number; net: number; status: 'POSTED' | 'DRAFT'; }

const CUSTOMERS = [
  { id: 'C001', name: 'Al-Habib Corporation' },
  { id: 'C002', name: 'Sunrise Trading Co.' },
  { id: 'C003', name: 'Metro Enterprises' },
];

const MOCK: InvRow[] = [
  { invoiceNo: 'INV-2026-001', date: '2026-02-05', customer: 'Al-Habib Corporation', description: 'Consulting Services', amount: 95000, tax: 14250, net: 109250, status: 'POSTED' },
  { invoiceNo: 'INV-2026-002', date: '2026-02-10', customer: 'Sunrise Trading Co.', description: 'Software Delivery', amount: 200000, tax: 30000, net: 230000, status: 'POSTED' },
  { invoiceNo: 'INV-2026-003', date: '2026-02-17', customer: 'Metro Enterprises', description: 'Annual Maintenance', amount: 55000, tax: 8250, net: 63250, status: 'DRAFT' },
];

export default function ARInvoicePrintoutPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromInvoice, setFromInvoice] = useState('');
  const [toInvoice, setToInvoice] = useState('');
  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<InvRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => { setResults(MOCK); setSearched(true); setLoading(false); }, 700);
  }

  const totalAmount = results.reduce((s, r) => s + r.amount, 0);
  const totalTax = results.reduce((s, r) => s + r.tax, 0);
  const totalNet = results.reduce((s, r) => s + r.net, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-500/30">
          <FileText className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Invoice Print-Out</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › Invoice Print-Out</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600/30 via-cyan-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-teal-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> From Invoice</label>
              <input type="text" value={fromInvoice} onChange={(e) => setFromInvoice(e.target.value)} placeholder="INV-2026-0001"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/60 focus:outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> To Invoice</label>
              <input type="text" value={toInvoice} onChange={(e) => setToInvoice(e.target.value)} placeholder="INV-2026-9999"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/60 focus:outline-none transition-all font-mono" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Search className="h-3 w-3" /> Customer</label>
              <div className="flex gap-2">
                <select value={custId} onChange={(e) => { setCustId(e.target.value); setCustName(CUSTOMERS.find(c => c.id === e.target.value)?.name || ''); }}
                  className="w-28 rounded-lg border border-white/10 bg-slate-800 px-2 py-2.5 text-sm text-white focus:outline-none transition-all">
                  <option value="">All</option>
                  {CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
                <input type="text" value={custName} readOnly placeholder="All Customers"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><FileText className="h-3 w-3" /> Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
                <option value="PDF">PDF</option><option value="Excel">Excel</option><option value="CSV">CSV</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-teal-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-teal-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/8">
            <button onClick={() => { setSearched(false); setResults([]); }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">Exit</button>
            <button onClick={handlePrint} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 transition-all shadow-lg shadow-teal-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Invoice List</span>
            <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-300 ring-1 ring-teal-500/30">{results.length} invoices</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Invoice No', 'Date', 'Customer', 'Description', 'Amount', 'Tax', 'Net', 'Status'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Amount', 'Tax', 'Net'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-teal-300">{row.invoiceNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{row.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">{row.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'POSTED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-300">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />{results.filter(r => r.status === 'POSTED').length} posted</span>
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
