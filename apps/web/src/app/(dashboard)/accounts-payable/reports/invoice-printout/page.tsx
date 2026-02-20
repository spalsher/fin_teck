'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, Hash, CheckCircle2, Scale } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface InvPrintRow { invoiceNo: string; date: string; supplier: string; description: string; amount: number; tax: number; net: number; status: 'POSTED' | 'DRAFT'; }

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
];

const MOCK: InvPrintRow[] = [
  { invoiceNo: 'PI-2026-001', date: '2026-02-05', supplier: 'Khatri Computer', description: 'IT Equipment Purchase', amount: 75000, tax: 10000, net: 85000, status: 'POSTED' },
  { invoiceNo: 'PI-2026-002', date: '2026-02-10', supplier: 'Pakistan Telecommunication Authority', description: 'Telecom Services', amount: 130000, tax: 20000, net: 150000, status: 'POSTED' },
  { invoiceNo: 'PI-2026-003', date: '2026-02-15', supplier: 'ARI INFORMATICS', description: 'Software License', amount: 180000, tax: 20000, net: 200000, status: 'DRAFT' },
];

export default function InvoicePrintoutPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromInvoice, setFromInvoice] = useState('');
  const [toInvoice, setToInvoice] = useState('');
  const [suppId, setSuppId] = useState('');
  const [suppName, setSuppName] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<InvPrintRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => { setResults(MOCK); setSearched(true); setLoading(false); }, 700);
  }

  const totalNet = results.reduce((s, r) => s + r.net, 0);
  const totalTax = results.reduce((s, r) => s + r.tax, 0);

  const statusConfig = {
    POSTED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    DRAFT: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 ring-1 ring-rose-500/30">
          <FileText className="h-5 w-5 text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Invoice Printout</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Reports › Invoice Printout</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-600/30 via-pink-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-rose-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> From Invoice</label>
              <input type="text" value={fromInvoice} onChange={(e) => setFromInvoice(e.target.value)} placeholder="PI-2026-0001"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-rose-500/60 focus:outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> To Invoice</label>
              <input type="text" value={toInvoice} onChange={(e) => setToInvoice(e.target.value)} placeholder="PI-2026-9999"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-rose-500/60 focus:outline-none transition-all font-mono" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Search className="h-3 w-3" /> Supplier</label>
              <div className="flex gap-2">
                <select value={suppId} onChange={(e) => { setSuppId(e.target.value); setSuppName(SUPPLIERS.find(s => s.id === e.target.value)?.name || ''); }}
                  className="w-28 rounded-lg border border-white/10 bg-slate-800 px-2 py-2.5 text-sm text-white focus:outline-none transition-all">
                  <option value="">All</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={suppName} readOnly placeholder="All Suppliers"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-rose-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-rose-500/60 focus:outline-none transition-all [color-scheme:dark]" />
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-medium text-white hover:from-rose-500 hover:to-pink-500 disabled:opacity-60 transition-all shadow-lg shadow-rose-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Invoice List</span>
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-300 ring-1 ring-rose-500/30">{results.length} invoices</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Invoice No', 'Date', 'Supplier', 'Description', 'Amount', 'Tax', 'Net', 'Status'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Amount', 'Tax', 'Net'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => {
                  const sc = statusConfig[row.status];
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{row.invoiceNo}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{row.supplier}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{row.description}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">{row.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-300">{results.reduce((s, r) => s + r.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
