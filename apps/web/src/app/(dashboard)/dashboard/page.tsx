'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  Building2, 
  Factory,
  FileText,
  Calendar
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DashboardData {
  finance: {
    revenue: {
      totalInvoiced: number;
      totalCollected: number;
      invoiceCount: number;
      receiptCount: number;
    };
    expenses: {
      totalBills: number;
      billCount: number;
    };
    outstanding: {
      receivables: number;
      payables: number;
    };
  };
  scm: {
    inventory: {
      totalItems: number;
      warehouses: number;
    };
    purchaseOrders: {
      total: number;
      approved: number;
      cancelled: number;
      pending: number;
    };
  };
  assets: {
    assets: {
      total: number;
      totalValue: number;
      currentValue: number;
      depreciation: number;
    };
  };
  hrms: {
    employees: {
      total: number;
    };
  };
  manufacturing: {
    boms: {
      total: number;
      approved: number;
    };
    productionOrders: {
      total: number;
      inProgress: number;
      completed: number;
    };
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await apiClient.get('/reporting/dashboard/overall');
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your ERP system</p>
      </div>

      {/* Finance Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Finance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs {data.finance.revenue.totalInvoiced.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.finance.revenue.invoiceCount} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rs {data.finance.revenue.totalCollected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.finance.revenue.receiptCount} receipts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Receivables</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                Rs {data.finance.outstanding.receivables.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">To be collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payables</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                Rs {data.finance.outstanding.payables.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">To be paid</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Supply Chain Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Supply Chain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.scm.inventory.totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.scm.inventory.warehouses} warehouses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.scm.purchaseOrders.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.scm.purchaseOrders.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved POs</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.scm.purchaseOrders.approved}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ready to receive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled POs</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {data.scm.purchaseOrders.cancelled}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cancelled orders</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assets & HR Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Assets</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.assets.assets.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rs {data.assets.assets.currentValue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs {data.assets.assets.depreciation.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Accumulated</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Human Resources */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Human Resources</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.hrms.employees.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Active employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Production Orders</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.manufacturing.productionOrders.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.manufacturing.productionOrders.inProgress} in progress
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Manufacturing Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Manufacturing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total BOMs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.manufacturing.boms.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.manufacturing.boms.approved} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Production Orders</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.manufacturing.productionOrders.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {data.manufacturing.productionOrders.inProgress}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently producing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.manufacturing.productionOrders.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Finished orders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
