'use client';

import { useState } from 'react';
import {
  ShieldCheck, Calendar, Printer, FileDown, X, ArrowLeft,
  Filter, Clock, User, FileText, Activity, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type FormatType = 'PDF' | 'Excel' | 'CSV';

interface AuditRow {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Error';
}

const MOCK_DATA: AuditRow[] = [
  { id: 1, timestamp: '2026-02-20 09:15:32', user: 'admin@iteck.pk', action: 'CREATE', module: 'Journal Entry', description: 'Journal Entry JV-2026-1234 created', ipAddress: '192.168.1.10', status: 'Success' },
  { id: 2, timestamp: '2026-02-20 09:22:10', user: 'finance@iteck.pk', action: 'POST', module: 'Journal Entry', description: 'Journal Entry JV-2026-1233 posted to ledger', ipAddress: '192.168.1.12', status: 'Success' },
  { id: 3, timestamp: '2026-02-20 09:45:55', user: 'admin@iteck.pk', action: 'UPDATE', module: 'Customer', description: 'Customer CUS-001 credit limit updated', ipAddress: '192.168.1.10', status: 'Warning' },
  { id: 4, timestamp: '2026-02-20 10:05:00', user: 'manager@iteck.pk', action: 'DELETE', module: 'Invoice', description: 'Draft invoice INV-2026-009 deleted', ipAddress: '192.168.1.15', status: 'Success' },
  { id: 5, timestamp: '2026-02-20 10:18:42', user: 'finance@iteck.pk', action: 'VOID', module: 'Journal Entry', description: 'Journal Entry JV-2026-1220 voided', ipAddress: '192.168.1.12', status: 'Warning' },
];

export default function AuditTrialPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [format, setFormat] = useState<FormatType>('PDF');
  const [results, setResults] = useState<AuditRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePrint() {
    setLoading(true);
    setTimeout(() => {
      setResults(MOCK_DATA);
      setSearched(true);
      setLoading(false);
    }, 700);
  }

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Success: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    Warning: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    Error: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  };

  const actionConfig: Record<string, { bg: string; text: string }> = {
    CREATE: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
    POST: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    UPDATE: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    DELETE: { bg: 'bg-red-500/15', text: 'text-red-400' },
    VOID: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/30">
          <ShieldCheck className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Audit Trial</h1>
          <p className="text-xs text-slate-400 mt-0.5">Finance › Reports › Audit Trial</p>
        </div>
      </div>

      {/* Stats row */}
      {searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Events', value: results.length, icon: Activity, color: 'indigo' },
            { label: 'Successful', value: results.filter(r => r.status === 'Success').length, icon: TrendingUp, color: 'emerald' },
            { label: 'Warnings', value: results.filter(r => r.status === 'Warning').length, icon: AlertTriangle, color: 'amber' },
            { label: 'Users Active', value: [...new Set(results.map(r => r.user))].length, icon: User, color: 'violet' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Report Parameters</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* From Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all [color-scheme:dark]"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3 w-3" /> Export Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FormatType)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
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
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all shadow-lg shadow-violet-500/25"
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

          {/* Date Range display */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>Showing records from <span className="text-slate-400 font-medium">{fromDate}</span> to <span className="text-slate-400 font-medium">{toDate}</span></span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {searched && results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Audit Trail Results</span>
            <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300 ring-1 ring-violet-500/30">
              {results.length} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['#', 'Timestamp', 'User', 'Action', 'Module', 'Description', 'IP Address', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((row, idx) => {
                  const sc = statusConfig[row.status];
                  const ac = actionConfig[row.action] || { bg: 'bg-slate-500/15', text: 'text-slate-400' };
                  return (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300 whitespace-nowrap">{row.timestamp}</td>
                      <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap">{row.user}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${ac.bg} ${ac.text}`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-indigo-300 whitespace-nowrap">{row.module}</td>
                      <td className="px-4 py-3 text-xs text-slate-300 max-w-xs truncate">{row.description}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{row.ipAddress}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
