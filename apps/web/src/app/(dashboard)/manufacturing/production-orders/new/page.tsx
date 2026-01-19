'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface BOM {
  id: string;
  bomCode: string;
  name: string;
  outputQty: number;
  outputUom: string;
  finishedItem: {
    id: string;
    itemCode: string;
    name: string;
  };
}

interface Warehouse {
  id: string;
  warehouseCode: string;
  name: string;
}

export default function NewProductionOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [formData, setFormData] = useState({
    bomId: '',
    plannedQty: 1,
    plannedStart: new Date().toISOString().split('T')[0],
    plannedEnd: '',
    warehouseId: '',
    status: 'PLANNED',
  });

  useEffect(() => {
    fetchBOMs();
    fetchWarehouses();
  }, []);

  async function fetchBOMs() {
    try {
      const response = await apiClient.get('/boms', {
        params: { pageSize: 1000, isActive: true, status: 'APPROVED' },
      });
      setBoms(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load BOMs:', err);
    }
  }

  async function fetchWarehouses() {
    try {
      const response = await apiClient.get('/warehouses', {
        params: { pageSize: 1000, isActive: true },
      });
      setWarehouses(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load warehouses:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/production-orders', {
        ...formData,
        plannedStart: new Date(formData.plannedStart),
        plannedEnd: formData.plannedEnd ? new Date(formData.plannedEnd) : undefined,
      });

      router.push('/manufacturing/production-orders');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create production order');
    } finally {
      setLoading(false);
    }
  }

  const selectedBOM = boms.find((bom) => bom.id === formData.bomId);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Production Order</h1>
        <p className="text-gray-600 mt-1">Create a new manufacturing order</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Order Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Production Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill of Materials (BOM) *
              </label>
              <select
                required
                value={formData.bomId}
                onChange={(e) => setFormData({ ...formData, bomId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select BOM</option>
                {boms.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    {bom.bomCode} - {bom.name} ({bom.finishedItem.name})
                  </option>
                ))}
              </select>
              {selectedBOM && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-900">
                    <div className="font-medium">Finished Product: {selectedBOM.finishedItem.name}</div>
                    <div className="text-xs mt-1">
                      Output: {selectedBOM.outputQty} {selectedBOM.outputUom} per batch
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planned Quantity *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={formData.plannedQty}
                onChange={(e) =>
                  setFormData({ ...formData, plannedQty: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
              {selectedBOM && (
                <div className="text-xs text-gray-500 mt-1">
                  = {(formData.plannedQty / selectedBOM.outputQty).toFixed(2)} batches
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Warehouse *
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseCode} - {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planned Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.plannedStart}
                onChange={(e) => setFormData({ ...formData, plannedStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planned End Date
              </label>
              <input
                type="date"
                value={formData.plannedEnd}
                onChange={(e) => setFormData({ ...formData, plannedEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            {loading ? 'Creating...' : 'Create Production Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
