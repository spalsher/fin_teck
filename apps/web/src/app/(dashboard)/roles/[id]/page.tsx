'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/lib/api-client';

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  permissions: any[];
  users: any[];
}

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchRole();
    }
  }, [params.id]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/roles/${params.id}`);
      setRole(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/roles/${params.id}`, formData);
      
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });

      fetchRole();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Role not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/roles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
          <p className="text-muted-foreground mt-1">
            {role.isSystem ? 'System Role' : 'Custom Role'}
          </p>
        </div>
        <Button onClick={() => router.push(`/roles/${role.id}/permissions`)}>
          <Shield className="mr-2 h-4 w-4" />
          Manage Permissions
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role.users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users with this role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role.permissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={role.isSystem ? 'default' : 'secondary'}>
              {role.isSystem ? 'System' : 'Custom'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {role.isSystem ? 'Cannot be deleted' : 'Can be modified'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Update the role name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={role.isSystem}
              placeholder="Role name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role Code</label>
            <Input
              value={role.code}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Role code cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={role.isSystem}
              placeholder="Role description"
            />
          </div>

          {!role.isSystem && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Users</CardTitle>
          <CardDescription>
            Users who have this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role.users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No users assigned</p>
            </div>
          ) : (
            <div className="space-y-2">
              {role.users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
