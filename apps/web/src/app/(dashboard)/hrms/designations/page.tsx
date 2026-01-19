'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Briefcase, Edit, Trash2, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Designation {
  id: string;
  code: string;
  title: string;
  level: number;
  grade?: string;
  salaryBandMin?: number;
  salaryBandMax?: number;
  description?: string;
  isActive: boolean;
  _count?: {
    employees: number;
  };
}

export default function DesignationsPage() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch designations
  const { data: designations, isLoading } = useQuery({
    queryKey: ['designations', search],
    queryFn: async () => {
      const response = await apiClient.get('/hrms/designations', {
        params: { search },
      });
      return response.data.data || response.data;
    },
  });

  // Create designation mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/hrms/designations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      setIsCreateOpen(false);
      toast({
        title: 'Success',
        description: 'Designation created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create designation',
        variant: 'destructive',
      });
    },
  });

  // Update designation mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/hrms/designations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      setEditingDesignation(null);
      toast({
        title: 'Success',
        description: 'Designation updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update designation',
        variant: 'destructive',
      });
    },
  });

  // Delete designation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/hrms/designations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast({
        title: 'Success',
        description: 'Designation deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete designation',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code') as string,
      title: formData.get('title') as string,
      level: parseInt(formData.get('level') as string),
      grade: formData.get('grade') as string || undefined,
      salaryBandMin: formData.get('salaryBandMin')
        ? parseFloat(formData.get('salaryBandMin') as string)
        : undefined,
      salaryBandMax: formData.get('salaryBandMax')
        ? parseFloat(formData.get('salaryBandMax') as string)
        : undefined,
      description: formData.get('description') as string,
      isActive: true,
    };

    if (editingDesignation) {
      updateMutation.mutate({ id: editingDesignation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Designations</h1>
          <p className="text-muted-foreground">
            Manage job titles, levels, and salary bands
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Designation
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search designations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Designations Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading designations...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {designations?.map((designation: Designation) => (
            <Card key={designation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{designation.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Code: {designation.code}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDesignation(designation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this designation?')) {
                          deleteMutation.mutate(designation.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Level {designation.level}
                  </Badge>
                  {designation.grade && (
                    <Badge variant="outline">Grade {designation.grade}</Badge>
                  )}
                </div>

                {designation.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {designation.description}
                  </p>
                )}

                {designation.salaryBandMin && designation.salaryBandMax && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Salary Band:</span>
                    <div className="font-medium">
                      PKR {designation.salaryBandMin.toLocaleString()} - PKR{' '}
                      {designation.salaryBandMax.toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    {designation._count?.employees || 0} employees
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        designation.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {designation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingDesignation}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingDesignation(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDesignation ? 'Edit Designation' : 'Create Designation'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={editingDesignation?.code}
                  required
                  placeholder="e.g., MGR, DEV, ANLST"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingDesignation?.title}
                  required
                  placeholder="e.g., Senior Manager"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  defaultValue={editingDesignation?.level}
                  required
                  min="1"
                  placeholder="1, 2, 3..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  name="grade"
                  defaultValue={editingDesignation?.grade}
                  placeholder="e.g., A, B, C"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryBandMin">Min Salary (PKR)</Label>
                <Input
                  id="salaryBandMin"
                  name="salaryBandMin"
                  type="number"
                  defaultValue={editingDesignation?.salaryBandMin}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryBandMax">Max Salary (PKR)</Label>
                <Input
                  id="salaryBandMax"
                  name="salaryBandMax"
                  type="number"
                  defaultValue={editingDesignation?.salaryBandMax}
                  placeholder="e.g., 100000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingDesignation?.description}
                placeholder="Role description and responsibilities..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingDesignation(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingDesignation ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
