'use client';

import { useState } from 'react';
import {
  FileText, Calendar, Printer, FileDown, X, ArrowLeft,
  Filter, Hash, TrendingUp, TrendingDown, CheckCircle2, Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type FormatType = 'PDF' | 'Excel' | 'CSV';

interface JVRow {
  voucherNo: string;
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  status: 'POSTED' | 'DRAFT' | 'VOID';
}

const MOCK_JV: JVRow[] = [
  { voucherNo: 'JV-2026-1220', date: '2026-02-15', description: 'Salaries disbursement - Feb 2026', accountCode: '5001', accountName: 'Salaries Expense', debit: 120000, credit: 0, status: 'POSTED' },
  { voucherNo: 'JV-2026-1220', date: '2026-02-15', description: 'Salaries disbursement - Feb 2026', accountCode: '1001', accountName: 'Cash in Bank', debit: 0, credit: 120000, status: 'POSTED' },
  { voucherNo: 'JV-2026-1225', date: '2026-02-18', description: 'Office supplies purchase', accountCode: '6010', accountName: 'Office Supplies', debit: 25000, credit: 0, status: 'POSTED' },
  { voucherNo: 'JV-2026-1225', date: '2026-02-18', description: 'Office supplies purchase', accountCode: '1001', accountName: 'Cash in Bank', debit: 0, credit: 25000, status: 'POSTED' },
  { voucherNo: 'JV-2026-1230', date: '2026-02-20', description: 'Sales Revenue - DEF Industries', accountCode: '1100', accountName: 'Accounts Receivable', debit: 200000, credit: 0, status: 'DRAFT' },
  { voucherNo: 'JV-2026-1230', date: '2026-02-20', description: 'Sales Revenue - DEF Industries', accountCode: '4001', accountName: 'Sales Revenue', debit: 0, credit: 200000, status: 'DRAFT' },
];

export default function JVPrintOutPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromVoucherNo, setFromVoucherNo] = useState('');
  const [toVoucherNo, setToVoucherNo] = useState('');
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<JVRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => {
      setResults(MOCK_JV);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  // Group by voucher no
  const grouped = results.reduce<Record<string, JVRow[]>>((acc, row) => {
    if (!acc[row.voucherNo]) acc[row.voucherNo] = [];
    acc[row.voucherNo].push(row);
    return acc;
  }, {});

  const totalDebit = results.reduce((s, r) => s + r.debit, 0);
  const totalCredit = results.reduce((s, r) => s + r.credit, 0);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    POSTED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    DRAFT: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    VOID: { bg: 'bg-red-500/15', text: 'text-red-400' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-500/30">
          <FileText className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">JV Print Out</h1>
          <p className="text-xs text-slate-400 mt-0.5">Finance › Reports › Journal Voucher Print Out</p>
        </div>
      </div>

      {/* Summary cards */}
      {searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Vouchers', value: Object.keys(grouped).length, icon: Hash, color: 'sky', sub: 'Unique JVs' },
            { label: 'Total Debit', value: `PKR ${totalDebit.toLocaleString()}`, icon: TrendingUp, color: 'emerald', sub: 'Debit total' },
            { label: 'Total Credit', value: `PKR ${totalCredit.toLocaleString()}`, icon: TrendingDown, color: 'rose', sub: 'Credit total' },
            { label: 'Balanced', value: totalDebit === totalCredit ? 'Yes' : 'No', icon: Scale, color: totalDebit === totalCredit ? 'emerald' : 'amber', sub: 'Entry balance' },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                  <p className={`text-lg font-bold text-${card.color}-400`}>{card.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${card.color}-500/20`}>
                  <card.icon className={`h-4 w-4 text-${card.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600/30 via-blue-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-semibold text-white">Report Parameters</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* From Voucher No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> From Voucher No
              </label>
              <input
                type="text"
                value={fromVoucherNo}
                onChange={(e) => setFromVoucherNo(e.target.value)}
                placeholder="e.g. JV-2026-0001"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all font-mono"
              />
            </div>

            {/* To Voucher No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> To Voucher No
              </label>
              <input
                type="text"
                value={toVoucherNo}
                onChange={(e) => setToVoucherNo(e.target.value)}
                placeholder="e.g. JV-2026-9999"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all font-mono"
              />
            </div>

            {/* From Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all [color-scheme:dark]"
              />
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Format + Action Buttons */}
          <div className="mt-5 flex flex-wrap items-end gap-3 pt-5 border-t border-white/8">
            <div className="space-y-1.5 min-w-36">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3 w-3" /> Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-sky-500/60 focus:outline-none transition-all"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>

            <div className="flex gap-2 pb-0.5">
              <button
                onClick={() => { setSearched(false); setResults([]); setFromVoucherNo(''); setToVoucherNo(''); }}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all"
              >
                Exit
              </button>
              <button
                onClick={handlePrint}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-sky-500/25"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : format === 'PDF' ? (
                  <><Printer className="h-4 w-4" /> Print</>
                ) : (
                  <><FileDown className="h-4 w-4" /> Export</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JV Results - Grouped by Voucher */}
      {searched && Object.keys(grouped).length > 0 && (
        <div className="mt-6 space-y-4">
          {Object.entries(grouped).map(([vno, rows]) => {
            const vDebit = rows.reduce((s, r) => s + r.debit, 0);
            const vCredit = rows.reduce((s, r) => s + r.credit, 0);
            const sc = statusConfig[rows[0].status];
            const isBalanced = vDebit === vCredit;

            return (
              <div key={vno} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
                {/* Voucher Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-sky-300">{vno}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">{rows[0].date}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-300">{rows[0].description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBalanced && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Balanced
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                      {rows[0].status}
                    </span>
                  </div>
                </div>

                {/* Lines */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Account Code', 'Account Name', 'Description', 'Debit', 'Credit'].map((h) => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${['Debit', 'Credit'].includes(h) ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-indigo-300">{row.accountCode}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-300">{row.accountName}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">{row.description}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-400">
                          {row.debit > 0 ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-sky-400">
                          {row.credit > 0 ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800/40 border-t border-white/10">
                      <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400">
                        Voucher Total
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-emerald-400">
                        {vDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-sky-400">
                        {vCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}

          {/* Grand Total */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-slate-800/80 to-slate-700/50 p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Grand Total</span>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Debit</p>
                <p className="font-mono font-bold text-emerald-400">{totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Credit</p>
                <p className="font-mono font-bold text-sky-400">{totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${totalDebit === totalCredit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {totalDebit === totalCredit ? <CheckCircle2 className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
                <span className="text-xs font-semibold">{totalDebit === totalCredit ? 'Balanced' : 'Unbalanced'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
