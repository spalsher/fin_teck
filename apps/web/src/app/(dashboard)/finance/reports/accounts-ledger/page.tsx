'use client';

import { useState } from 'react';
import {
  BookOpen, Calendar, Printer, FileDown, X, ArrowLeft,
  Filter, Search, FileText, TrendingUp, TrendingDown, DollarSign, Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type FormatType = 'PDF' | 'Excel' | 'CSV';

interface LedgerRow {
  date: string;
  voucherNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'Dr' | 'Cr';
}

const MOCK_LEDGER: LedgerRow[] = [
  { date: '2026-02-01', voucherNo: 'OB-2026', description: 'Opening Balance', debit: 500000, credit: 0, balance: 500000, type: 'Dr' },
  { date: '2026-02-05', voucherNo: 'JV-2026-1201', description: 'Sales Revenue - ABC Corp', debit: 150000, credit: 0, balance: 650000, type: 'Dr' },
  { date: '2026-02-08', voucherNo: 'JV-2026-1205', description: 'Payment received - XYZ Ltd', debit: 0, credit: 80000, balance: 570000, type: 'Dr' },
  { date: '2026-02-12', voucherNo: 'JV-2026-1210', description: 'Office supplies purchase', debit: 25000, credit: 0, balance: 595000, type: 'Dr' },
  { date: '2026-02-15', voucherNo: 'JV-2026-1215', description: 'Salaries disbursement', debit: 0, credit: 120000, balance: 475000, type: 'Dr' },
  { date: '2026-02-18', voucherNo: 'JV-2026-1220', description: 'Utility bills payment', debit: 0, credit: 15000, balance: 460000, type: 'Dr' },
  { date: '2026-02-20', voucherNo: 'JV-2026-1225', description: 'Sales Revenue - DEF Industries', debit: 200000, credit: 0, balance: 660000, type: 'Dr' },
];

interface FilterState {
  orgFrom: string; orgTo: string;
  ccFrom: string; ccTo: string;
  naFrom: string; naTo: string;
  saFrom: string; saTo: string;
}

export default function AccountsLedgerPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<LedgerRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    orgFrom: '', orgTo: '',
    ccFrom: '', ccTo: '',
    naFrom: '', naTo: '',
    saFrom: '', saTo: '',
  });

  const updateFilter = (key: keyof FilterState, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  function handlePrint() {
    setLoading(true);
    setTimeout(() => {
      setResults(MOCK_LEDGER);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  const totalDebit = results.reduce((s, r) => s + r.debit, 0);
  const totalCredit = results.reduce((s, r) => s + r.credit, 0);
  const closingBalance = results.length > 0 ? results[results.length - 1].balance : 0;

  const filterRows: Array<{ label: string; fromKey: keyof FilterState; toKey: keyof FilterState; hint: string }> = [
    { label: 'ORG', fromKey: 'orgFrom', toKey: 'orgTo', hint: 'Organization code' },
    { label: 'CC', fromKey: 'ccFrom', toKey: 'ccTo', hint: 'Cost center' },
    { label: 'NA', fromKey: 'naFrom', toKey: 'naTo', hint: 'Natural account' },
    { label: 'SA', fromKey: 'saFrom', toKey: 'saTo', hint: 'Sub account' },
  ];

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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <BookOpen className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Accounts Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">Finance › Reports › Accounts Ledger</p>
        </div>
      </div>

      {/* Summary Cards */}
      {searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Debit', value: `PKR ${totalDebit.toLocaleString()}`, icon: TrendingUp, color: 'emerald', sub: 'Debit side total' },
            { label: 'Total Credit', value: `PKR ${totalCredit.toLocaleString()}`, icon: TrendingDown, color: 'sky', sub: 'Credit side total' },
            { label: 'Closing Balance', value: `PKR ${closingBalance.toLocaleString()}`, icon: Scale, color: 'indigo', sub: 'Net balance' },
            { label: 'Transactions', value: results.length, icon: DollarSign, color: 'violet', sub: 'Total entries' },
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
        <div className="bg-gradient-to-r from-emerald-600/30 via-teal-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Report Parameters</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterRows.map((row) => (
              <div key={row.label} className="rounded-xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 tracking-wide">
                    {row.label}
                  </span>
                  <span className="text-xs text-slate-500">{row.hint}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">From</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={filters[row.fromKey]}
                        onChange={(e) => updateFilter(row.fromKey, e.target.value)}
                        placeholder={`${row.label} From`}
                        className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none transition-all"
                      />
                      <button className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all">
                        <Search className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">To</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={filters[row.toKey]}
                        onChange={(e) => updateFilter(row.toKey, e.target.value)}
                        placeholder={`${row.label} To`}
                        className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none transition-all"
                      />
                      <button className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all">
                        <Search className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Date Range + Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-2 border-t border-white/8">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3 w-3" /> Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none transition-all"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>

            <div className="flex gap-2 lg:col-span-2">
              <button
                onClick={() => { setSearched(false); setResults([]); }}
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
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/25"
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

      {/* Ledger Table */}
      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Account Ledger Detail</span>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">
              {results.length} transactions
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Date', 'Voucher No', 'Description', 'Debit', 'Credit', 'Balance', 'Type'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Debit', 'Credit', 'Balance'].includes(h) ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-indigo-300">{row.voucherNo}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">
                      {row.debit > 0 ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-sky-400">
                      {row.credit > 0 ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-white font-semibold">
                      {row.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.type === 'Dr' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'}`}>
                        {row.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Closing Balance
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">
                    {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-sky-400">
                    {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">
                    {closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                      Dr
                    </span>
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
