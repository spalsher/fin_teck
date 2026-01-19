'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  email?: string;
  phone?: string;
  paymentTermDays: number;
  isActive: boolean;
}

export default function VendorsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; vendor: Vendor | null }>({
    open: false,
    vendor: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const response = await apiClient.get('/vendors', { params: { pageSize: 100 } });
      setVendors(response.data.data || []);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to load vendors',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteDialog.vendor) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/vendors/${deleteDialog.vendor.id}`);
      toast({
        title: "Vendor deleted",
        description: `${deleteDialog.vendor.name} has been deleted.`,
      });
      setVendors(vendors.filter((v) => v.id !== deleteDialog.vendor!.id));
      setDeleteDialog({ open: false, vendor: null });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || 'Failed to delete vendor',
      });
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Vendor>[] = [
    {
      key: 'vendorCode',
      header: 'Code',
      sortable: true,
      cell: (vendor) => <div className="font-medium">{vendor.vendorCode}</div>,
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (vendor) => (
        <div>
          <div className="font-medium">{vendor.name}</div>
          {vendor.email && <div className="text-sm text-muted-foreground">{vendor.email}</div>}
        </div>
      ),
    },
    {
      key: 'paymentTermDays',
      header: 'Payment Terms',
      sortable: true,
      cell: (vendor) => <div>{vendor.paymentTermDays} days</div>,
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      cell: (vendor) => (
        <Badge variant={vendor.isActive ? "success" : "destructive"}>
          {vendor.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (vendor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/finance/vendors/${vendor.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/finance/vendors/${vendor.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDialog({ open: true, vendor })}
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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage your vendor database</p>
        </div>
        <Button onClick={() => router.push('/finance/vendors/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Vendor
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={vendors}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search vendors..."
            emptyMessage="No vendors found."
          />
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, vendor: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.vendor?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, vendor: null })} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
