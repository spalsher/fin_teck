'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, FileText, Clock, DollarSign, TrendingDown, Users } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
interface DueRow { supplierId: string; supplierName: string; invoiceNo: string; invoiceDate: string; dueDate: string; amount: number; paid: number; outstanding: number; agingDays: number; }

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
  { id: 'S004', name: 'Concrete Plus' },
];

const MOCK: DueRow[] = [
  { supplierId: 'S001', supplierName: 'Khatri Computer', invoiceNo: 'PI-2026-001', invoiceDate: '2026-01-15', dueDate: '2026-02-14', amount: 85000, paid: 0, outstanding: 85000, agingDays: 36 },
  { supplierId: 'S002', supplierName: 'Pakistan Telecommunication Authority', invoiceNo: 'PI-2026-002', invoiceDate: '2026-01-20', dueDate: '2026-02-19', amount: 150000, paid: 50000, outstanding: 100000, agingDays: 31 },
  { supplierId: 'S003', supplierName: 'ARI INFORMATICS', invoiceNo: 'PI-2026-003', invoiceDate: '2026-02-01', dueDate: '2026-03-03', amount: 200000, paid: 0, outstanding: 200000, agingDays: 11 },
  { supplierId: 'S004', supplierName: 'Concrete Plus', invoiceNo: 'PI-2026-004', invoiceDate: '2026-02-05', dueDate: '2026-03-07', amount: 45000, paid: 45000, outstanding: 0, agingDays: 7 },
];

export default function DuesReportPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [suppId, setSuppId] = useState('');
  const [suppName, setSuppName] = useState('');
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<DueRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => { setResults(MOCK); setSearched(true); setLoading(false); }, 700);
  }

  const totalOutstanding = results.reduce((s, r) => s + r.outstanding, 0);
  const totalAmount = results.reduce((s, r) => s + r.amount, 0);
  const overdue = results.filter((r) => r.agingDays > 30);

  function getAgingColor(days: number) {
    if (days > 60) return { bg: 'bg-red-500/15', text: 'text-red-400' };
    if (days > 30) return { bg: 'bg-amber-500/15', text: 'text-amber-400' };
    return { bg: 'bg-emerald-500/15', text: 'text-emerald-400' };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 ring-1 ring-amber-500/30">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dues Report</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Reports › Dues Report</p>
        </div>
      </div>

      {searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Invoices', value: results.length, icon: FileText, color: 'sky' },
            { label: 'Total Amount', value: `PKR ${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'indigo' },
            { label: 'Outstanding', value: `PKR ${totalOutstanding.toLocaleString()}`, icon: TrendingDown, color: 'amber' },
            { label: 'Overdue (30+ days)', value: overdue.length, icon: Clock, color: 'red' },
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
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-amber-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Supplier */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Users className="h-3 w-3" /> Supplier</label>
              <div className="flex gap-2">
                <select value={suppId} onChange={(e) => { setSuppId(e.target.value); setSuppName(SUPPLIERS.find(s => s.id === e.target.value)?.name || ''); }}
                  className="w-28 rounded-lg border border-white/10 bg-slate-800 px-2 py-2.5 text-sm text-white focus:outline-none transition-all">
                  <option value="">All</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={suppName} readOnly placeholder="Supplier Name (All)"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-amber-400 hover:border-amber-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-amber-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><FileText className="h-3 w-3" /> Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
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
            <button onClick={handlePrint} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 transition-all shadow-lg shadow-amber-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Dues Detail</span>
            <div className="flex items-center gap-2">
              {overdue.length > 0 && <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 ring-1 ring-red-500/30">{overdue.length} overdue</span>}
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30">{results.length} records</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Supplier', 'Invoice No', 'Invoice Date', 'Due Date', 'Amount', 'Paid', 'Outstanding', 'Aging'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Amount', 'Paid', 'Outstanding'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => {
                  const aging = getAgingColor(row.agingDays);
                  return (
                    <tr key={idx} className={`hover:bg-white/5 transition-colors ${row.agingDays > 30 ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-white">{row.supplierName}</div>
                        <div className="text-xs text-slate-500 font-mono">{row.supplierId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{row.invoiceNo}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.invoiceDate}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.dueDate}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{row.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-amber-400 font-semibold">{row.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${aging.bg} ${aging.text}`}>{row.agingDays} days</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-300">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">{results.reduce((s, r) => s + r.paid, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">{totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
