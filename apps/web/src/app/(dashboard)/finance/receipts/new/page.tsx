'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Customer {
  id: string;
  customerCode: string;
  name: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
}

interface Allocation {
  invoiceId: string;
  invoiceNo: string;
  balanceDue: number;
  amount: number;
}

export default function NewReceiptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    receiptDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
  });

  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      fetchCustomerInvoices(formData.customerId);
    } else {
      setInvoices([]);
      setAllocations([]);
    }
  }, [formData.customerId]);

  async function fetchCustomers() {
    try {
      const response = await apiClient.get('/customers', { params: { pageSize: 1000 } });
      setCustomers(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
    }
  }

  async function fetchCustomerInvoices(customerId: string) {
    setLoadingInvoices(true);
    try {
      const response = await apiClient.get('/invoices', {
        params: { customerId, status: 'POSTED,PARTIALLY_PAID', pageSize: 100 },
      });
      const unpaidInvoices = (response.data.data || []).filter(
        (inv: Invoice) => inv.balanceDue > 0
      );
      setInvoices(unpaidInvoices);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  }

  function handleAddAllocation(invoice: Invoice) {
    if (allocations.find((a) => a.invoiceId === invoice.id)) {
      alert('This invoice is already added');
      return;
    }

    setAllocations([
      ...allocations,
      {
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        balanceDue: invoice.balanceDue,
        amount: invoice.balanceDue,
      },
    ]);
  }

  function handleRemoveAllocation(invoiceId: string) {
    setAllocations(allocations.filter((a) => a.invoiceId !== invoiceId));
  }

  function handleAllocationAmountChange(invoiceId: string, amount: string) {
    setAllocations(
      allocations.map((a) =>
        a.invoiceId === invoiceId ? { ...a, amount: parseFloat(amount) || 0 } : a
      )
    );
  }

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  const receiptAmount = parseFloat(formData.amount) || 0;
  const unallocated = receiptAmount - totalAllocated;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (allocations.length === 0) {
      setError('Please allocate the payment to at least one invoice');
      setLoading(false);
      return;
    }

    if (totalAllocated > receiptAmount) {
      setError('Total allocated amount cannot exceed receipt amount');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/receipts', {
        customerId: formData.customerId,
        receiptDate: new Date(formData.receiptDate),
        amount: receiptAmount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        allocations: allocations.map((a) => ({
          invoiceId: a.invoiceId,
          amount: a.amount,
        })),
      });

      router.push('/finance/receipts');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create receipt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Receipt</h1>
        <p className="text-gray-600 mt-1">Record a customer payment</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Receipt Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Receipt Details</h2>
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
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customerCode} - {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Date *
              </label>
              <input
                type="date"
                required
                value={formData.receiptDate}
                onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="MOBILE_WALLET">Mobile Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference / Cheque #
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
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
              />
            </div>
          </div>
        </div>

        {/* Outstanding Invoices */}
        {formData.customerId && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Outstanding Invoices</h2>
            {loadingInvoices ? (
              <div className="text-center py-4 text-gray-500">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No outstanding invoices for this customer
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Balance Due
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {invoice.invoiceNo}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">
                          PKR {invoice.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-red-600">
                          PKR {invoice.balanceDue.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleAddAllocation(invoice)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            disabled={allocations.some((a) => a.invoiceId === invoice.id)}
                          >
                            {allocations.some((a) => a.invoiceId === invoice.id)
                              ? 'Added'
                              : '+ Add'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Allocations */}
        {allocations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Allocations</h2>
            <div className="space-y-3">
              {allocations.map((allocation) => (
                <div
                  key={allocation.invoiceId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {allocation.invoiceNo}
                    </div>
                    <div className="text-xs text-gray-500">
                      Balance Due: PKR {allocation.balanceDue.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-40">
                    <input
                      type="number"
                      step="0.01"
                      value={allocation.amount}
                      onChange={(e) =>
                        handleAllocationAmountChange(allocation.invoiceId, e.target.value)
                      }
                      max={allocation.balanceDue}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllocation(allocation.invoiceId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Allocation Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receipt Amount:</span>
                <span className="font-medium">PKR {receiptAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Allocated:</span>
                <span className="font-medium">PKR {totalAllocated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className={unallocated < 0 ? 'text-red-600' : 'text-gray-900'}>
                  Unallocated:
                </span>
                <span className={unallocated < 0 ? 'text-red-600' : 'text-gray-900'}>
                  PKR {unallocated.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || allocations.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
