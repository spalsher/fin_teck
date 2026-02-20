'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, FileSpreadsheet, ChevronRight,
  CheckCircle2, AlertCircle, FileDown, Table2,
} from 'lucide-react';

const WORKSHEETS = ['Sheet1', 'Sheet2', 'Sheet3', 'DebitNote', 'CreditNote', 'Data'];

type Step = 1 | 2 | 3 | 4;

interface PreviewRow {
  row: number;
  invoiceNo: string;
  date: string;
  customer: string;
  type: string;
  amount: number;
  tax: number;
  total: number;
}

const MOCK_PREVIEW: PreviewRow[] = [
  { row: 2, invoiceNo: 'DN-2026-001', date: '2026-02-05', customer: 'Al-Habib Corporation', type: 'Debit', amount: 15000, tax: 2250, total: 17250 },
  { row: 3, invoiceNo: 'CN-2026-001', date: '2026-02-08', customer: 'Sunrise Trading Co.', type: 'Credit', amount: 8000, tax: 1200, total: 9200 },
  { row: 4, invoiceNo: 'DN-2026-002', date: '2026-02-12', customer: 'Metro Enterprises', type: 'Debit', amount: 22000, tax: 3300, total: 25300 },
  { row: 5, invoiceNo: 'CN-2026-002', date: '2026-02-17', customer: 'Al-Habib Corporation', type: 'Credit', amount: 5000, tax: 750, total: 5750 },
];

export default function LoadDebitCreditNotePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [worksheet, setWorksheet] = useState('');
  const [worksheets, setWorksheets] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState<Step | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setWorksheet('');
    setWorksheets([]);
    setPreview([]);
    setLoaded(false);
    setSuccessMsg(null);
    setError(null);
    setCompletedSteps(new Set());
    if (f) {
      setCompletedSteps(new Set([1]));
      setTimeout(() => setWorksheets(WORKSHEETS), 300);
    }
  }

  function handleUploadFile() {
    if (!file) return setError('Please choose a file first.');
    if (!worksheet) return setError('Please select a worksheet.');
    setError(null);
    setLoadingStep(3);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 2, 3]));
      setPreview(MOCK_PREVIEW);
      setLoadingStep(null);
    }, 900);
  }

  function handleLoadDebitCredit() {
    if (preview.length === 0) return setError('Please upload the file first (Step 3).');
    setError(null);
    setLoadingStep(4);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 4]));
      setLoaded(true);
      setSuccessMsg(`${preview.length} records loaded successfully into the system.`);
      setLoadingStep(null);
    }, 1000);
  }

  function handleLoadIntoTemplate() {
    if (!file) return setError('Please choose a file first.');
    setError(null);
    setLoadingStep(3);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 2, 3]));
      setPreview(MOCK_PREVIEW);
      setLoadingStep(null);
    }, 900);
  }

  function handleReset() {
    setFile(null);
    setWorksheet('');
    setWorksheets([]);
    setPreview([]);
    setLoaded(false);
    setError(null);
    setSuccessMsg(null);
    setCompletedSteps(new Set());
    if (fileRef.current) fileRef.current.value = '';
  }

  const steps = [
    { num: 1 as Step, label: 'Choose File', done: completedSteps.has(1) },
    { num: 2 as Step, label: 'Select Worksheet', done: completedSteps.has(2) },
    { num: 3 as Step, label: 'Upload File', done: completedSteps.has(3) },
    { num: 4 as Step, label: 'Load Records', done: completedSteps.has(4) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 ring-1 ring-yellow-500/30">
          <FileSpreadsheet className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Load Debit / Credit Note From Excel</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Data Loader</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-yellow-400">Load Debit / Credit Note</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
              s.done ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
              loadingStep === s.num ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse' :
              'bg-white/5 border-white/10 text-slate-500'
            }`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? 'bg-yellow-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                {s.done ? '✓' : s.num}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-slate-600" />}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600/30 via-amber-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <Upload className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white">Excel Data Loader — Debit / Credit Note</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold ring-1 ring-yellow-500/40">1</span>
                Choose Excel File
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-3 cursor-pointer hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all group">
                  <FileSpreadsheet className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <span className={`text-sm truncate ${file ? 'text-white font-medium' : 'text-slate-500'}`}>
                    {file ? file.name : 'Click to select .xlsx / .xls file'}
                  </span>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </label>
                {file && <CheckCircle2 className="h-5 w-5 text-yellow-400 flex-shrink-0" />}
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold ring-1 ring-yellow-500/40">2</span>
                Select Worksheet
              </label>
              <select value={worksheet} onChange={(e) => { setWorksheet(e.target.value); if (e.target.value) setCompletedSteps((p) => new Set([...p, 2])); }}
                disabled={worksheets.length === 0}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-yellow-500/60 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <option value="">— Select worksheet —</option>
                {worksheets.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold ring-1 ring-yellow-500/40">3</span>
                Upload File
              </label>
              <button onClick={handleUploadFile} disabled={!file || !worksheet || loadingStep === 3}
                className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm font-medium text-yellow-300 hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 3 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" /> : <Upload className="h-4 w-4" />}
                {loadingStep === 3 ? 'Uploading...' : 'Up-Load File'}
              </button>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold ring-1 ring-yellow-500/40">4</span>
                Load Debit / Credit Note
              </label>
              <button onClick={handleLoadDebitCredit} disabled={preview.length === 0 || loaded || loadingStep === 4}
                className="flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-300 hover:bg-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 4 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" /> : <Table2 className="h-4 w-4" />}
                {loadingStep === 4 ? 'Loading...' : loaded ? 'Loaded ✓' : 'Load Debit / Credit Note'}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {successMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/8">
            <button onClick={handleUploadFile} disabled={!file || !worksheet || loadingStep !== null}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20">
              <Upload className="h-4 w-4" /> Up-Load File
            </button>
            <button onClick={handleLoadIntoTemplate} disabled={!file || loadingStep !== null}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20">
              <FileDown className="h-4 w-4" /> Load Into Template
            </button>
            <button onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-auto">
              Reset
            </button>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Preview — Data from Excel</span>
            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300 ring-1 ring-yellow-500/30">{preview.length} rows read</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Row', 'Invoice / Note No', 'Date', 'Customer', 'Type', 'Amount', 'Tax', 'Total'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Amount', 'Tax', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.row}</td>
                    <td className="px-4 py-3 font-mono text-xs text-yellow-300">{row.invoiceNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.type === 'Debit' ? 'bg-rose-500/15 text-rose-400' : 'bg-teal-500/15 text-teal-400'}`}>{row.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">{row.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Total</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-300">{preview.reduce((s, r) => s + r.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">{preview.reduce((s, r) => s + r.tax, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{preview.reduce((s, r) => s + r.total, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
