'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function NewAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    assetCode: '',
    name: '',
    description: '',
    categoryId: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: 0,
    depreciationMethodId: '',
    usefulLife: 5,
    salvageValue: 0,
    status: 'ACTIVE',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // For now, use placeholder IDs for category and depreciation method
    // In a real app, you'd fetch these from the backend
    const placeholderCategoryId = 'placeholder-category-id';
    const placeholderDepreciationMethodId = 'placeholder-depreciation-method-id';

    try {
      await apiClient.post('/assets', {
        ...formData,
        categoryId: placeholderCategoryId,
        depreciationMethodId: placeholderDepreciationMethodId,
        description: formData.description || undefined,
        acquisitionDate: new Date(formData.acquisitionDate),
      });

      router.push('/assets');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Asset</h1>
        <p className="text-gray-600 mt-1">Register a new fixed asset</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Asset Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Code *
              </label>
              <input
                type="text"
                required
                value={formData.assetCode}
                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ASSET-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Company Vehicle"
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
                placeholder="Asset description..."
              />
            </div>
          </div>
        </div>

        {/* Acquisition Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Acquisition Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acquisition Date *
              </label>
              <input
                type="date"
                required
                value={formData.acquisitionDate}
                onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acquisition Cost *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.acquisitionCost}
                onChange={(e) =>
                  setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Depreciation Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Depreciation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Useful Life (Years) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.usefulLife}
                onChange={(e) =>
                  setFormData({ ...formData, usefulLife: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected lifespan of the asset
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salvage Value
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.salvageValue}
                onChange={(e) =>
                  setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estimated value at end of useful life
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              Annual Depreciation (Straight Line)
            </div>
            <div className="text-lg font-bold text-blue-900 mt-1">
              PKR{' '}
              {(
                (formData.acquisitionCost - formData.salvageValue) /
                (formData.usefulLife || 1)
              ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            {loading ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
