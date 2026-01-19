'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { PermissionTree } from '@/components/permissions/permission-tree';
import apiClient from '@/lib/api-client';

interface Permission {
  id: string;
  module: string;
  entity: string;
  action: string;
  key: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export default function RolePermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roleRes, permsRes] = await Promise.all([
        apiClient.get(`/roles/${params.id}`),
        apiClient.get('/permissions'),
      ]);

      setRole(roleRes.data);
      setAllPermissions(permsRes.data);
      setSelectedPermissions(roleRes.data.permissions.map((p: Permission) => p.id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleModuleToggle = (module: string, modulePermissionIds: string[]) => {
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all
      setSelectedPermissions(prev => {
        const newSet = new Set([...prev, ...modulePermissionIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/roles/${params.id}/permissions`, {
        permissionIds: selectedPermissions,
      });

      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update permissions',
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
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/roles/${role.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Permissions</h1>
            <p className="text-muted-foreground mt-1">
              {role.name} - {selectedPermissions.length} permissions selected
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Permissions
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Select the permissions this role should have. Click on modules to expand and see all available permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionTree
            permissions={allPermissions}
            selectedPermissions={selectedPermissions}
            onPermissionToggle={handlePermissionToggle}
            onModuleToggle={handleModuleToggle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
