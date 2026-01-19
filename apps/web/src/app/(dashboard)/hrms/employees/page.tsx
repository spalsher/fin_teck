'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Users } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  isActive: boolean;
}

export default function EmployeesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const response = await apiClient.get('/employees', { params: { pageSize: 100 } });
      setEmployees(response.data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Employee>[] = [
    { key: 'employeeCode', header: 'Code', sortable: true, cell: (e) => <div className="font-medium">{e.employeeCode}</div> },
    { key: 'name', header: 'Name', sortable: true, cell: (e) => (<div><div className="font-medium">{e.firstName} {e.lastName}</div><div className="text-sm text-muted-foreground">{e.email}</div></div>) },
    { key: 'department', header: 'Department', sortable: true, cell: (e) => <Badge variant="outline">{e.department}</Badge> },
    { key: 'designation', header: 'Designation', sortable: true, cell: (e) => <Badge variant="secondary">{e.designation}</Badge> },
    { key: 'isActive', header: 'Status', sortable: true, cell: (e) => <Badge variant={e.isActive ? "success" : "destructive"}>{e.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', cell: (e) => <Button variant="ghost" size="sm" onClick={() => router.push(`/hrms/employees/${e.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button> },
  ];

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Employees</h1><p className="text-muted-foreground mt-1">Manage employee records</p></div>
        <Button onClick={() => router.push('/hrms/employees/new')}><Plus className="mr-2 h-4 w-4" />New Employee</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Employees</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{employees.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{employees.filter(e => e.isActive).length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Departments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{new Set(employees.map(e => e.department)).size}</div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><DataTable data={employees} columns={columns} searchKey="firstName" searchPlaceholder="Search employees..." emptyMessage="No employees found." /></CardContent></Card>
    </div>
  );
}
