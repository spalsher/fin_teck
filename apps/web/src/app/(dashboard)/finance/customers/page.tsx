'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Customer {
  id: string;
  customerCode: string;
  name: string;
  customerType: string;
  email?: string;
  phone?: string;
  creditLimit: number;
  paymentTermDays: number;
  isActive: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; customer: Customer | null }>({
    open: false,
    customer: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data.data || []);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to load customers',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteDialog.customer) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/customers/${deleteDialog.customer.id}`);
      toast({
        title: "Customer deleted",
        description: `${deleteDialog.customer.name} has been successfully deleted.`,
      });
      setCustomers(customers.filter((c) => c.id !== deleteDialog.customer!.id));
      setDeleteDialog({ open: false, customer: null });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || 'Failed to delete customer',
      });
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: 'customerCode',
      header: 'Code',
      sortable: true,
      cell: (customer) => (
        <div className="font-medium">{customer.customerCode}</div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (customer) => (
        <div>
          <div className="font-medium">{customer.name}</div>
          {customer.email && (
            <div className="text-sm text-muted-foreground">{customer.email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'customerType',
      header: 'Type',
      sortable: true,
      cell: (customer) => (
        <Badge variant="outline">{customer.customerType}</Badge>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      sortable: true,
      cell: (customer) => (
        <div className="font-mono">PKR {customer.creditLimit.toLocaleString()}</div>
      ),
    },
    {
      key: 'paymentTermDays',
      header: 'Payment Terms',
      sortable: true,
      cell: (customer) => (
        <div>{customer.paymentTermDays} days</div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      cell: (customer) => (
        <Badge variant={customer.isActive ? "success" : "destructive"}>
          {customer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/customers/${customer.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/finance/customers/${customer.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDialog({ open: true, customer })}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <Button onClick={() => router.push('/finance/customers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {customers.filter((c) => !c.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={customers}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search customers by name..."
            emptyMessage="No customers found. Create your first customer!"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, customer: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteDialog.customer?.name}</strong>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, customer: null })}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
