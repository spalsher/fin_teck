'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Calendar, Search, X, ArrowLeft,
  Hash, User, ChevronRight, Tag, Eye, RefreshCw
} from 'lucide-react';

interface BillRow {
  id: string;
  sNo: number;
  invoiceNo: string;
  registrationNo: string;
  engineNo: string;
  doi: string;
  companyName: string;
  bookingNo: string;
  type: string;
  invoicePeriod: string;
  invoiceCategory: string;
  create: boolean;
}

const CUSTOMERS = [
  { id: 'C001', name: 'MOHAMMAD MOHTASHIM Engr# X852251' },
  { id: 'C002', name: 'MUHAMMAD SHAHZAD Engr# Z909080' },
  { id: 'C003', name: 'Pak Qatar General Takaful Limited' },
  { id: 'C004', name: 'UBL Insurers Limited' },
  { id: 'C005', name: 'Habib Insurance Co. Limited' },
];

const BOOKING_CATS = ['Yearly', 'Monthly', 'Quarterly', 'Half-Yearly'];
const ORDER_TYPES = ['Individual', 'Corporate', 'Fleet'];

const MOCK_FRESH_ROWS: BillRow[] = [
  { id: '1', sNo: 1, invoiceNo: 'AR-2026-001', registrationNo: 'TLZ-215', engineNo: '122233', doi: '02/01/2026', companyName: 'AKHTAR LOGISTICS SERVICES', bookingNo: '0163173', type: 'Yearly', invoicePeriod: 'Jan-Dec 2026', invoiceCategory: 'Standard', create: false },
  { id: '2', sNo: 2, invoiceNo: 'AR-2026-002', registrationNo: 'LEB-421', engineNo: '334455', doi: '05/01/2026', companyName: 'Pakistan Telecom Authority', bookingNo: '0163174', type: 'Monthly', invoicePeriod: 'Jan 2026', invoiceCategory: 'Basic', create: false },
  { id: '3', sNo: 3, invoiceNo: 'AR-2026-003', registrationNo: 'KHI-883', engineNo: '556677', doi: '10/01/2026', companyName: 'Habib Insurance Co.', bookingNo: '0163175', type: 'Yearly', invoicePeriod: 'Jan-Dec 2026', invoiceCategory: 'Premium', create: false },
];

const MOCK_RENEWAL_ROWS: BillRow[] = [
  { id: '4', sNo: 1, invoiceNo: 'AR-2025-089', registrationNo: 'MUL-112', engineNo: '778899', doi: '15/01/2025', companyName: 'UBL Insurers Limited', bookingNo: '0162901', type: 'Yearly', invoicePeriod: 'Jan-Dec 2025', invoiceCategory: 'Elevate', create: false },
];

type TabType = 'fresh' | 'renewal' | 'duplicate';

export default function CreateBillPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    fromNo: '',
    toNo: '',
    bookingCat: 'Yearly',
    orderType: 'Individual',
    creationDate: today,
    coId: '',
    coName: '',
  });

  const [activeTab, setActiveTab] = useState<TabType>('fresh');
  const [freshRows, setFreshRows] = useState<BillRow[]>(MOCK_FRESH_ROWS);
  const [renewalRows, setRenewalRows] = useState<BillRow[]>(MOCK_RENEWAL_ROWS);
  const [loading, setLoading] = useState(false);
  const [billCreated, setBillCreated] = useState(false);

  function handleCoChange(id: string) {
    const c = CUSTOMERS.find((x) => x.id === id);
    setForm((f) => ({ ...f, coId: id, coName: c?.name || '' }));
  }

  function toggleCreate(id: string) {
    if (activeTab === 'fresh') {
      setFreshRows((p) => p.map((r) => r.id === id ? { ...r, create: !r.create } : r));
    } else {
      setRenewalRows((p) => p.map((r) => r.id === id ? { ...r, create: !r.create } : r));
    }
  }

  function handlePreparedBill() {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }

  function handleCreateBill() {
    setLoading(true);
    setTimeout(() => { setBillCreated(true); setLoading(false); }, 800);
  }

  function handleClear() {
    setForm({ fromNo: '', toNo: '', bookingCat: 'Yearly', orderType: 'Individual', creationDate: today, coId: '', coName: '' });
    setBillCreated(false);
  }

  const currentRows = activeTab === 'fresh' ? freshRows : activeTab === 'renewal' ? renewalRows : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/30">
          <FileText className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AR Create Bill</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Transactions</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-violet-400">Create Bill</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">Bill Creation Parameters</span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {/* From No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> From No
              </label>
              <input type="text" value={form.fromNo} onChange={(e) => setForm({ ...form, fromNo: e.target.value })} placeholder="From Number"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all" />
            </div>

            {/* To No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> To No
              </label>
              <input type="text" value={form.toNo} onChange={(e) => setForm({ ...form, toNo: e.target.value })} placeholder="To Number"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all" />
            </div>

            {/* Booking Cat */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Booking Cat
              </label>
              <select value={form.bookingCat} onChange={(e) => setForm({ ...form, bookingCat: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none transition-all">
                {BOOKING_CATS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Order Type
              </label>
              <select value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none transition-all">
                {ORDER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Creation Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Creation Date
              </label>
              <input type="date" value={form.creationDate} onChange={(e) => setForm({ ...form, creationDate: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>

            {/* Co ID */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Co ID
              </label>
              <div className="flex gap-2">
                <input type="text" value={form.coId} onChange={(e) => handleCoChange(e.target.value)} placeholder="Co ID"
                  className="w-24 flex-shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-violet-500/60 focus:outline-none font-mono transition-all" />
                <input type="text" value={form.coName} readOnly placeholder="Company Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-violet-400 hover:border-violet-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
            <button type="button" onClick={handlePreparedBill} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-sm font-medium text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all shadow-lg shadow-violet-500/20">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FileText className="h-4 w-4" />}
              Prepared Bill
            </button>
            <button type="button" onClick={handleCreateBill} disabled={loading}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${billCreated ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'}`}>
              <FileText className="h-4 w-4" />
              {billCreated ? 'Bill Created!' : 'Create Bill'}
            </button>
            <button type="button" onClick={handleClear}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-5 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all">
              <RefreshCw className="h-4 w-4" /> Clear
            </button>
            <button type="button" onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-5 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all">
              <X className="h-4 w-4" /> Exit
            </button>
          </div>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
        {/* Tab Buttons */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <button type="button" onClick={() => setActiveTab('fresh')}
            className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${activeTab === 'fresh' ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 shadow-sm' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'}`}>
            Fresh
          </button>
          <button type="button" onClick={() => setActiveTab('renewal')}
            className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${activeTab === 'renewal' ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300 shadow-sm' : 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20'}`}>
            Renewal
          </button>
          <button type="button" onClick={() => setActiveTab('duplicate')}
            className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${activeTab === 'duplicate' ? 'bg-red-500/30 border border-red-500/50 text-red-300 shadow-sm' : 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20'}`}>
            Duplicate Order Booking
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10">
                {['S#', 'Invoice No', 'Registration No', 'Engine No', 'DOI', 'Company Name', 'Booking No', 'Type', 'Invoice Period', 'Invoice Category', 'Create?', 'View', 'View'].map((h) => (
                  <th key={h} className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-sm text-slate-600">
                    {activeTab === 'duplicate' ? 'No duplicate order bookings found.' : 'No records found. Adjust filters and click Prepared Bill.'}
                  </td>
                </tr>
              ) : (
                currentRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-slate-500 font-mono">{row.sNo}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-indigo-300 whitespace-nowrap">{row.invoiceNo}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-emerald-400 whitespace-nowrap">{row.registrationNo}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-300 whitespace-nowrap">{row.engineNo}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{row.doi}</td>
                    <td className="px-3 py-2.5 text-xs text-white max-w-[180px] truncate">{row.companyName}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-300 whitespace-nowrap">{row.bookingNo}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.type === 'Yearly' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-300 whitespace-nowrap">{row.invoicePeriod}</td>
                    <td className="px-3 py-2.5 text-xs text-violet-400 whitespace-nowrap">{row.invoiceCategory}</td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => toggleCreate(row.id)}
                        className={`h-5 w-5 rounded border transition-all ${row.create ? 'bg-violet-500 border-violet-400' : 'border-white/20 bg-white/5 hover:border-violet-500/40'}`}>
                        {row.create && <span className="flex items-center justify-center text-white text-xs">✓</span>}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                        <Eye className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                        <Eye className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {currentRows.length} record{currentRows.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">
            {activeTab === 'fresh' && <span className="text-emerald-400">Fresh Bills</span>}
            {activeTab === 'renewal' && <span className="text-amber-400">Renewal Bills</span>}
            {activeTab === 'duplicate' && <span className="text-red-400">Duplicate Order Bookings</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
