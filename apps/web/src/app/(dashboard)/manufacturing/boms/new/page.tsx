'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Item {
  id: string;
  itemCode: string;
  name: string;
  uom: string;
}

interface BOMLine {
  id: string;
  componentItemId: string;
  quantity: number;
  uom: string;
  wastagePercent: number;
}

export default function NewBOMPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState({
    bomCode: '',
    name: '',
    finishedItemId: '',
    outputQty: 1,
    outputUom: 'PCS',
    status: 'DRAFT',
  });

  const [lines, setLines] = useState<BOMLine[]>([
    { id: '1', componentItemId: '', quantity: 0, uom: 'PCS', wastagePercent: 0 },
  ]);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await apiClient.get('/items', {
        params: { pageSize: 1000, isActive: true },
      });
      setItems(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load items:', err);
    }
  }

  function handleAddLine() {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        componentItemId: '',
        quantity: 0,
        uom: 'PCS',
        wastagePercent: 0,
      },
    ]);
  }

  function handleRemoveLine(id: string) {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.id !== id));
    }
  }

  function handleLineChange(id: string, field: keyof BOMLine, value: any) {
    setLines(
      lines.map((line) => {
        if (line.id !== id) return line;

        const updatedLine = { ...line, [field]: value };

        // Auto-populate UOM when item is selected
        if (field === 'componentItemId') {
          const selectedItem = items.find((item) => item.id === value);
          if (selectedItem) {
            updatedLine.uom = selectedItem.uom;
          }
        }

        return updatedLine;
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validLines = lines.filter((line) => line.componentItemId && line.quantity > 0);
    if (validLines.length === 0) {
      setError('Please add at least one component line');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/boms', {
        ...formData,
        lines: validLines.map((line) => ({
          componentItemId: line.componentItemId,
          quantity: line.quantity,
          uom: line.uom,
          wastagePercent: line.wastagePercent || undefined,
        })),
      });

      router.push('/manufacturing/boms');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create BOM');
    } finally {
      setLoading(false);
    }
  }

  const finishedItem = items.find((item) => item.id === formData.finishedItemId);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New BOM</h1>
        <p className="text-gray-600 mt-1">Create a new Bill of Materials</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">BOM Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BOM Code *
              </label>
              <input
                type="text"
                required
                value={formData.bomCode}
                onChange={(e) => setFormData({ ...formData, bomCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., BOM-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="BOM name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Finished Item *
              </label>
              <select
                required
                value={formData.finishedItemId}
                onChange={(e) => {
                  const item = items.find((i) => i.id === e.target.value);
                  setFormData({
                    ...formData,
                    finishedItemId: e.target.value,
                    outputUom: item?.uom || 'PCS',
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Finished Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.itemCode} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formData.outputQty}
                  onChange={(e) =>
                    setFormData({ ...formData, outputQty: parseInt(e.target.value) || 1 })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  readOnly
                  value={finishedItem?.uom || formData.outputUom}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOM Lines */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Component Lines</h2>
            <button
              type="button"
              onClick={handleAddLine}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Component
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => {
              const selectedItem = items.find((item) => item.id === line.componentItemId);
              return (
                <div key={line.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-600 pt-2">
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5">
                      <select
                        value={line.componentItemId}
                        onChange={(e) =>
                          handleLineChange(line.id, 'componentItemId', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      >
                        <option value="">Select Component</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.itemCode} - {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.quantity || ''}
                        onChange={(e) =>
                          handleLineChange(line.id, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Qty"
                        required
                      />
                      {selectedItem && (
                        <div className="text-xs text-gray-500 mt-1">{selectedItem.uom}</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={line.wastagePercent || ''}
                        onChange={(e) =>
                          handleLineChange(
                            line.id,
                            'wastagePercent',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Wastage %"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900">
                        {(
                          line.quantity * (1 + (line.wastagePercent || 0) / 100)
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">With Wastage</div>
                    </div>

                    <div className="md:col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                        disabled={lines.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
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
            {loading ? 'Creating...' : 'Create BOM'}
          </button>
        </div>
      </form>
    </div>
  );
}
