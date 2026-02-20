'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, FileSpreadsheet, ChevronRight,
  CheckCircle2, AlertCircle, FileDown, ShoppingBag,
} from 'lucide-react';

const WORKSHEETS = ['Sheet1', 'Sheet2', 'OrderBooking', 'AROrders', 'Data'];

type Step = 1 | 2 | 3 | 4;

interface PreviewRow {
  row: number;
  orderNo: string;
  date: string;
  customer: string;
  element: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
}

const MOCK_PREVIEW: PreviewRow[] = [
  { row: 2, orderNo: 'ORD-2026-001', date: '2026-02-03', customer: 'Al-Habib Corporation', element: '1-Security Services', qty: 1, unitPrice: 45000, discount: 0, total: 45000 },
  { row: 3, orderNo: 'ORD-2026-002', date: '2026-02-05', customer: 'Sunrise Trading Co.', element: '2-Monitoring Services', qty: 2, unitPrice: 18000, discount: 2000, total: 34000 },
  { row: 4, orderNo: 'ORD-2026-003', date: '2026-02-09', customer: 'Metro Enterprises', element: '3-Maintenance Contract', qty: 1, unitPrice: 30000, discount: 0, total: 30000 },
  { row: 5, orderNo: 'ORD-2026-004', date: '2026-02-14', customer: 'Global Tech Solutions', element: '1-Security Services', qty: 3, unitPrice: 15000, discount: 5000, total: 40000 },
  { row: 6, orderNo: 'ORD-2026-005', date: '2026-02-18', customer: 'Al-Habib Corporation', element: '4-Patrol Services', qty: 1, unitPrice: 25000, discount: 0, total: 25000 },
];

export default function LoadAROrderBookingPage() {
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

  function handleLoadOrderBooking() {
    if (preview.length === 0) return setError('Please upload the file first (Step 3).');
    setError(null);
    setLoadingStep(4);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 4]));
      setLoaded(true);
      setSuccessMsg(`${preview.length} order booking records loaded successfully.`);
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

  const steps: { num: Step; label: string; done: boolean }[] = [
    { num: 1, label: 'Choose File', done: completedSteps.has(1) },
    { num: 2, label: 'Select Worksheet', done: completedSteps.has(2) },
    { num: 3, label: 'Upload File', done: completedSteps.has(3) },
    { num: 4, label: 'Load Orders', done: completedSteps.has(4) },
  ];

  const grandTotal = preview.reduce((s, r) => s + r.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
          <ShoppingBag className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Load AR Order Booking From Excel</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Data Loader</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-orange-400">Load AR Order Booking</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
              s.done ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' :
              loadingStep === s.num ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse' :
              'bg-white/5 border-white/10 text-slate-500'
            }`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? 'bg-orange-500 text-black' : 'bg-white/10 text-slate-400'}`}>
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
        <div className="bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <Upload className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-semibold text-white">Excel Data Loader — AR Order Booking</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold ring-1 ring-orange-500/40">1</span>
                Choose Excel File
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-3 cursor-pointer hover:border-orange-500/40 hover:bg-orange-500/5 transition-all">
                  <FileSpreadsheet className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <span className={`text-sm truncate ${file ? 'text-white font-medium' : 'text-slate-500'}`}>
                    {file ? file.name : 'Click to select .xlsx / .xls file'}
                  </span>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </label>
                {file && <CheckCircle2 className="h-5 w-5 text-orange-400 flex-shrink-0" />}
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold ring-1 ring-orange-500/40">2</span>
                Select Worksheet
              </label>
              <select value={worksheet} onChange={(e) => { setWorksheet(e.target.value); if (e.target.value) setCompletedSteps((p) => new Set([...p, 2])); }}
                disabled={worksheets.length === 0}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-orange-500/60 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <option value="">— Select worksheet —</option>
                {worksheets.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold ring-1 ring-orange-500/40">3</span>
                Upload File
              </label>
              <button onClick={handleUploadFile} disabled={!file || !worksheet || loadingStep === 3}
                className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-medium text-orange-300 hover:bg-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 3 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" /> : <Upload className="h-4 w-4" />}
                {loadingStep === 3 ? 'Uploading...' : 'Up-Load File'}
              </button>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold ring-1 ring-orange-500/40">4</span>
                Load AR Order Booking
              </label>
              <button onClick={handleLoadOrderBooking} disabled={preview.length === 0 || loaded || loadingStep === 4}
                className="flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-300 hover:bg-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 4 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" /> : <ShoppingBag className="h-4 w-4" />}
                {loadingStep === 4 ? 'Loading...' : loaded ? 'Loaded ✓' : 'Load AR Order Booking'}
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
            <span className="text-sm font-semibold text-white">Preview — AR Order Booking Data</span>
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300 ring-1 ring-orange-500/30">{preview.length} rows read</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Row', 'Order No', 'Date', 'Customer', 'Element', 'Qty', 'Unit Price', 'Discount', 'Total'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Qty', 'Unit Price', 'Discount', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.row}</td>
                    <td className="px-4 py-3 font-mono text-xs text-orange-300">{row.orderNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                    <td className="px-4 py-3 text-xs text-violet-300">{row.element}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.qty}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{row.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{row.discount > 0 ? `(${row.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })})` : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={8} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Grand Total</td>
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
