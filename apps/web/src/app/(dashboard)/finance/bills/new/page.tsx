'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
}

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [formData, setFormData] = useState({
    vendorId: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    // Auto-calculate due date based on vendor payment terms
    if (formData.billDate && formData.vendorId) {
      const vendor = vendors.find((v) => v.id === formData.vendorId);
      if (vendor) {
        // For simplicity, we'll just add 30 days. In a real app, we'd fetch vendor.paymentTermDays
        const billDate = new Date(formData.billDate);
        billDate.setDate(billDate.getDate() + 30);
        setFormData((prev) => ({
          ...prev,
          dueDate: billDate.toISOString().split('T')[0],
        }));
      }
    }
  }, [formData.vendorId, formData.billDate, vendors]);

  async function fetchVendors() {
    try {
      const response = await apiClient.get('/vendors', { params: { pageSize: 1000 } });
      setVendors(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load vendors:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/bills', {
        vendorId: formData.vendorId,
        billDate: new Date(formData.billDate),
        dueDate: new Date(formData.dueDate),
        totalAmount: parseFloat(formData.totalAmount),
      });

      router.push('/finance/bills');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Bill</h1>
        <p className="text-gray-600 mt-1">Record a vendor bill</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Bill Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <select
                required
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorCode} - {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Date *
              </label>
              <input
                type="date"
                required
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount (PKR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Bill'}
          </button>
        </div>
      </form>
    </div>
  );
}
