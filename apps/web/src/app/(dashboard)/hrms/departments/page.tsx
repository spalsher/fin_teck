'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Users, Edit, Trash2 } from 'lucide-react';
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

interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerId?: string;
  parentId?: string;
  isActive: boolean;
  _count?: {
    employees: number;
    children: number;
  };
  parent?: {
    id: string;
    name: string;
    code: string;
  };
}

export default function DepartmentsPage() {
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'departments/page.tsx:DepartmentsPage',message:'Page component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['departments', search],
    queryFn: async () => {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'departments/page.tsx:queryFn',message:'Fetching departments',data:{search},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      const response = await apiClient.get('/hrms/departments', {
        params: { search },
      });
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'departments/page.tsx:queryFn:response',message:'Departments response',data:{status:response.status,dataLength:response.data?.data?.length || response.data?.length || 0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      return response.data.data || response.data;
    },
  });

  // #region agent log
  if (error) {
    fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'departments/page.tsx:error',message:'Query error',data:{error: String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
  }
  // #endregion

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/hrms/departments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsCreateOpen(false);
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create department',
        variant: 'destructive',
      });
    },
  });

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/hrms/departments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditingDepartment(null);
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update department',
        variant: 'destructive',
      });
    },
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/hrms/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete department',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: formData.get('parentId') as string || undefined,
      isActive: true,
    };

    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's department structure
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading departments...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments?.map((dept: Department) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Code: {dept.code}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDepartment(dept)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this department?')) {
                          deleteMutation.mutate(dept.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dept.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dept.description}
                  </p>
                )}
                {dept.parent && (
                  <div className="text-xs text-muted-foreground">
                    Parent: {dept.parent.name}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{dept._count?.employees || 0} employees</span>
                  </div>
                  {dept._count && dept._count.children > 0 && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{dept._count.children} sub-depts</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      dept.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingDepartment}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingDepartment(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Department Code *</Label>
              <Input
                id="code"
                name="code"
                defaultValue={editingDepartment?.code}
                required
                placeholder="e.g., HR, IT, FIN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingDepartment?.name}
                required
                placeholder="e.g., Human Resources"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingDepartment?.description}
                placeholder="Department description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Department</Label>
              <Select name="parentId" defaultValue={editingDepartment?.parentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    ?.filter((d: Department) => d.id !== editingDepartment?.id)
                    .map((dept: Department) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingDepartment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
