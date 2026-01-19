'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface CustomerOption {
  id: string;
  customerCode: string;
  name: string;
}

interface InvoiceLineForm {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
}

function formatDateInput(value: Date) {
  return value.toISOString().split('T')[0];
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const today = useMemo(() => new Date(), []);
  const defaultDueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }, []);

  const [formData, setFormData] = useState({
    customerId: '',
    invoiceDate: formatDateInput(today),
    dueDate: formatDateInput(defaultDueDate),
    invoiceType: 'STANDARD',
    externalRef: '',
    notes: '',
  });

  const [lines, setLines] = useState<InvoiceLineForm[]>([
    { description: '', quantity: '1', unitPrice: '0', taxRate: '0' },
  ]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    }
  }

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const qty = parseFloat(line.quantity) || 0;
      const price = parseFloat(line.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
    const taxAmount = lines.reduce((sum, line) => {
      const qty = parseFloat(line.quantity) || 0;
      const price = parseFloat(line.unitPrice) || 0;
      const tax = parseFloat(line.taxRate) || 0;
      return sum + qty * price * (tax / 100);
    }, 0);
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  }, [lines]);

  const addLine = () => {
    setLines([...lines, { description: '', quantity: '1', unitPrice: '0', taxRate: '0' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const updateLine = (index: number, field: keyof InvoiceLineForm, value: string) => {
    setLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, [field]: value } : line))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.customerId) {
        throw new Error('Please select a customer.');
      }

      const payload = {
        ...formData,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        lines: lines.map((line) => ({
          description: line.description,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice),
          taxRate: parseFloat(line.taxRate) || 0,
        })),
      };

      await apiClient.post('/invoices', payload);
      router.push('/finance/invoices');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
        <p className="text-gray-600 mt-1">Create a new customer invoice</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customerCode} - {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Type
              </label>
              <input
                type="text"
                value={formData.invoiceType}
                onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                External Reference
              </label>
              <input
                type="text"
                value={formData.externalRef}
                onChange={(e) => setFormData({ ...formData, externalRef: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Invoice Lines</h2>
            <button
              type="button"
              onClick={addLine}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              + Add Line
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={`${index}-${line.description}`} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      required
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(index, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax %
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.taxRate}
                      onChange={(e) => updateLine(index, 'taxRate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={lines.length === 1}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-gray-600">
            <div>Subtotal: PKR {totals.subtotal.toLocaleString()}</div>
            <div>Tax: PKR {totals.taxAmount.toLocaleString()}</div>
            <div className="font-semibold text-gray-900">
              Total: PKR {totals.total.toLocaleString()}
            </div>
          </div>
          <div className="flex gap-4">
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
