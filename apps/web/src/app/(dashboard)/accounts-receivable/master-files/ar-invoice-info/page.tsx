'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Upload, Search, X, ChevronRight,
  Database, Eye, AlertCircle, RefreshCw, Copy,
} from 'lucide-react';

interface VehicleRecord {
  id: string;
  aiNo: string;
  aoNo: string;
  make: string;
  modelNo: string;
  engineNo: string;
  chassisNo: string;
  registrationNo: string;
}

const MOCK_RECORDS: VehicleRecord[] = [
  { id: '1', aiNo: 'AI-2026-001', aoNo: 'AO-2026-001', make: 'Toyota', modelNo: 'Corolla 1.6', engineNo: 'ENG-001-TYT', chassisNo: 'CHS-001-TYT', registrationNo: 'KHI-2026-001' },
  { id: '2', aiNo: 'AI-2026-002', aoNo: 'AO-2026-002', make: 'Honda', modelNo: 'Civic 1.8', engineNo: 'ENG-002-HND', chassisNo: 'CHS-002-HND', registrationNo: 'KHI-2026-002' },
  { id: '3', aiNo: 'AI-2026-003', aoNo: 'AO-2026-003', make: 'Suzuki', modelNo: 'Alto VXR', engineNo: 'ENG-003-SUZ', chassisNo: 'CHS-003-SUZ', registrationNo: 'LHR-2026-001' },
];

export default function ARInvoiceInfoPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [worksheet, setWorksheet] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [allRecords] = useState<VehicleRecord[]>(MOCK_RECORDS);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicate, setShowDuplicate] = useState(false);

  function handleUploadFile() {
    if (!fileName) return setError('Please choose a file first.');
    setError(null);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadDone(true);
    }, 900);
  }

  function handleLoadSelected() {
    if (!uploadDone && !worksheet) return setError('Please upload a file and select a worksheet first.');
    setError(null);
    setLoadingData(true);
    setTimeout(() => {
      setRecords(allRecords);
      setLoadingData(false);
    }, 700);
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      setRecords(allRecords);
      return;
    }
    const q = searchQuery.toLowerCase();
    setRecords(
      allRecords.filter(
        (r) =>
          r.aoNo.toLowerCase().includes(q) ||
          r.engineNo.toLowerCase().includes(q) ||
          r.registrationNo.toLowerCase().includes(q) ||
          r.chassisNo.toLowerCase().includes(q)
      )
    );
  }

  function handleClear() {
    setFileName('');
    setWorksheet('');
    setSearchQuery('');
    setRecords([]);
    setUploadDone(false);
    setError(null);
    setShowDuplicate(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-500/30">
          <FileText className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AR Invoice Information</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Master Files</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-teal-400">AR Invoice Information</span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-teal-600/30 via-cyan-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">AR Order Booking Invoice / Vehicle Information</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1 & Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 ring-1 ring-teal-500/40 text-[10px] font-bold text-teal-400">1</span>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Choose File</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Upload className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{fileName || 'No file chosen'}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    setFileName(e.target.files?.[0]?.name || '');
                    setUploadDone(false);
                    setError(null);
                  }}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 ring-1 ring-teal-500/40 text-[10px] font-bold text-teal-400">2</span>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Worksheet</label>
              </div>
              <input
                type="text"
                value={worksheet}
                onChange={(e) => setWorksheet(e.target.value)}
                placeholder="Sheet name or index..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
              />
            </div>
          </div>

          {/* Step 3 & Step 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 ring-1 ring-teal-500/40 text-[10px] font-bold text-teal-400">3</span>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Upload File</label>
              </div>
              <button
                type="button"
                onClick={handleUploadFile}
                disabled={uploading || uploadDone}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  uploadDone
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 shadow-lg shadow-teal-500/20'
                }`}
              >
                {uploading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Uploading...</>
                ) : uploadDone ? (
                  <><Upload className="h-4 w-4" /> File Uploaded</>
                ) : (
                  <><Upload className="h-4 w-4" /> Up-Load File</>
                )}
              </button>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 ring-1 ring-teal-500/40 text-[10px] font-bold text-teal-400">4</span>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Load Data</label>
              </div>
              <button
                type="button"
                onClick={handleLoadSelected}
                disabled={loadingData}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/20"
              >
                {loadingData ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Loading...</>
                ) : (
                  <><Database className="h-4 w-4" /> Load Selected Data</>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Search Row */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Search className="h-3.5 w-3.5" /> Search
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="By Order / Engine / Registration / Chassis No"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2 text-sm font-medium text-white hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/20"
            >
              <Search className="h-4 w-4" /> Search
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-5 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
            >
              <X className="h-4 w-4" /> Exit
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-5 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Clear
            </button>
            <button
              type="button"
              onClick={() => setShowDuplicate((v) => !v)}
              className="flex items-center gap-2 rounded-lg bg-pink-500/10 border border-pink-500/30 px-5 py-2 text-sm font-medium text-pink-400 hover:bg-pink-500/20 transition-all"
            >
              <Copy className="h-4 w-4" /> Duplicate Order Booking
            </button>
          </div>

          {/* Duplicate Warning */}
          {showDuplicate && (
            <div className="flex items-center gap-2 rounded-lg bg-pink-500/10 border border-pink-500/30 px-4 py-3 text-sm text-pink-400">
              <Copy className="h-4 w-4 flex-shrink-0" />
              Duplicate order booking check is active. Matching records will be highlighted.
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Vehicle Records</span>
            {records.length > 0 && (
              <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-300 ring-1 ring-teal-500/30">
                {records.length} records
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-b border-white/10">
                {['S. No', 'AI NO', 'AO NO', 'Make', 'Model No', 'Engine No', 'Chassis No', 'Registration No', 'View'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <Database className="h-8 w-8 opacity-30" />
                      <span className="text-sm">No records loaded. Upload a file or use Search.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record, idx) => (
                  <tr
                    key={record.id}
                    className={`group transition-colors hover:bg-white/5 ${
                      showDuplicate && idx === 0 ? 'bg-pink-500/5 border-l-2 border-pink-500/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300 font-semibold whitespace-nowrap">{record.aiNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-teal-300 whitespace-nowrap">{record.aoNo}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{record.make}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{record.modelNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{record.engineNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{record.chassisNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-violet-400 whitespace-nowrap">{record.registrationNo}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 text-xs font-medium text-teal-400 hover:bg-teal-500/20 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {records.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {records.length} record{records.length !== 1 ? 's' : ''}</span>
            <span className="text-teal-500/60">AR Order Booking Invoice / Vehicle Information</span>
          </div>
        )}
      </div>
    </div>
  );
}
