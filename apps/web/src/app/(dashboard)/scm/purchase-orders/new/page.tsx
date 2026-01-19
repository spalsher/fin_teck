'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
}

interface Item {
  id: string;
  itemCode: string;
  name: string;
  unitCost: number;
  uom: string;
}

interface POLine {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState({
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    notes: '',
  });

  const [lines, setLines] = useState<POLine[]>([
    { id: '1', itemId: '', quantity: 0, unitPrice: 0, lineTotal: 0 },
  ]);

  useEffect(() => {
    fetchVendors();
    fetchItems();
  }, []);

  async function fetchVendors() {
    try {
      const response = await apiClient.get('/vendors', {
        params: { pageSize: 1000, isActive: true },
      });
      setVendors(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load vendors:', err);
    }
  }

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
        itemId: '',
        quantity: 0,
        unitPrice: 0,
        lineTotal: 0,
      },
    ]);
  }

  function handleRemoveLine(id: string) {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.id !== id));
    }
  }

  function handleLineChange(id: string, field: keyof POLine, value: any) {
    setLines(
      lines.map((line) => {
        if (line.id !== id) return line;

        const updatedLine = { ...line, [field]: value };

        // Auto-populate unit price when item is selected
        if (field === 'itemId') {
          const selectedItem = items.find((item) => item.id === value);
          if (selectedItem) {
            updatedLine.unitPrice = selectedItem.unitCost;
          }
        }

        // Calculate line total
        if (field === 'quantity' || field === 'unitPrice' || field === 'itemId') {
          updatedLine.lineTotal = updatedLine.quantity * updatedLine.unitPrice;
        }

        return updatedLine;
      })
    );
  }

  const totalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validLines = lines.filter((line) => line.itemId && line.quantity > 0);
    if (validLines.length === 0) {
      setError('Please add at least one line item');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/purchase-orders', {
        vendorId: formData.vendorId,
        orderDate: new Date(formData.orderDate),
        expectedDate: formData.expectedDate ? new Date(formData.expectedDate) : undefined,
        notes: formData.notes || undefined,
        lines: validLines.map((line) => ({
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });

      router.push('/scm/purchase-orders');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Purchase Order</h1>
        <p className="text-gray-600 mt-1">Create a new order from vendor</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                Order Date *
              </label>
              <input
                type="date"
                required
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Order Lines</h2>
            <button
              type="button"
              onClick={handleAddLine}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Line
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => {
              const selectedItem = items.find((item) => item.id === line.itemId);
              return (
                <div key={line.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-600 pt-2">
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5">
                      <select
                        value={line.itemId}
                        onChange={(e) => handleLineChange(line.id, 'itemId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      >
                        <option value="">Select Item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.itemCode} - {item.name} ({item.uom})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity || ''}
                        onChange={(e) =>
                          handleLineChange(line.id, 'quantity', parseInt(e.target.value) || 0)
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
                        step="0.01"
                        min="0"
                        value={line.unitPrice || ''}
                        onChange={(e) =>
                          handleLineChange(line.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Unit Price"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900">
                        {line.lineTotal.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Total</div>
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

          {/* Total */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-indigo-600">PKR {totalAmount.toLocaleString()}</span>
            </div>
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
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
