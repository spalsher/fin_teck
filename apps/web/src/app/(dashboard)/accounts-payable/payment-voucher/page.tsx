'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Calendar, Upload, Eye, Plus, Trash2,
  Search, X, ArrowLeft, Hash, Building2,
  CheckCircle2, AlertCircle, StickyNote, DollarSign,
  Save, ToggleLeft, FileText
} from 'lucide-react';

interface TaxLine {
  id: string;
  description: string;
  amount: number | string;
  taxList: string;
}

interface PendingInvoice {
  id: string;
  invoiceNo: string;
  voucherDate: string;
  supplierRef: string;
  originalAmount: number;
  pendingAmount: number;
  toAdjust: number | string;
}

const emptyTaxLine = (): TaxLine => ({
  id: Date.now().toString() + Math.random(),
  description: '',
  amount: '',
  taxList: '',
});

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
  { id: 'S004', name: 'Concrete Plus' },
  { id: 'S005', name: 'Doodling Studio (Architecture)' },
];

const BANKS = [
  { id: 'B001', name: 'HBL - Main Account' },
  { id: 'B002', name: 'UBL - Operations' },
  { id: 'B003', name: 'MCB - Current' },
];

const MOCK_PENDING: PendingInvoice[] = [
  { id: '1', invoiceNo: 'PI-2026-001', voucherDate: '2026-02-05', supplierRef: 'SUP-REF-001', originalAmount: 150000, pendingAmount: 150000, toAdjust: '' },
  { id: '2', invoiceNo: 'PI-2026-002', voucherDate: '2026-02-10', supplierRef: 'SUP-REF-002', originalAmount: 85000, pendingAmount: 85000, toAdjust: '' },
  { id: '3', invoiceNo: 'PI-2026-003', voucherDate: '2026-02-15', supplierRef: 'SUP-REF-003', originalAmount: 200000, pendingAmount: 120000, toAdjust: '' },
];

export default function PaymentVoucherPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    paymentNo: '',
    date: today,
    chequeNo: '',
    description: '',
    supplierId: '',
    supplierName: '',
    bankId: '',
    bankName: '',
    paymentAmount: '',
    isPosted: false,
  });

  const [taxLines, setTaxLines] = useState<TaxLine[]>([]);
  const [pending, setPending] = useState<PendingInvoice[]>(MOCK_PENDING);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);

  const totalTax = taxLines.reduce((s, l) => s + (parseFloat(String(l.amount)) || 0), 0);
  const netPayable = (parseFloat(String(form.paymentAmount)) || 0) + totalTax;

  function handleSupplierChange(id: string) {
    const s = SUPPLIERS.find((x) => x.id === id);
    setForm((f) => ({ ...f, supplierId: id, supplierName: s?.name || '' }));
    setShowPending(!!id);
  }

  function handleBankChange(id: string) {
    const b = BANKS.find((x) => x.id === id);
    setForm((f) => ({ ...f, bankId: id, bankName: b?.name || '' }));
  }

  function updateToAdjust(id: string, val: string) {
    setPending((p) => p.map((i) => i.id === id ? { ...i, toAdjust: val } : i));
  }

  function handleInsert() {
    setError(null);
    if (!form.supplierId) return setError('Please select a supplier.');
    if (!form.paymentAmount || parseFloat(String(form.paymentAmount)) <= 0) return setError('Payment amount is required.');
    setLoading(true);
    setTimeout(() => { setSaved(true); setLoading(false); setTimeout(() => router.back(), 1200); }, 800);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 ring-1 ring-cyan-500/30">
          <CreditCard className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Payment Voucher</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Transactions › Payment Voucher</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">New Supplier Payment</span>
          </div>
          <button type="button" onClick={() => setForm((f) => ({ ...f, isPosted: !f.isPosted }))}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${form.isPosted ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-slate-700/60 border border-white/10 text-slate-400'}`}>
            <ToggleLeft className="h-3.5 w-3.5" />
            {form.isPosted ? 'POSTED' : 'UN-POSTED'}
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Payment No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> Payment No</label>
              <input type="text" value={form.paymentNo} onChange={(e) => setForm({ ...form, paymentNo: e.target.value })} placeholder="P.V. No"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all" />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Calendar className="h-3 w-3" /> Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all [color-scheme:dark]" />
            </div>

            {/* Cheque No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Hash className="h-3 w-3" /> Cheque No</label>
              <input type="text" value={form.chequeNo} onChange={(e) => setForm({ ...form, chequeNo: e.target.value })} placeholder="Cheque No"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><StickyNote className="h-3 w-3" /> Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all" />
            </div>

            {/* Supplier */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><FileText className="h-3 w-3" /> Supplier</label>
              <div className="flex gap-2">
                <select value={form.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-36 flex-shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-cyan-500/60 focus:outline-none transition-all">
                  <option value="">ID</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={form.supplierName} readOnly placeholder="Supplier Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bank Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Building2 className="h-3 w-3" /> Bank Name</label>
              <div className="flex gap-2">
                <select value={form.bankId} onChange={(e) => handleBankChange(e.target.value)}
                  className="w-36 flex-shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-cyan-500/60 focus:outline-none transition-all">
                  <option value="">Bank ID</option>
                  {BANKS.map((b) => <option key={b.id} value={b.id}>{b.id}</option>)}
                </select>
                <input type="text" value={form.bankName} readOnly placeholder="Bank Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><DollarSign className="h-3 w-3" /> Payment Amt</label>
              <input type="number" step="0.01" min="0" value={form.paymentAmount} onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })} placeholder="0"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cyan-400 font-mono text-right placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all" />
            </div>

            {/* Upload PDF */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider"><Upload className="h-3 w-3" /> Upload PDF</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                  <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{fileName || 'Choose File...'}</span>
                </button>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                {fileName && (
                  <button type="button" className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 text-xs text-cyan-400 hover:bg-cyan-500/20 transition-all">
                    <Eye className="h-3.5 w-3.5" /> View Document
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
            <button type="button" onClick={handleInsert} disabled={loading || saved}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-sm font-medium text-white hover:from-cyan-500 hover:to-teal-500 disabled:opacity-60 transition-all shadow-lg shadow-cyan-500/20">
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><Save className="h-4 w-4" /> Insert</>}
            </button>
            <button type="button" onClick={() => setShowPending(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all">
              <Search className="h-4 w-4" /> Search
            </button>
            <button type="button" onClick={() => { setForm({ paymentNo: '', date: today, chequeNo: '', description: '', supplierId: '', supplierName: '', bankId: '', bankName: '', paymentAmount: '', isPosted: false }); setTaxLines([]); setError(null); setShowPending(false); }}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="button" onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all">
              <X className="h-4 w-4" /> Exit
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>
      </div>

      {/* Tax / Other Details */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Tax / Other Details</span>
          <button type="button" onClick={() => setTaxLines((p) => [...p, emptyTaxLine()])}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/30 transition-all">
            <Plus className="h-3.5 w-3.5" /> Add New Tax
          </button>
        </div>
        <div className="p-4">
          {taxLines.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-600">No tax entries. Click &ldquo;Add New Tax&rdquo; to add.</div>
          ) : (
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-white/10">
                  {['ID', 'Description', 'Amount', 'Tax List', ''].map((h) => (
                    <th key={h} className={`px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {taxLines.map((tl, idx) => (
                  <tr key={tl.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 text-xs text-slate-500 font-mono w-10">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <input type="text" value={tl.description} onChange={(e) => setTaxLines((p) => p.map((x) => x.id === tl.id ? { ...x, description: e.target.value } : x))} placeholder="Tax description"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-32">
                      <input type="number" step="0.01" value={tl.amount} onChange={(e) => setTaxLines((p) => p.map((x) => x.id === tl.id ? { ...x, amount: e.target.value } : x))} placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:border-amber-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-32">
                      <input type="text" value={tl.taxList} onChange={(e) => setTaxLines((p) => p.map((x) => x.id === tl.id ? { ...x, taxList: e.target.value } : x))} placeholder="Tax list"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-8">
                      <button type="button" onClick={() => setTaxLines((p) => p.filter((x) => x.id !== tl.id))}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-600 hover:bg-red-500/20 hover:text-red-400 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex items-center justify-end gap-6 pt-3 border-t border-white/10">
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Total Tax Amount</p>
              <p className="font-mono text-sm font-bold text-amber-400">{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">NET Amount Pay</p>
              <p className="font-mono text-sm font-bold text-cyan-400">{netPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invoice Details */}
      {showPending && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Pending Invoice Details</span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30">
              {pending.length} pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Invoice No', 'Voucher Date', 'Supplier Ref', 'Invoice Amount (Original)', 'Invoice Amount (Pending)', 'To Be Adjust'].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Invoice Amount (Original)', 'Invoice Amount (Pending)', 'To Be Adjust'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pending.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-indigo-300">{inv.invoiceNo}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{inv.voucherDate}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-300">{inv.supplierRef}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-300">{inv.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-amber-400">{inv.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 w-36">
                      <input type="number" step="0.01" min="0" max={inv.pendingAmount} value={inv.toAdjust} onChange={(e) => updateToAdjust(inv.id, e.target.value)} placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-emerald-400 text-right placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={4} className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Total Adjusted</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400">
                    {pending.reduce((s, i) => s + i.pendingAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-emerald-400">
                    {pending.reduce((s, i) => s + (parseFloat(String(i.toAdjust)) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
