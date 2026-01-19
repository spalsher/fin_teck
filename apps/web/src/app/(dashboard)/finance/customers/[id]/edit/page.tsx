'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerCode: '',
    name: '',
    customerType: 'BUSINESS',
    email: '',
    phone: '',
    taxId: '',
    creditLimit: '50000',
    paymentTermDays: '30',
    isActive: true,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      postalCode: '',
    },
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  async function fetchCustomer() {
    try {
      const response = await apiClient.get(`/customers/${customerId}`);
      const customer = response.data;

      setFormData({
        customerCode: customer.customerCode || '',
        name: customer.name || '',
        customerType: customer.customerType || 'BUSINESS',
        email: customer.email || '',
        phone: customer.phone || '',
        taxId: customer.taxId || '',
        creditLimit: customer.creditLimit?.toString() || '50000',
        paymentTermDays: customer.paymentTermDays?.toString() || '30',
        isActive: customer.isActive !== false,
        billingAddress: {
          street: customer.billingAddress?.street || '',
          city: customer.billingAddress?.city || '',
          state: customer.billingAddress?.state || '',
          country: customer.billingAddress?.country || 'Pakistan',
          postalCode: customer.billingAddress?.postalCode || '',
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiClient.put(`/customers/${customerId}`, {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit),
        paymentTermDays: parseInt(formData.paymentTermDays),
      });

      router.push(`/finance/customers/${customerId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update customer');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading customer...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/finance/customers/${customerId}`)}
          className="text-blue-600 hover:text-blue-800 mb-2 text-sm"
        >
          ← Back to Customer Details
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600 mt-1">Update customer information</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Code *
              </label>
              <input
                type="text"
                required
                value={formData.customerCode}
                onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CUST001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Company or Person Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Type *
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="BUSINESS">Business</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / NTN
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+92-XXX-XXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.billingAddress.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, street: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.billingAddress.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, city: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={formData.billingAddress.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, state: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.billingAddress.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, postalCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.billingAddress.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, country: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Financial Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit (PKR) *
              </label>
              <input
                type="number"
                required
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms (Days) *
              </label>
              <input
                type="number"
                required
                value={formData.paymentTermDays}
                onChange={(e) => setFormData({ ...formData, paymentTermDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push(`/finance/customers/${customerId}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
