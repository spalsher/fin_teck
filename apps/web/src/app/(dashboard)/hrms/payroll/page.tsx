'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, DollarSign, Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status: 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'PAID';
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  createdAt: string;
}

export default function PayrollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newPayroll, setNewPayroll] = useState({
    periodStart: '',
    periodEnd: '',
    paymentDate: '',
  });

  useEffect(() => {
    fetchPayrollRuns();
  }, [statusFilter]);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      let url = '/hrms/payroll';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const response = await apiClient.get(url);
      setPayrollRuns(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch payroll runs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayroll = async () => {
    if (!newPayroll.periodStart || !newPayroll.periodEnd || !newPayroll.paymentDate) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await apiClient.post('/hrms/payroll', newPayroll);
      
      toast({
        title: 'Success',
        description: 'Payroll run created successfully',
      });

      setCreateDialogOpen(false);
      setNewPayroll({ periodStart: '', periodEnd: '', paymentDate: '' });
      fetchPayrollRuns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create payroll run',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4" />;
      case 'DRAFT':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredPayrollRuns = payrollRuns.filter((run) => {
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    const matchesSearch = 
      searchTerm === '' ||
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.periodStart.includes(searchTerm) ||
      run.periodEnd.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage payroll runs and employee payments
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Payroll Run
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollRuns.reduce((sum, run) => sum + run.totalNet, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRuns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollRuns.filter(r => r.status === 'DRAFT' || r.status === 'PROCESSING').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollRuns.filter(r => r.status === 'PAID').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully paid
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>
                {filteredPayrollRuns.length} payroll run{filteredPayrollRuns.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payroll runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPayrollRuns.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No payroll runs found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating a new payroll run'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-left py-3 px-4 font-medium">Payment Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Employees</th>
                    <th className="text-right py-3 px-4 font-medium">Gross</th>
                    <th className="text-right py-3 px-4 font-medium">Deductions</th>
                    <th className="text-right py-3 px-4 font-medium">Net</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrollRuns.map((run) => (
                    <tr key={run.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.ceil((new Date(run.periodEnd).getTime() - new Date(run.periodStart).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(run.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(run.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(run.status)}
                            {run.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{run.employeeCount}</td>
                      <td className="py-3 px-4 text-right">${run.totalGross.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">${run.totalDeductions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium">${run.totalNet.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => router.push(`/hrms/payroll/${run.id}`)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export Report
                              </DropdownMenuItem>
                              {run.status === 'DRAFT' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        await apiClient.post(`/hrms/payroll/${run.id}/process`);
                                        toast({
                                          title: 'Success',
                                          description: 'Payroll processed successfully',
                                        });
                                        fetchPayrollRuns();
                                      } catch (error: any) {
                                        toast({
                                          title: 'Error',
                                          description: error.response?.data?.message || 'Failed to process payroll',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                  >
                                    Process Payroll
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={async () => {
                                      try {
                                        await apiClient.delete(`/hrms/payroll/${run.id}`);
                                        toast({
                                          title: 'Success',
                                          description: 'Payroll run deleted',
                                        });
                                        fetchPayrollRuns();
                                      } catch (error: any) {
                                        toast({
                                          title: 'Error',
                                          description: error.response?.data?.message || 'Failed to delete payroll',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                              {run.status === 'PROCESSING' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        await apiClient.post(`/hrms/payroll/${run.id}/approve`);
                                        toast({
                                          title: 'Success',
                                          description: 'Payroll approved',
                                        });
                                        fetchPayrollRuns();
                                      } catch (error: any) {
                                        toast({
                                          title: 'Error',
                                          description: error.response?.data?.message || 'Failed to approve payroll',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                  >
                                    Approve Payroll
                                  </DropdownMenuItem>
                                </>
                              )}
                              {run.status === 'APPROVED' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        await apiClient.post(`/hrms/payroll/${run.id}/mark-paid`);
                                        toast({
                                          title: 'Success',
                                          description: 'Payroll marked as paid',
                                        });
                                        fetchPayrollRuns();
                                      } catch (error: any) {
                                        toast({
                                          title: 'Error',
                                          description: error.response?.data?.message || 'Failed to mark as paid',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                  >
                                    Mark as Paid
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Payroll Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Payroll Run</DialogTitle>
            <DialogDescription>
              Create a new payroll run for a specific period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period Start</label>
              <Input
                type="date"
                value={newPayroll.periodStart}
                onChange={(e) => setNewPayroll({ ...newPayroll, periodStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Period End</label>
              <Input
                type="date"
                value={newPayroll.periodEnd}
                onChange={(e) => setNewPayroll({ ...newPayroll, periodEnd: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Date</label>
              <Input
                type="date"
                value={newPayroll.paymentDate}
                onChange={(e) => setNewPayroll({ ...newPayroll, paymentDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayroll} disabled={creating}>
              {creating ? 'Creating...' : 'Create Payroll Run'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
