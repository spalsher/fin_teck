'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Customer {
  id: string;
  customerCode: string;
  name: string;
  customerType: string;
  taxId?: string;
  creditLimit: number;
  paymentTermDays: number;
  isActive: boolean;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CustomerContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  balanceDue: number;
  status: string;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  async function fetchCustomerDetails() {
    try {
      const [customerRes, balanceRes] = await Promise.all([
        apiClient.get(`/customers/${customerId}`),
        apiClient.get(`/customers/${customerId}/balance`),
      ]);

      setCustomer(customerRes.data);
      setBalance(balanceRes.data.balance || 0);

      // Fetch related data if customer exists
      if (customerRes.data) {
        // Fetch contacts (if endpoint exists)
        try {
          const contactsRes = await apiClient.get(`/customers/${customerId}/contacts`);
          setContacts(contactsRes.data.data || []);
        } catch (err) {
          // Contacts endpoint might not exist
          console.log('Contacts not available');
        }

        // Fetch invoices
        try {
          const invoicesRes = await apiClient.get(`/invoices?customerId=${customerId}`);
          setInvoices(invoicesRes.data.data || []);
        } catch (err) {
          console.log('Invoices not available');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/customers/${customerId}`);
      router.push('/finance/customers');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete customer');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading customer details...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Customer not found'}
        </div>
        <button
          onClick={() => router.push('/finance/customers')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.push('/finance/customers')}
            className="text-blue-600 hover:text-blue-800 mb-2 text-sm"
          >
            ← Back to Customers
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600 mt-1">Customer Code: {customer.customerCode}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/finance/customers/${customerId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Customer
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
            customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {customer.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 mb-6 text-white">
        <h3 className="text-sm font-medium opacity-90">Current Balance</h3>
        <p className="text-3xl font-bold mt-2">PKR {balance.toLocaleString()}</p>
        <p className="text-sm opacity-90 mt-1">Credit Limit: PKR {customer.creditLimit.toLocaleString()}</p>
        <div className="mt-2 text-sm">
          <span className={balance > customer.creditLimit ? 'text-yellow-300' : 'text-green-200'}>
            {balance > customer.creditLimit ? '⚠ Over limit' : '✓ Within limit'}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer Code</dt>
              <dd className="mt-1 text-sm text-gray-900">{customer.customerCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{customer.customerType}</dd>
            </div>
            {customer.taxId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax ID / NTN</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.taxId}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Financial Terms */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Terms</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
              <dd className="mt-1 text-sm text-gray-900">PKR {customer.creditLimit.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
              <dd className="mt-1 text-sm text-gray-900">{customer.paymentTermDays} days</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Balance</dt>
              <dd className="mt-1 text-sm text-gray-900">PKR {balance.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Available Credit</dt>
              <dd className="mt-1 text-sm text-gray-900">
                PKR {Math.max(0, customer.creditLimit - balance).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Billing Address */}
        {customer.billingAddress && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
            <address className="text-sm text-gray-900 not-italic">
              {customer.billingAddress.street && <div>{customer.billingAddress.street}</div>}
              <div>
                {customer.billingAddress.city && <span>{customer.billingAddress.city}</span>}
                {customer.billingAddress.state && <span>, {customer.billingAddress.state}</span>}
              </div>
              {customer.billingAddress.postalCode && <div>{customer.billingAddress.postalCode}</div>}
              {customer.billingAddress.country && <div>{customer.billingAddress.country}</div>}
            </address>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          {contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="border-b pb-3 last:border-b-0">
                  <div className="font-medium text-sm text-gray-900">
                    {contact.name}
                    {contact.isPrimary && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  {contact.email && (
                    <div className="text-sm text-gray-600 mt-1">
                      <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="text-sm text-gray-600">
                      <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No contacts added</p>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
        </div>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.slice(0, 10).map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      PKR {invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      PKR {invoice.balanceDue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'POSTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => router.push(`/finance/invoices/${invoice.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No invoices found for this customer
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Created: {new Date(customer.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(customer.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
