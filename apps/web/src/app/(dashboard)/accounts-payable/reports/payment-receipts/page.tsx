'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, Hash, FileText, DollarSign, CheckCircle2, TrendingUp, Users } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
type ReportType = 'With Invoice' | 'Without Invoice';
interface ReceiptRow { paymentNo: string; date: string; supplier: string; invoiceNo: string; amount: number; chequeNo: string; bank: string; status: 'POSTED' | 'DRAFT'; }

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
];

const MOCK_WITH: ReceiptRow[] = [
  { paymentNo: 'PV-2026-001', date: '2026-02-10', supplier: 'Khatri Computer', invoiceNo: 'PI-2026-001', amount: 85000, chequeNo: 'CHQ-001234', bank: 'HBL - Main Account', status: 'POSTED' },
  { paymentNo: 'PV-2026-002', date: '2026-02-15', supplier: 'Pakistan Telecommunication Authority', invoiceNo: 'PI-2026-002', amount: 50000, chequeNo: 'CHQ-001235', bank: 'UBL - Operations', status: 'POSTED' },
  { paymentNo: 'PV-2026-003', date: '2026-02-18', supplier: 'ARI INFORMATICS', invoiceNo: 'PI-2026-003', amount: 100000, chequeNo: 'CHQ-001236', bank: 'HBL - Main Account', status: 'DRAFT' },
];

const MOCK_WITHOUT: ReceiptRow[] = [
  { paymentNo: 'PV-2026-010', date: '2026-02-12', supplier: 'Khatri Computer', invoiceNo: '—', amount: 25000, chequeNo: 'CHQ-001240', bank: 'MCB - Current', status: 'POSTED' },
  { paymentNo: 'PV-2026-011', date: '2026-02-16', supplier: 'ARI INFORMATICS', invoiceNo: '—', amount: 40000, chequeNo: 'CHQ-001241', bank: 'HBL - Main Account', status: 'POSTED' },
];

export default function APPaymentReceiptsPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [reportType, setReportType] = useState<ReportType>('With Invoice');
  const [fromSuppId, setFromSuppId] = useState('');
  const [fromSuppName, setFromSuppName] = useState('');
  const [toSuppId, setToSuppId] = useState('');
  const [toSuppName, setToSuppName] = useState('');
  const [fromInvoice, setFromInvoice] = useState('');
  const [toInvoice, setToInvoice] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<ReceiptRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => {
      setResults(reportType === 'With Invoice' ? MOCK_WITH : MOCK_WITHOUT);
      setSearched(true); setLoading(false);
    }, 700);
  }

  const totalAmount = results.reduce((s, r) => s + r.amount, 0);
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-500/30">
          <Receipt className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Payment Receipts</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Reports › AP Payment Receipt With/Without Invoice</p>
        </div>
      </div>

      {searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Payments', value: results.length, icon: Receipt, color: 'teal' },
            { label: 'Total Amount', value: `PKR ${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
            { label: 'Posted', value: results.filter(r => r.status === 'POSTED').length, icon: CheckCircle2, color: 'sky' },
            { label: 'Suppliers', value: [...new Set(results.map(r => r.supplier))].length, icon: Users, color: 'violet' },
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
        <div className="bg-gradient-to-r from-teal-600/30 via-cyan-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-teal-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6 space-y-5">
          {/* Report Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Report Type</label>
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit">
              {(['With Invoice', 'Without Invoice'] as ReportType[]).map((t) => (
                <button key={t} type="button" onClick={() => setReportType(t)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${reportType === t ? 'bg-teal-600/40 text-teal-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">From Supplier</p>
              <div className="flex gap-2">
                <select value={fromSuppId} onChange={(e) => { setFromSuppId(e.target.value); setFromSuppName(SUPPLIERS.find(s => s.id === e.target.value)?.name || ''); }}
                  className="w-24 rounded-lg border border-white/10 bg-slate-800 px-2 py-2 text-xs text-white focus:outline-none transition-all">
                  <option value="">All</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={fromSuppName} readOnly placeholder="All Suppliers"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-teal-400 transition-all">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">To Supplier</p>
              <div className="flex gap-2">
                <select value={toSuppId} onChange={(e) => { setToSuppId(e.target.value); setToSuppName(SUPPLIERS.find(s => s.id === e.target.value)?.name || ''); }}
                  className="w-24 rounded-lg border border-white/10 bg-slate-800 px-2 py-2 text-xs text-white focus:outline-none transition-all">
                  <option value="">All</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={toSuppName} readOnly placeholder="All Suppliers"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-teal-400 transition-all">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Range + Dates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end pt-2 border-t border-white/8">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> From Invoice</label>
              <input type="text" value={fromInvoice} onChange={(e) => setFromInvoice(e.target.value)} placeholder="PI-2026-0001"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/60 focus:outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> To Invoice</label>
              <input type="text" value={toInvoice} onChange={(e) => setToInvoice(e.target.value)} placeholder="PI-2026-9999"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/60 focus:outline-none transition-all font-mono" />
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

          <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-white/8">
            <div className="space-y-1.5 min-w-32">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><FileText className="h-3 w-3" /> Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
                <option value="PDF">PDF</option><option value="Excel">Excel</option><option value="CSV">CSV</option>
              </select>
            </div>
            <div className="flex gap-2 pb-0.5">
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
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Payment Receipts — {reportType}</span>
            <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-300 ring-1 ring-teal-500/30">{results.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Payment No', 'Date', 'Supplier', reportType === 'With Invoice' ? 'Invoice No' : 'Ref', 'Amount', 'Cheque No', 'Bank', 'Status'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => {
                  const sc = statusConfig[row.status];
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-teal-300">{row.paymentNo}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{row.supplier}</td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{row.invoiceNo}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-400">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.chequeNo}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{row.bank}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Total Paid</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td colSpan={3} className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-1 text-xs text-emerald-400"><TrendingUp className="h-3.5 w-3.5" />{results.filter(r => r.status === 'POSTED').length} posted</span>
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
