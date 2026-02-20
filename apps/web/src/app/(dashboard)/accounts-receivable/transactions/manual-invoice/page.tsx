'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Calendar, Plus, Trash2, Save,
  Search, X, ArrowLeft, Hash, Car,
  CheckCircle2, AlertCircle, User, ChevronRight, Package, Tag
} from 'lucide-react';

interface InvoiceLine {
  id: string;
  elementId: string;
  elementDescription: string;
  taxDescription: string;
  amount: number | string;
  taxPercent: number | string;
  taxAmount: number | string;
  total: number | string;
  elementList: string;
}

const emptyLine = (): InvoiceLine => ({
  id: Date.now().toString() + Math.random(),
  elementId: '',
  elementDescription: '',
  taxDescription: '',
  amount: '',
  taxPercent: '',
  taxAmount: '',
  total: '',
  elementList: '',
});

const CUSTOMERS = [
  { id: 'C001', name: 'MOHAMMAD MOHTASHIM Engr# X852251' },
  { id: 'C002', name: 'MUHAMMAD SHAHZAD Engr# Z909080' },
  { id: 'C003', name: 'Pak Qatar General Takaful Limited' },
  { id: 'C004', name: 'UBL Insurers Limited' },
  { id: 'C005', name: 'Habib Insurance Co. Limited' },
  { id: 'C006', name: 'Dubai Islamic Bank Limited' },
];

const PACKAGES = ['Elevate', 'Basic', 'Standard', 'Premium', 'Enterprise'];
const BOOKING_CATS = ['Yearly', 'Monthly', 'Quarterly', 'Half-Yearly'];

export default function ManualInvoicePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    invoiceNo: '',
    invoiceDate: today,
    package: 'Elevate',
    bookingCat: 'Yearly',
    customerId: '',
    customerName: '',
    vehOrdNo: '',
    status: 'Un-Post',
    isManual: true,
  });

  const [vehicle, setVehicle] = useState<{
    vehId: string; make: string; model: string; engineNo: string; chassisNo: string; regNo: string;
    customerName: string; doi: string; address: string;
    inv01: string; inv02: string; inv03: string; inv04: string; inv05: string; inv06: string;
    inv07: string; inv08: string; inv09: string; inv10: string; inv11: string; inv12: string;
  } | null>(null);

  const [lines, setLines] = useState<InvoiceLine[]>([emptyLine(), emptyLine()]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCustomerChange(id: string) {
    const c = CUSTOMERS.find((x) => x.id === id);
    setForm((f) => ({ ...f, customerId: id, customerName: c?.name || '' }));
  }

  function handleSearchVehicle() {
    if (!form.vehOrdNo) return setError('Enter a vehicle order number to search.');
    setError(null);
    setVehicle({
      vehId: '368160', make: 'PK 222', model: 'TRUCK', engineNo: '122233', chassisNo: '05004-F', regNo: 'TLZ-215',
      customerName: 'AKHTAR LOGISTICS SERVICES', doi: '02.01.2026',
      address: '13KM BAHAWALPUR ROAD, NEAR ALLIED BANK WAREHOUSE MUNEERABAD, MULTAN',
      inv01: '398268', inv02: '0', inv03: '0', inv04: '0', inv05: '0', inv06: '0',
      inv07: '0', inv08: '0', inv09: '0', inv10: '0', inv11: '0', inv12: '0',
    });
  }

  function addLine() { setLines((p) => [...p, emptyLine()]); }
  function removeLine(id: string) { if (lines.length > 1) setLines((p) => p.filter((l) => l.id !== id)); }
  function updateLine(id: string, field: keyof InvoiceLine, value: string) {
    setLines((p) => p.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      const amt = parseFloat(String(field === 'amount' ? value : updated.amount)) || 0;
      const pct = parseFloat(String(field === 'taxPercent' ? value : updated.taxPercent)) || 0;
      const taxAmt = (amt * pct) / 100;
      updated.taxAmount = taxAmt ? taxAmt.toFixed(2) : updated.taxAmount;
      updated.total = (amt + (parseFloat(String(updated.taxAmount)) || 0)).toFixed(2);
      return updated;
    }));
  }

  function handleInsert() {
    setError(null);
    if (!form.customerId) return setError('Please select a company / customer.');
    setLoading(true);
    setTimeout(() => { setSaved(true); setLoading(false); setTimeout(() => router.back(), 1200); }, 800);
  }

  const totalAmount = lines.reduce((s, l) => s + (parseFloat(String(l.amount)) || 0), 0);
  const totalTax = lines.reduce((s, l) => s + (parseFloat(String(l.taxAmount)) || 0), 0);
  const totalNet = lines.reduce((s, l) => s + (parseFloat(String(l.total)) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Manual Invoice</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Transactions</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-400">Manual Invoice</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">New Manual Invoice</span>
          </div>
          <button type="button" onClick={() => setForm((f) => ({ ...f, status: f.status === 'Posted' ? 'Un-Post' : 'Posted' }))}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${form.status === 'Posted' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-slate-700/60 border border-white/10 text-slate-400'}`}>
            {form.status}
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Invoice No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Invoice No
              </label>
              <input type="text" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} placeholder="Invoice No"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all" />
            </div>

            {/* Invoice Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Invoice Date
              </label>
              <input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-blue-500/60 focus:outline-none transition-all [color-scheme:dark]" />
            </div>

            {/* Package */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Package className="h-3 w-3" /> Package
              </label>
              <select value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500/60 focus:outline-none transition-all">
                {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Booking Cat */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Tag className="h-3 w-3" /> Booking Cat
              </label>
              <select value={form.bookingCat} onChange={(e) => setForm({ ...form, bookingCat: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500/60 focus:outline-none transition-all">
                {BOOKING_CATS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Company */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Company
              </label>
              <div className="flex gap-2">
                <select value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-28 flex-shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none transition-all">
                  <option value="">ID</option>
                  {CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
                <input type="text" value={form.customerName} readOnly placeholder="Company Name"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none" />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-blue-400 hover:border-blue-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, isManual: true }))}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${form.isManual ? 'bg-blue-600/30 border border-blue-500/40 text-blue-300' : 'bg-slate-700/60 border border-white/10 text-slate-400 hover:text-white'}`}>
                  MANUAL
                </button>
              </div>
            </div>

            {/* Veh Ord No / Search Vehicle */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Car className="h-3 w-3" /> Veh Ord No
              </label>
              <div className="flex gap-2">
                <input type="text" value={form.vehOrdNo} onChange={(e) => setForm({ ...form, vehOrdNo: e.target.value })} placeholder="Invoice O..."
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none font-mono transition-all" />
                <button type="button" onClick={handleSearchVehicle}
                  className="flex items-center gap-2 rounded-lg bg-blue-600/20 border border-blue-500/30 px-4 py-2 text-xs font-medium text-blue-400 hover:bg-blue-600/30 transition-all whitespace-nowrap">
                  <Search className="h-3.5 w-3.5" /> Search Vehicle
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10">
            <button type="button" onClick={addLine}
              className="flex items-center gap-2 rounded-lg bg-slate-700/60 border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600/60 transition-all">
              <Plus className="h-4 w-4" /> Add Row
            </button>
            <button type="button" onClick={handleInsert} disabled={loading || saved}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 transition-all shadow-lg shadow-blue-500/20">
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><Save className="h-4 w-4" /> Insert</>}
            </button>
            <button type="button"
              className="flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all">
              <Search className="h-4 w-4" /> Search
            </button>
            <button type="button" onClick={() => { setLines([emptyLine(), emptyLine()]); setForm({ invoiceNo: '', invoiceDate: today, package: 'Elevate', bookingCat: 'Yearly', customerId: '', customerName: '', vehOrdNo: '', status: 'Un-Post', isManual: true }); setVehicle(null); setError(null); }}
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

          {/* Vehicle Information */}
          {vehicle && (
            <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-blue-500/20">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Vehicle Information</span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {[
                  { label: 'Veh ID', value: vehicle.vehId, color: 'text-indigo-300 font-mono' },
                  { label: 'Make', value: vehicle.make, color: 'text-slate-200' },
                  { label: 'Model', value: vehicle.model, color: 'text-slate-200' },
                  { label: 'Engine No', value: vehicle.engineNo, color: 'text-slate-300 font-mono' },
                  { label: 'Chassis No', value: vehicle.chassisNo, color: 'text-slate-300 font-mono' },
                  { label: 'Reg No', value: vehicle.regNo, color: 'text-emerald-400 font-mono font-semibold' },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-slate-500 mb-0.5">{f.label}</p>
                    <p className={f.color}>{f.value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-slate-500 mb-0.5">Customer Name</p>
                  <p className="text-slate-200">{vehicle.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">DOI</p>
                  <p className="text-slate-300">{vehicle.doi}</p>
                </div>
                <div className="col-span-3 lg:col-span-3">
                  <p className="text-slate-500 mb-0.5">Address</p>
                  <p className="text-slate-300">{vehicle.address}</p>
                </div>
              </div>
              {/* Invoice Info */}
              <div className="px-4 pb-2 border-t border-blue-500/10">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider pt-2 pb-1">Invoice Information</p>
                <div className="grid grid-cols-12 gap-1 text-xs">
                  {['Inv-01','Inv-02','Inv-03','Inv-04','Inv-05','Inv-06','Inv-07','Inv-08','Inv-09','Inv-10','Inv-11','Inv-12'].map((label, i) => (
                    <div key={label}>
                      <p className="text-slate-500 text-center">{label}</p>
                      <p className="text-slate-300 text-center font-mono">{[vehicle.inv01,vehicle.inv02,vehicle.inv03,vehicle.inv04,vehicle.inv05,vehicle.inv06,vehicle.inv07,vehicle.inv08,vehicle.inv09,vehicle.inv10,vehicle.inv11,vehicle.inv12][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lines Table */}
          <div className="rounded-xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800/80 to-slate-700/50">
                    {['S.No', 'Element ID Description', 'Tax Description', 'Amount', 'Tax %', 'Tax Amount', 'Total', 'Element List', ''].map((h, i) => (
                      <th key={i} className={`px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${['Amount', 'Tax %', 'Tax Amount', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="group bg-white/2 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500 font-mono text-xs w-8">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.elementDescription} onChange={(e) => updateLine(line.id, 'elementDescription', e.target.value)} placeholder="Element ID / Description..."
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={line.taxDescription} onChange={(e) => updateLine(line.id, 'taxDescription', e.target.value)} placeholder="Tax description..."
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="number" step="0.01" min="0" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', e.target.value)} placeholder="0.00"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-blue-400 text-right placeholder-slate-600 focus:border-blue-500/60 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-20">
                        <input type="number" step="0.01" min="0" max="100" value={line.taxPercent} onChange={(e) => updateLine(line.id, 'taxPercent', e.target.value)} placeholder="0"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:outline-none transition-all" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="number" step="0.01" value={line.taxAmount} readOnly placeholder="0.00"
                          className="w-full rounded-md border border-white/10 bg-slate-800/40 px-2 py-1.5 text-xs text-amber-400 text-right placeholder-slate-600 focus:outline-none cursor-default" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="number" step="0.01" value={line.total} readOnly placeholder="0.00"
                          className="w-full rounded-md border border-white/10 bg-slate-800/40 px-2 py-1.5 text-xs text-emerald-400 text-right placeholder-slate-600 focus:outline-none cursor-default" />
                      </td>
                      <td className="px-2 py-2 w-28">
                        <input type="text" value={line.elementList} onChange={(e) => updateLine(line.id, 'elementList', e.target.value)} placeholder="List"
                          className="w-full rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-xs text-violet-400 placeholder-slate-600 focus:outline-none transition-all" />
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
                    <td colSpan={3} className="px-3 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Totals</td>
                    <td className="px-2 py-3 text-right font-mono text-sm font-bold text-blue-400">
                      {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td />
                    <td className="px-2 py-3 text-right font-mono text-sm font-bold text-amber-400">
                      {totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-sm font-bold text-emerald-400">
                      {totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
