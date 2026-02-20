'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Calendar, Upload, Eye, Plus, Trash2, Save,
  Search, X, ArrowLeft, Hash, User, FileCheck,
  CheckCircle2, AlertCircle, StickyNote, Tag, ToggleLeft
} from 'lucide-react';

interface InvoiceLine {
  id: string;
  acId: string;
  accountCode: string;
  accountDescription: string;
  description: string;
  amount: number | string;
  taxId: string;
  taxAmount: number | string;
  acType: string;
}

const emptyLine = (): InvoiceLine => ({
  id: Date.now().toString() + Math.random(),
  acId: '',
  accountCode: '',
  accountDescription: '',
  description: '',
  amount: '',
  taxId: '',
  taxAmount: '',
  acType: '',
});

const SUPPLIERS = [
  { id: 'S001', name: 'Khatri Computer' },
  { id: 'S002', name: 'Pakistan Telecommunication Authority' },
  { id: 'S003', name: 'ARI INFORMATICS' },
  { id: 'S004', name: 'Concrete Plus' },
  { id: 'S005', name: 'Doodling Studio (Architecture)' },
];

export default function EnterInvoicePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    invoiceNo: '',
    invoiceDate: today,
    payTo: '',
    supplierRef: '',
    supplierId: '',
    supplierName: '',
    remarks: '',
    isPosted: false,
  });

  const [lines, setLines] = useState<InvoiceLine[]>([emptyLine(), emptyLine()]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = lines.reduce((s, l) => s + (parseFloat(String(l.amount)) || 0), 0);
  const totalTax = lines.reduce((s, l) => s + (parseFloat(String(l.taxAmount)) || 0), 0);
  const netAmount = totalAmount + totalTax;

  function addLine() {
    setLines((p) => [...p, emptyLine()]);
  }

  function removeLine(id: string) {
    if (lines.length > 1) setLines((p) => p.filter((l) => l.id !== id));
  }

  function updateLine(id: string, field: keyof InvoiceLine, value: string) {
    setLines((p) => p.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  function handleSupplierChange(id: string) {
    const sup = SUPPLIERS.find((s) => s.id === id);
    setForm((f) => ({ ...f, supplierId: id, supplierName: sup?.name || '' }));
  }

  function handleInsert() {
    setError(null);
    if (!form.supplierId) return setError('Please select a supplier.');
    if (!form.invoiceDate) return setError('Invoice date is required.');
    if (totalAmount <= 0) return setError('At least one line item with amount is required.');
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 ring-1 ring-orange-500/30">
          <FileText className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Purchase Invoice</h1>
          <p className="text-xs text-slate-400 mt-0.5">Accounts Payable › Transactions › Enter Invoice</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">New Purchase Invoice</span>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isPosted: !f.isPosted }))}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              form.isPosted
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-slate-700/60 border border-white/10 text-slate-400'
            }`}
          >
            <ToggleLeft className="h-3.5 w-3.5" />
            {form.isPosted ? 'POSTED' : 'UN-POSTED'}
          </button>
        </div>

        <div className="p-6">
          {/* Form Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Invoice No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Invoice No
              </label>
              <input type="text" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                placeholder="Auto-generated"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all" />
            </div>

            {/* Invoice Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Invoice Date
              </label>
              <input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all [color-scheme:dark]" />
            </div>

            {/* Pay To */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Pay To
              </label>
              <input type="text" value={form.payTo} onChange={(e) => setForm({ ...form, payTo: e.target.value })}
                placeholder="Payee name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all" />
            </div>

            {/* Supplier REF */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileCheck className="h-3 w-3" /> Supplier REF
              </label>
              <input type="text" value={form.supplierRef} onChange={(e) => setForm({ ...form, supplierRef: e.target.value })}
                placeholder="Supplier reference"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all" />
            </div>

            {/* Supplier */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Supplier
              </label>
              <div className="flex gap-2">
                <select value={form.supplierId} onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-36 flex-shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-orange-500/60 focus:outline-none transition-all">
                  <option value="">ID</option>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
                <input type="text" value={form.supplierName} readOnly placeholder="Supplier Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-orange-400 hover:border-orange-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Remarks */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <StickyNote className="h-3 w-3" /> Remarks
              </label>
              <input type="text" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Additional remarks..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all" />
            </div>

            {/* Upload PDF */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Upload className="h-3 w-3" /> Upload PDF
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                  <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{fileName || 'Choose File...'}</span>
                </button>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                {fileName && (
                  <button type="button" onClick={() => {}}
                    className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2.5 text-xs text-orange-400 hover:bg-orange-500/20 transition-all">
                    <Eye className="h-3.5 w-3.5" /> View Document
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10">
            <button type="button" onClick={addLine}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600/60 hover:text-white transition-all">
              <Plus className="h-4 w-4" /> Add Row
            </button>
            <button type="button" onClick={handleInsert} disabled={loading || saved}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-sm font-medium text-white hover:from-orange-500 hover:to-amber-500 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/20">
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> :
                loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> :
                  <><Save className="h-4 w-4" /> Insert</>}
            </button>
            <button type="button" onClick={() => router.push('/accounts-payable/invoices')}
              className="flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all">
              <Search className="h-4 w-4" /> Search
            </button>
            <button type="button" onClick={() => { setLines([emptyLine(), emptyLine()]); setForm({ invoiceNo: '', invoiceDate: today, payTo: '', supplierRef: '', supplierId: '', supplierName: '', remarks: '', isPosted: false }); setError(null); }}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="button" onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all">
              <X className="h-4 w-4" /> Exit
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Lines Table */}
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800/80 to-slate-700/50">
                  {['#', 'AC ID', 'Account Code', 'Account Description', 'Description', 'Amount', 'Tax ID', 'Tax Amt', 'A/C', ''].map((h, i) => (
                    <th key={i} className={`px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${['Amount', 'Tax Amt'].includes(h) ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lines.map((line, idx) => (
                  <tr key={line.id} className="group bg-white/2 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 text-slate-500 font-mono text-xs w-10">{idx + 1}</td>
                    <td className="px-2 py-2 w-24">
                      <input type="text" value={line.acId} onChange={(e) => updateLine(line.id, 'acId', e.target.value)} placeholder="AC ID"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-28">
                      <input type="text" value={line.accountCode} onChange={(e) => updateLine(line.id, 'accountCode', e.target.value)} placeholder="Code"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-indigo-300 placeholder-slate-600 focus:border-orange-500/60 focus:outline-none transition-all font-mono" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={line.accountDescription} onChange={(e) => updateLine(line.id, 'accountDescription', e.target.value)} placeholder="Account description..."
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:border-orange-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} placeholder="Line description..."
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-28">
                      <input type="number" step="0.01" min="0" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', e.target.value)} placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-emerald-400 text-right placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-20">
                      <input type="text" value={line.taxId} onChange={(e) => updateLine(line.id, 'taxId', e.target.value)} placeholder="Tax ID"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-orange-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-24">
                      <input type="number" step="0.01" min="0" value={line.taxAmount} onChange={(e) => updateLine(line.id, 'taxAmount', e.target.value)} placeholder="0.00"
                        className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:border-amber-500/60 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 w-20">
                      <select value={line.acType} onChange={(e) => updateLine(line.id, 'acType', e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-slate-800 px-1.5 py-1.5 text-xs text-violet-400 focus:border-violet-500/60 focus:outline-none transition-all">
                        <option value="">—</option>
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 w-8">
                      <button type="button" onClick={() => removeLine(line.id)} disabled={lines.length <= 1}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-0 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700/70 border-t border-white/10">
                  <td colSpan={5} className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Totals</td>
                  <td className="px-2 py-3 text-right font-mono text-sm font-bold text-emerald-400">
                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-3" />
                  <td className="px-2 py-3 text-right font-mono text-sm font-bold text-amber-400">
                    {totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-slate-400">Net:</span>
                      <span className="font-mono text-sm font-bold text-white">{netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>{lines.length} line{lines.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-4">
              <span>Total Amount: <span className="text-emerald-400 font-mono font-medium">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
              <span>Tax: <span className="text-amber-400 font-mono font-medium">{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
              <span className="text-white font-semibold">Net Payable: <span className="text-orange-400 font-mono">{netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
