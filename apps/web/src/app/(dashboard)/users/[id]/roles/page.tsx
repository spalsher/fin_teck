'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/lib/api-client';

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: any[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userRoles: Array<{ role: Role }>;
}

export default function UserRolesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
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
      // TODO: Replace with actual API endpoints
      const mockUser = {
        id: params.id as string,
        email: 'user@iteck.pk',
        firstName: 'John',
        lastName: 'Doe',
        userRoles: [],
      };

      const rolesRes = await apiClient.get('/roles');
      
      setUser(mockUser);
      setAllRoles(rolesRes.data);
      setSelectedRoles(mockUser.userRoles.map(ur => ur.role.id));
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

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement API endpoint for assigning roles to user
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'User roles updated successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update roles',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getEffectivePermissions = (): string[] => {
    const permissionSet = new Set<string>();
    
    allRoles
      .filter(role => selectedRoles.includes(role.id))
      .forEach(role => {
        role.permissions.forEach(perm => {
          permissionSet.add(`${perm.module}:${perm.entity}:${perm.action}`);
        });
      });

    return Array.from(permissionSet);
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const effectivePermissions = getEffectivePermissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage User Roles</h1>
            <p className="text-muted-foreground mt-1">
              {user.firstName} {user.lastName} ({user.email})
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
              Save Roles
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assign Roles</CardTitle>
            <CardDescription>
              Select the roles this user should have
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allRoles.map((role) => (
              <div
                key={role.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => handleRoleToggle(role.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{role.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {role.permissions.length} permissions
                    </Badge>
                  </div>
                  {role.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  )}
                  <code className="text-xs bg-muted px-2 py-0.5 rounded mt-2 inline-block">
                    {role.code}
                  </code>
                </div>
              </div>
            ))}

            {allRoles.length === 0 && (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mt-2">No roles available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Effective Permissions</CardTitle>
            <CardDescription>
              Combined permissions from all assigned roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">Total Permissions</span>
                <Badge>{effectivePermissions.length}</Badge>
              </div>

              {selectedRoles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No roles assigned. Select roles to see permissions.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {effectivePermissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 bg-muted/50 rounded font-mono"
                    >
                      {perm}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Summary</CardTitle>
          <CardDescription>
            Currently assigned roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRoles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No roles assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allRoles
                .filter(role => selectedRoles.includes(role.id))
                .map(role => (
                  <div key={role.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <Badge>{role.permissions.length} permissions</Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
