'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, Hash, MapPin, FileText, Banknote,
  Search, X, Save, CheckCircle2, AlertCircle, Trash2,
  RefreshCw, ChevronRight,
} from 'lucide-react';

interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  address: string;
  strNo: string;
  ntnNo: string;
  opBalance: string;
  crDays: string;
  code: string;
  combination: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', supplierId: '000001', name: 'Khatri Computer', address: 'Karachi', strNo: '', ntnNo: '', opBalance: '0.00', crDays: '30', code: '1001.000.221001.0000', combination: 'Karachi.Common.Creditors.Common' },
  { id: '2', supplierId: '000002', name: 'Pakistan Telecommunication Authority', address: 'Islamabad', strNo: '', ntnNo: '', opBalance: '0.00', crDays: '30', code: '1001.000.221002.0000', combination: 'Karachi.Common.Creditors.Common' },
  { id: '3', supplierId: '000003', name: 'ARI INFORMATICS', address: 'Karachi', strNo: '', ntnNo: '', opBalance: '0.00', crDays: '30', code: '1001.000.221003.0000', combination: 'Karachi.Common.Creditors.Common' },
  { id: '4', supplierId: '000004', name: 'Concrete Plus', address: 'Lahore', strNo: '', ntnNo: '', opBalance: '0.00', crDays: '45', code: '1001.000.221004.0000', combination: 'Karachi.Common.Creditors.Common' },
  { id: '5', supplierId: '000005', name: 'Doodling Studio (Architecture)', address: 'Karachi', strNo: '', ntnNo: '', opBalance: '0.00', crDays: '30', code: '1001.000.221005.0000', combination: 'Karachi.Common.Creditors.Common' },
];

const EMPTY_FORM = {
  supplierId: '',
  name: '',
  address: '',
  strNo: '',
  ntnNo: '',
  opBalance: '',
  crDays: '',
  code: '1001.000.221001.0000',
  combination: 'Karachi.Common.Creditors.Common',
};

export default function SupplierMasterPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = suppliers.filter(
    (s) =>
      s.supplierId.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleInsert() {
    setError(null);
    if (!form.name.trim()) return setError('Supplier name is required.');
    setLoading(true);
    setTimeout(() => {
      if (editingId) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
        );
        setEditingId(null);
      } else {
        const nextId = String(suppliers.length + 1).padStart(6, '0');
        setSuppliers((prev) => [
          ...prev,
          { id: Date.now().toString(), supplierId: nextId, ...form },
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

  function handleEdit(supplier: Supplier) {
    setForm({
      supplierId: supplier.supplierId,
      name: supplier.name,
      address: supplier.address,
      strNo: supplier.strNo,
      ntnNo: supplier.ntnNo,
      opBalance: supplier.opBalance,
      crDays: supplier.crDays,
      code: supplier.code,
      combination: supplier.combination,
    });
    setEditingId(supplier.id);
    setError(null);
    setSaved(false);
  }

  function handleDelete(id: string) {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
          <Users className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Supplier Master</h1>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <span>Accounts Payable</span>
            <ChevronRight className="h-3 w-3" />
            <span>Master Files</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-400">Supplier Master</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">
            {editingId ? 'Edit Supplier' : 'New Supplier'}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {/* Supplier ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Hash className="h-3 w-3" /> Supplier ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  placeholder="Supplier ID"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-blue-400 hover:border-blue-500/40 transition-all">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Users className="h-3 w-3" /> Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Supplier Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>

            {/* Address */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <MapPin className="h-3 w-3" /> Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Supplier Address"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
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
                placeholder="Sales Tax Registration"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>

            {/* Op Balance */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <Banknote className="h-3 w-3" /> Op Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={form.opBalance}
                onChange={(e) => setForm({ ...form, opBalance: e.target.value })}
                placeholder="Opening Balance"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-emerald-400 font-mono text-right placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
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
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-indigo-300 font-mono placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-blue-400 hover:border-blue-500/40 transition-all">
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
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/20"
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

      {/* Suppliers Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Supplier List</span>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-blue-500/30">
              {suppliers.length} records
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
                className="w-48 rounded-lg border border-white/10 bg-slate-800/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none transition-all"
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
                {['Supplier ID', 'Supplier Name', 'Address', 'STR No', 'NTN No', 'Op Balance', 'CR Days', 'Code', ''].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === 'Op Balance' ? 'text-right' : 'text-left'}`}
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
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filtered.map((supplier) => (
                  <tr
                    key={supplier.id}
                    onClick={() => handleEdit(supplier)}
                    className={`group cursor-pointer transition-colors ${
                      editingId === supplier.id
                        ? 'bg-blue-600/10 border-l-2 border-blue-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300 font-semibold">{supplier.supplierId}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{supplier.address || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{supplier.strNo || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{supplier.ntnNo || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">
                      {parseFloat(supplier.opBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{supplier.crDays || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-violet-400">{supplier.code}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(supplier.id); }}
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
          <span>Showing {filtered.length} of {suppliers.length} entries</span>
          <span>Click a row to edit</span>
        </div>
      </div>
    </div>
  );
}
