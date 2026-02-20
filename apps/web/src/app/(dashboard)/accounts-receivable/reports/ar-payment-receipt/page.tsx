'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar, Printer, FileDown, X, ArrowLeft, Filter, Search, Hash } from 'lucide-react';

type FormatType = 'PDF' | 'Excel' | 'CSV';
type InvoiceMode = 'with' | 'without' | 'all';

interface PaymentReceiptRow {
  receiptNo: string;
  date: string;
  customer: string;
  invoiceRef: string | null;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
  bank: string;
  chequeNo: string;
  amount: number;
  status: 'CLEARED' | 'PENDING' | 'BOUNCED';
}

const CUSTOMERS = [
  { id: 'C001', name: 'Al-Habib Corporation' },
  { id: 'C002', name: 'Sunrise Trading Co.' },
  { id: 'C003', name: 'Metro Enterprises' },
];

const MOCK: PaymentReceiptRow[] = [
  { receiptNo: 'RCP-2026-001', date: '2026-02-08', customer: 'Al-Habib Corporation', invoiceRef: 'INV-2026-001', paymentMethod: 'Bank Transfer', bank: 'HBL', chequeNo: '', amount: 50000, status: 'CLEARED' },
  { receiptNo: 'RCP-2026-002', date: '2026-02-12', customer: 'Sunrise Trading Co.', invoiceRef: 'INV-2026-002', paymentMethod: 'Cheque', bank: 'MCB', chequeNo: 'CHQ-1234', amount: 100000, status: 'PENDING' },
  { receiptNo: 'RCP-2026-003', date: '2026-02-14', customer: 'Al-Habib Corporation', invoiceRef: null, paymentMethod: 'Cash', bank: '', chequeNo: '', amount: 30000, status: 'CLEARED' },
  { receiptNo: 'RCP-2026-004', date: '2026-02-16', customer: 'Metro Enterprises', invoiceRef: null, paymentMethod: 'Bank Transfer', bank: 'UBL', chequeNo: '', amount: 25000, status: 'CLEARED' },
  { receiptNo: 'RCP-2026-005', date: '2026-02-18', customer: 'Sunrise Trading Co.', invoiceRef: 'INV-2026-002', paymentMethod: 'Cheque', bank: 'ABL', chequeNo: 'CHQ-5678', amount: 50000, status: 'BOUNCED' },
];

const statusConfig: Record<PaymentReceiptRow['status'], { bg: string; text: string }> = {
  CLEARED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  PENDING: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  BOUNCED: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

const methodConfig: Record<PaymentReceiptRow['paymentMethod'], { bg: string; text: string }> = {
  Cash: { bg: 'bg-green-500/15', text: 'text-green-400' },
  'Bank Transfer': { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  Cheque: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
};

export default function ARPaymentReceiptPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>('all');
  const [fromReceipt, setFromReceipt] = useState('');
  const [toReceipt, setToReceipt] = useState('');
  const [custId, setCustId] = useState('');
  const [custName, setCustName] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<PaymentReceiptRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    setLoading(true);
    setTimeout(() => {
      let filtered = MOCK;
      if (invoiceMode === 'with') filtered = filtered.filter(r => r.invoiceRef !== null);
      if (invoiceMode === 'without') filtered = filtered.filter(r => r.invoiceRef === null);
      if (custId) filtered = filtered.filter(r => CUSTOMERS.find(c => c.id === custId)?.name === r.customer);
      setResults(filtered);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  const total = results.reduce((s, r) => s + r.amount, 0);
  const cleared = results.filter(r => r.status === 'CLEARED').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-500/30">
          <CreditCard className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AR Payment Receipt With / Without Invoice</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Receivable › Reports › AR Payment Receipt</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600/30 via-blue-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-sky-400" /><span className="text-sm font-semibold text-white">Report Parameters</span></div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">Invoice Mode</label>
            <div className="flex gap-2">
              {([{ id: 'all', label: 'All Receipts' }, { id: 'with', label: 'With Invoice' }, { id: 'without', label: 'Without Invoice' }] as { id: InvoiceMode; label: string }[]).map((opt) => (
                <button key={opt.id} onClick={() => setInvoiceMode(opt.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all border ${invoiceMode === opt.id ? 'bg-sky-600/30 border-sky-500/50 text-sky-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> From Receipt</label>
              <input type="text" value={fromReceipt} onChange={(e) => setFromReceipt(e.target.value)} placeholder="RCP-2026-0001"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-sky-500/60 focus:outline-none font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> To Receipt</label>
              <input type="text" value={toReceipt} onChange={(e) => setToReceipt(e.target.value)} placeholder="RCP-2026-9999"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-sky-500/60 focus:outline-none font-mono" />
            </div>
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-sky-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-sky-500/60 focus:outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Format</label>
            {(['PDF', 'Excel', 'CSV'] as FormatType[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${format === f ? 'bg-sky-600/30 border-sky-500/50 text-sky-300' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-sky-500/25">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : format === 'PDF' ? <><Printer className="h-4 w-4" /> Print</> : <><FileDown className="h-4 w-4" /> Export</>}
            </button>
          </div>
        </div>
      </div>

      {searched && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Receipts</p>
              <p className="mt-1 text-xl font-bold font-mono text-sky-400">{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cleared Amount</p>
              <p className="mt-1 text-xl font-bold font-mono text-emerald-400">{cleared.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Count</p>
              <p className="mt-1 text-xl font-bold font-mono text-white">{results.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Payment Receipts</span>
              <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-500/30">
                {invoiceMode === 'with' ? 'With Invoice' : invoiceMode === 'without' ? 'Without Invoice' : 'All'} — {results.length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Receipt No', 'Date', 'Customer', 'Invoice Ref', 'Method', 'Bank', 'Cheque No', 'Amount', 'Status'].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((row, idx) => {
                    const sc = statusConfig[row.status];
                    const mc = methodConfig[row.paymentMethod];
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-sky-300">{row.receiptNo}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                        <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                        <td className="px-4 py-3 font-mono text-xs text-teal-300">{row.invoiceRef || <span className="text-slate-500 italic">No Invoice</span>}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mc.bg} ${mc.text}`}>{row.paymentMethod}</span></td>
                        <td className="px-4 py-3 text-xs text-slate-400">{row.bank || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.chequeNo || '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{row.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                    <td colSpan={7} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
