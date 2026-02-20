'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, User, Hash, MapPin, FileText, Banknote,
  Search, X, Save, CheckCircle2, AlertCircle, Trash2,
  RefreshCw, ChevronRight,
} from 'lucide-react';

interface Customer {
  id: string;
  custId: string;
  name: string;
  address: string;
  strNo: string;
  ntnNo: string;
  crDays: string;
  opBalance: string;
  code: string;
  combination: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', custId: '0000001', name: 'MOHAMMAD MOHTASHIM Engr# X852251', address: 'HOUSE NO G-35/4 BLOCK B NORTH NAZIMABAD KARACHI', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321001.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '2', custId: '0000002', name: 'MUHAMMAD SHAHZAD Engr# Z909080', address: 'CHAK NO 135/10R, TEHSIL JAHANIA DISTRICT KHANEWAL', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321002.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '3', custId: '0000003', name: 'Pak Qatar General Takaful Limited', address: 'Office No. 402-404, 4th Floor, Business Arcade, PECHS, Shahrah-e-Faisal, Karachi.', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321003.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '4', custId: '0000004', name: 'UBL Insurers Limited', address: '128-C, Jami Commercial, Street No.14, Phase-VII, DHA, Karachi.', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321004.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '5', custId: '0000005', name: 'Habib Insurance Co.Limited', address: '1st Floor, State Life Bldg. No. 6, Habib Square, M. A. Jinnah Road, P.O. Box 5217, Karachi-74000, Pakistan', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321005.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '6', custId: '0000006', name: 'Dubai Islamic Bank Limited', address: 'Hassan Chambers, DC-7, Block-7, Kehkashan Clifton, Karachi.', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321006.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '7', custId: '0000007', name: 'Carros (Pvt) Limited', address: '9th Floor, QM Building, Roomi Street Boat Basin, Karachi.', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321007.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '8', custId: '0000008', name: 'Salaam Takaful Limited', address: 'Karachi', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321008.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
  { id: '9', custId: '0000009', name: 'Al Burhan Goods Transport', address: '17h-G Block-7, Ground Floor P.E.C.H.S. Karachi, Pakistan.', strNo: '', ntnNo: '', crDays: '30', opBalance: '0.00', code: '1001.000.321009.0000', combination: 'Karachi.Common.Debtors-Control.Common' },
];

const EMPTY_FORM = {
  custId: '',
  name: '',
  address: '',
  strNo: '',
  ntnNo: '',
  crDays: '',
  opBalance: '',
  code: '1001.000.321001.0000',
  combination: 'Karachi.Common.Debtors-Control.Common',
};

export default function CustomerMasterPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.custId.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  function handleInsert() {
    setError(null);
    if (!form.name.trim()) return setError('Customer name is required.');
    setLoading(true);
    setTimeout(() => {
      if (editingId) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
        );
        setEditingId(null);
      } else {
        const nextId = String(customers.length + 1).padStart(7, '0');
        setCustomers((prev) => [
          ...prev,
          { id: Date.now().toString(), custId: nextId, ...form },
        ]);
      }
      setSaved(true);
      setLoading(false);
      setTimeout(() => {
        setSaved(false);
        setForm(EMPTY_FORM);
      }, 1200);
    }, 700);
  }

  function handleEdit(customer: Customer) {
    setForm({
      custId: customer.custId,
      name: customer.name,
      address: customer.address,
      strNo: customer.strNo,
      ntnNo: customer.ntnNo,
      crDays: customer.crDays,
      opBalance: customer.opBalance,
      code: customer.code,
      combination: customer.combination,
    });
    setEditingId(customer.id);
    setError(null);
    setSaved(false);
  }

  function handleDelete(id: string) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setSaved(false);
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <User className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Customer Master</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Receivable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Master Files</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-emerald-400">Customer Master</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-600/30 via-teal-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">
            {editingId ? 'Edit Customer' : 'New Customer'}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {/* Customer ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Customer ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.custId}
                  onChange={(e) => setForm({ ...form, custId: e.target.value })}
                  placeholder="Cus ID"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>

            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <User className="h-3 w-3" /> Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Customer Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* Address */}
            <div className="col-span-2 md:col-span-3 lg:col-span-4 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <MapPin className="h-3 w-3" /> Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Customer Address"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* STR No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3 w-3" /> STR No
              </label>
              <input
                type="text"
                value={form.strNo}
                onChange={(e) => setForm({ ...form, strNo: e.target.value })}
                placeholder="Sales Tax Registration No"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* NTN No */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> NTN No
              </label>
              <input
                type="text"
                value={form.ntnNo}
                onChange={(e) => setForm({ ...form, ntnNo: e.target.value })}
                placeholder="NTN No"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* CR Days */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> CR Days
              </label>
              <input
                type="number"
                min="0"
                value={form.crDays}
                onChange={(e) => setForm({ ...form, crDays: e.target.value })}
                placeholder="CR Days"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* OP Balance */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Banknote className="h-3 w-3" /> OP Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={form.opBalance}
                onChange={(e) => setForm({ ...form, opBalance: e.target.value })}
                placeholder="Opening Balance"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-emerald-400 font-mono text-right placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* Code */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Account Code"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-indigo-300 font-mono placeholder-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Combination */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3 w-3" /> Combination
              </label>
              <input
                type="text"
                value={form.combination}
                readOnly
                placeholder="Combination"
                className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none cursor-default"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleInsert}
              disabled={loading || saved}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-medium text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
            >
              {saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved!</>
              ) : loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Insert</>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-5 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-5 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
            >
              <X className="h-4 w-4" /> Exit
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Customer List</span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">
              {customers.length} records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-56 rounded-lg border border-white/10 bg-slate-800/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-b border-white/10">
                {['Cust ID', 'Customer Name', 'Customer Address', 'STR No', 'NTN No', 'CR Days', 'OP Balance', 'Code', ''].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === 'OP Balance' ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-600">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleEdit(customer)}
                    className={`group cursor-pointer transition-colors ${
                      editingId === customer.id
                        ? 'bg-emerald-600/10 border-l-2 border-emerald-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300 font-semibold whitespace-nowrap">{customer.custId}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium max-w-xs truncate">{customer.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-sm truncate">{customer.address || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{customer.strNo || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{customer.ntnNo || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap">{customer.crDays || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400 whitespace-nowrap">
                      {parseFloat(customer.opBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-violet-400 whitespace-nowrap">{customer.code}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 text-slate-600 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {customers.length} entries</span>
          <span>Click a row to edit</span>
        </div>
      </div>
    </div>
  );
}
