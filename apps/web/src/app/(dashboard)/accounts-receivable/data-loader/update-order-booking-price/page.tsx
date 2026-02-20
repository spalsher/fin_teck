'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, FileSpreadsheet, ChevronRight,
  CheckCircle2, AlertCircle, FileDown, RefreshCw, Tag,
} from 'lucide-react';

const WORKSHEETS = ['Sheet1', 'Sheet2', 'PriceUpdate', 'OrderData', 'Data'];

const ELEMENTS = [
  '1-Security Services',
  '2-Monitoring Services',
  '3-Maintenance Contract',
  '4-Patrol Services',
  '5-CCTV Surveillance',
  '6-Access Control',
  '7-Fire Safety',
  '8-Guard Services',
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface PreviewRow {
  row: number;
  orderNo: string;
  customer: string;
  element: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePct: number;
}

const MOCK_PREVIEW: PreviewRow[] = [
  { row: 2, orderNo: 'ORD-2026-001', customer: 'Al-Habib Corporation', element: '2-Monitoring Services', oldPrice: 18000, newPrice: 19500, change: 1500, changePct: 8.33 },
  { row: 3, orderNo: 'ORD-2026-003', customer: 'Metro Enterprises', element: '2-Monitoring Services', oldPrice: 18000, newPrice: 19500, change: 1500, changePct: 8.33 },
  { row: 4, orderNo: 'ORD-2026-007', customer: 'Global Tech Solutions', element: '2-Monitoring Services', oldPrice: 16500, newPrice: 19500, change: 3000, changePct: 18.18 },
  { row: 5, orderNo: 'ORD-2026-010', customer: 'Sunrise Trading Co.', element: '2-Monitoring Services', oldPrice: 18000, newPrice: 19500, change: 1500, changePct: 8.33 },
];

export default function UpdateOrderBookingPricePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [worksheet, setWorksheet] = useState('');
  const [worksheets, setWorksheets] = useState<string[]>([]);
  const [element, setElement] = useState('2-Monitoring Services');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [updated, setUpdated] = useState(false);
  const [loadingStep, setLoadingStep] = useState<Step | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setWorksheet('');
    setWorksheets([]);
    setPreview([]);
    setUpdated(false);
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
    if (!element) return setError('Please select an element.');
    setError(null);
    setLoadingStep(4);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 2, 3, 4]));
      setLoadingStep(null);
    }, 900);
  }

  function handleLoadIntoTemplate() {
    if (!file) return setError('Please choose a file first.');
    if (!worksheet) return setError('Please select a worksheet.');
    setError(null);
    setLoadingStep(5);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 2, 3, 4, 5]));
      const filtered = MOCK_PREVIEW.filter(r => r.element === element);
      setPreview(filtered.length > 0 ? filtered : MOCK_PREVIEW);
      setLoadingStep(null);
    }, 900);
  }

  function handleUpdateDataPrice() {
    if (preview.length === 0) return setError('Please load into template first (Step 5).');
    setError(null);
    setLoadingStep(6);
    setTimeout(() => {
      setCompletedSteps((p) => new Set([...p, 6]));
      setUpdated(true);
      setSuccessMsg(`${preview.length} order(s) price updated successfully for element: ${element}`);
      setLoadingStep(null);
    }, 1000);
  }

  function handleReset() {
    setFile(null);
    setWorksheet('');
    setWorksheets([]);
    setPreview([]);
    setUpdated(false);
    setError(null);
    setSuccessMsg(null);
    setCompletedSteps(new Set());
    if (fileRef.current) fileRef.current.value = '';
  }

  const steps: { num: Step; label: string; done: boolean }[] = [
    { num: 1, label: 'Choose File', done: completedSteps.has(1) },
    { num: 2, label: 'Select Worksheet', done: completedSteps.has(2) },
    { num: 3, label: 'Select Element', done: completedSteps.has(3) },
    { num: 4, label: 'Upload File', done: completedSteps.has(4) },
    { num: 5, label: 'Load Template', done: completedSteps.has(5) },
    { num: 6, label: 'Update Price', done: completedSteps.has(6) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 ring-1 ring-pink-500/30">
          <RefreshCw className="h-5 w-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Order Booking Price Update From Excel</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Data Loader</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-pink-400">Update Order Booking Price</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 flex items-center gap-1.5 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
              s.done ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' :
              loadingStep === s.num ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse' :
              'bg-white/5 border-white/10 text-slate-500'
            }`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? 'bg-pink-500 text-black' : 'bg-white/10 text-slate-400'}`}>
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
        <div className="bg-gradient-to-r from-pink-600/30 via-rose-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-pink-400" />
          <span className="text-sm font-semibold text-white">Excel Price Updater — Order Booking</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold ring-1 ring-pink-500/40">1</span>
                Choose Excel File
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-3 cursor-pointer hover:border-pink-500/40 hover:bg-pink-500/5 transition-all">
                  <FileSpreadsheet className="h-5 w-5 text-pink-400 flex-shrink-0" />
                  <span className={`text-sm truncate ${file ? 'text-white font-medium' : 'text-slate-500'}`}>
                    {file ? file.name : 'Click to select .xlsx / .xls file'}
                  </span>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </label>
                {file && <CheckCircle2 className="h-5 w-5 text-pink-400 flex-shrink-0" />}
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold ring-1 ring-pink-500/40">2</span>
                Select Worksheet
              </label>
              <select value={worksheet} onChange={(e) => { setWorksheet(e.target.value); if (e.target.value) setCompletedSteps((p) => new Set([...p, 2])); }}
                disabled={worksheets.length === 0}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-pink-500/60 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <option value="">— Select worksheet —</option>
                {worksheets.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold ring-1 ring-pink-500/40">3</span>
                Select Element
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                <select value={element} onChange={(e) => { setElement(e.target.value); setCompletedSteps((p) => new Set([...p, 3])); }}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 pl-8 pr-3 py-2.5 text-sm text-white focus:border-pink-500/60 focus:outline-none transition-all">
                  {ELEMENTS.map((el) => <option key={el} value={el}>{el}</option>)}
                </select>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold ring-1 ring-pink-500/40">4</span>
                Upload File
              </label>
              <button onClick={handleUploadFile} disabled={!file || !worksheet || !element || loadingStep === 4}
                className="flex items-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-sm font-medium text-pink-300 hover:bg-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 4 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" /> : <Upload className="h-4 w-4" />}
                {loadingStep === 4 ? 'Uploading...' : 'Up-Load File'}
              </button>
            </div>

            {/* Step 5 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold ring-1 ring-pink-500/40">5</span>
                Load Into Template
              </label>
              <button onClick={handleLoadIntoTemplate} disabled={!file || !worksheet || loadingStep === 5}
                className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 5 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" /> : <FileDown className="h-4 w-4" />}
                {loadingStep === 5 ? 'Loading...' : 'Load Into Template'}
              </button>
            </div>

            {/* Step 6 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold ring-1 ring-pink-500/40">6</span>
                Update Data Price
              </label>
              <button onClick={handleUpdateDataPrice} disabled={preview.length === 0 || updated || loadingStep === 6}
                className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loadingStep === 6 ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" /> : <RefreshCw className="h-4 w-4" />}
                {loadingStep === 6 ? 'Updating...' : updated ? 'Updated ✓' : 'Update Data Price'}
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
            <button onClick={handleUploadFile} disabled={!file || !worksheet || !element || loadingStep !== null}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20">
              <Upload className="h-4 w-4" /> Up-Load File
            </button>
            <button onClick={handleLoadIntoTemplate} disabled={!file || !worksheet || loadingStep !== null}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20">
              <FileDown className="h-4 w-4" /> Load Into Template
            </button>
            <button onClick={handleUpdateDataPrice} disabled={preview.length === 0 || updated || loadingStep !== null}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/20">
              <RefreshCw className="h-4 w-4" /> Update Data Price
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Price Update Preview</span>
              <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300 ring-1 ring-violet-500/30">{element}</span>
            </div>
            <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-300 ring-1 ring-pink-500/30">{preview.length} orders affected</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Row', 'Order No', 'Customer', 'Element', 'Old Price', 'New Price', 'Change', '% Change'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Old Price', 'New Price', 'Change', '% Change'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.row}</td>
                    <td className="px-4 py-3 font-mono text-xs text-pink-300">{row.orderNo}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.customer}</td>
                    <td className="px-4 py-3 text-xs text-violet-300">{row.element}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-400 line-through">{row.oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-white">{row.newPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">+{row.change.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">+{row.changePct.toFixed(2)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Summary</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">{preview.reduce((s, r) => s + r.oldPrice, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-white">{preview.reduce((s, r) => s + r.newPrice, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">+{preview.reduce((s, r) => s + r.change, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400">{preview.length} records</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
