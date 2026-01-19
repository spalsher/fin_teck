'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function NewItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    description: '',
    itemType: 'MATERIAL',
    uom: 'PCS',
    unitCost: 0,
    reorderLevel: 0,
    reorderQty: 0,
    isActive: true,
    isHarnessComponent: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/items', {
        ...formData,
        description: formData.description || undefined,
        reorderLevel: formData.reorderLevel || undefined,
        reorderQty: formData.reorderQty || undefined,
      });

      router.push('/scm/items');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Item</h1>
        <p className="text-gray-600 mt-1">Create a new inventory item</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Code *
              </label>
              <input
                type="text"
                required
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ITEM-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Wire Harness Assembly"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Item description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Type *
              </label>
              <select
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MATERIAL">Material</option>
                <option value="FINISHED_GOOD">Finished Good</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure (UOM) *
              </label>
              <select
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PCS">Pieces (PCS)</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="MTR">Meter (MTR)</option>
                <option value="LITER">Liter</option>
                <option value="BOX">Box</option>
                <option value="ROLL">Roll</option>
                <option value="SET">Set</option>
              </select>
            </div>
          </div>
        </div>

        {/* Costing & Inventory */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Costing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unitCost}
                onChange={(e) =>
                  setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum stock level before reorder
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderQty}
                onChange={(e) =>
                  setFormData({ ...formData, reorderQty: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Quantity to order when restocking
              </p>
            </div>
          </div>
        </div>

        {/* Flags */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isHarnessComponent}
                onChange={(e) =>
                  setFormData({ ...formData, isHarnessComponent: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Harness Component
                <span className="text-xs text-gray-500 block">
                  Mark as wire harness component for specialized tracking
                </span>
              </span>
            </label>
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
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
