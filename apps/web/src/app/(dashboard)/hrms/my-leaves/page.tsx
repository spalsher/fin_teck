'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface LeaveBalance {
  id: string;
  year: number;
  balance: number;
  used: number;
  accrued: number;
  leaveType: {
    id: string;
    name: string;
    code: string;
    color?: string;
  };
}

interface LeaveRequest {
  id: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string;
  appliedDate: string;
  reviewedDate?: string;
  reviewNotes?: string;
  leaveType: {
    name: string;
    code: string;
    color?: string;
  };
}

export default function MyLeavesPage() {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  // Fetch leave balances
  const { data: balances } = useQuery({
    queryKey: ['my-leave-balances', currentYear],
    queryFn: async () => {
      const response = await apiClient.get('/hrms/leave-balances/employee/me', {
        params: { year: currentYear },
      });
      return response.data;
    },
  });

  // Fetch leave requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-leave-requests'],
    queryFn: async () => {
      const response = await apiClient.get('/hrms/leave-requests', {
        params: { employeeId: 'me' },
      });
      return response.data.data || response.data;
    },
  });

  // Fetch leave types
  const { data: leaveTypes } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await apiClient.get('/hrms/leave-types');
      return response.data;
    },
  });

  // Apply for leave mutation
  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/hrms/leave-requests', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-balances'] });
      setIsApplyOpen(false);
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to apply for leave',
        variant: 'destructive',
      });
    },
  });

  // Cancel leave mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/hrms/leave-requests/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-balances'] });
      toast({
        title: 'Success',
        description: 'Leave request cancelled successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel leave',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const fromDate = new Date(formData.get('fromDate') as string);
    const toDate = new Date(formData.get('toDate') as string);
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const data = {
      leaveTypeId: formData.get('leaveTypeId') as string,
      fromDate: formData.get('fromDate') as string,
      toDate: formData.get('toDate') as string,
      days,
      reason: formData.get('reason') as string,
      contactDuring: formData.get('contactDuring') as string,
    };

    applyMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leaves</h1>
          <p className="text-muted-foreground">
            View your leave balances and apply for leave
          </p>
        </div>
        <Button onClick={() => setIsApplyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balances */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Leave Balances ({currentYear})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {balances?.map((balance: LeaveBalance) => (
            <Card key={balance.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{balance.leaveType.name}</CardTitle>
                <CardDescription className="text-xs">
                  {balance.leaveType.code}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {balance.balance}
                </div>
                <p className="text-xs text-muted-foreground mt-1">days available</p>
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accrued:</span>
                    <span className="font-medium">{balance.accrued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-medium">{balance.used}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Leave Requests */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Leave Requests</h2>
        {isLoading ? (
          <div className="text-center py-12">Loading requests...</div>
        ) : (
          <div className="space-y-4">
            {requests?.map((request: LeaveRequest) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: request.leaveType.color || '#6366f1',
                            color: 'white',
                          }}
                        >
                          {request.leaveType.name}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(request.status)} text-white border-0`}
                        >
                          <span className="mr-1">{getStatusIcon(request.status)}</span>
                          {request.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">From Date</span>
                          <span className="font-medium">
                            {new Date(request.fromDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">To Date</span>
                          <span className="font-medium">
                            {new Date(request.toDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Duration</span>
                          <span className="font-medium">{request.days} days</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Reason: </span>
                        <span>{request.reason}</span>
                      </div>

                      {request.reviewNotes && (
                        <div className="text-sm bg-muted p-3 rounded">
                          <span className="text-muted-foreground">Review Notes: </span>
                          <span>{request.reviewNotes}</span>
                        </div>
                      )}
                    </div>

                    {request.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this leave request?')) {
                            cancelMutation.mutate(request.id);
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {requests?.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leave requests found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Apply for Leave Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaveTypeId">Leave Type *</Label>
              <Select name="leaveTypeId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes?.map((type: any) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date *</Label>
                <Input id="fromDate" name="fromDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date *</Label>
                <Input id="toDate" name="toDate" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                name="reason"
                required
                placeholder="Reason for leave..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactDuring">Contact During Leave</Label>
              <Input
                id="contactDuring"
                name="contactDuring"
                placeholder="Phone number or email"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={applyMutation.isPending}>
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
