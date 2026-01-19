'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: '', name: '', customerType: 'BUSINESS', email: '', phone: '', taxId: '',
    creditLimit: '50000', paymentTermDays: '30',
    billingAddress: { street: '', city: '', state: '', country: 'Pakistan', postalCode: '' },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const contacts = [];
      if (formData.email || formData.phone) {
        contacts.push({ name: formData.name, email: formData.email || '', phone: formData.phone || '', isPrimary: true });
      }
      await apiClient.post('/customers', {
        customerCode: formData.customerCode, name: formData.name, customerType: formData.customerType,
        taxId: formData.taxId || undefined, contacts, billingAddress: formData.billingAddress,
        creditLimit: parseFloat(formData.creditLimit), paymentTermDays: parseInt(formData.paymentTermDays),
      });
      toast({ title: "Success", description: "Customer created successfully." });
      router.push('/finance/customers');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || 'Failed to create customer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <div className="mb-6"><h1 className="text-3xl font-bold tracking-tight">New Customer</h1><p className="text-muted-foreground mt-1">Create a new customer record</p></div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardHeader><CardTitle>Basic Information</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Customer Code *</label><Input required value={formData.customerCode} onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })} placeholder="e.g., CUST001" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Customer Name *</label><Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Company or person name" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Type</label><Select value={formData.customerType} onValueChange={(value) => setFormData({ ...formData, customerType: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BUSINESS">Business</SelectItem><SelectItem value="INDIVIDUAL">Individual</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Tax ID</label><Input value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} placeholder="Optional" /></div>
          </div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Contact Information</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+92..." /></div>
          </div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Billing Address</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Street</label><Input value={formData.billingAddress.street} onChange={(e) => setFormData({ ...formData, billingAddress: { ...formData.billingAddress, street: e.target.value } })} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">City</label><Input value={formData.billingAddress.city} onChange={(e) => setFormData({ ...formData, billingAddress: { ...formData.billingAddress, city: e.target.value } })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">State</label><Input value={formData.billingAddress.state} onChange={(e) => setFormData({ ...formData, billingAddress: { ...formData.billingAddress, state: e.target.value } })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Postal Code</label><Input value={formData.billingAddress.postalCode} onChange={(e) => setFormData({ ...formData, billingAddress: { ...formData.billingAddress, postalCode: e.target.value } })} /></div>
          </div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Payment Terms</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Credit Limit (PKR)</label><Input type="number" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Payment Term (Days)</label><Input type="number" value={formData.paymentTermDays} onChange={(e) => setFormData({ ...formData, paymentTermDays: e.target.value })} /></div>
          </div>
        </CardContent></Card>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Customer'}</Button>
        </div>
      </form>
    </div>
  );
}
