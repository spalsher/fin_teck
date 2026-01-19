'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Attendance {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  status: string;
  lateBy?: number;
  earlyBy?: number;
}

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<any>(null);

  // Get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Fetch today's attendance
  const { data: todayAttendance, refetch } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/hrms/attendance', {
        params: {
          employeeId: 'me',
          fromDate: today,
          toDate: today,
        },
      });
      return response.data.data?.[0] || null;
    },
  });

  // Fetch attendance history
  const { data: history } = useQuery({
    queryKey: ['attendance-history'],
    queryFn: async () => {
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const response = await apiClient.get(`/hrms/attendance/employee/me`, {
        params: { month, year },
      });
      return response.data;
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/hrms/attendance/check-in', {
        location,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      toast({
        title: 'Success',
        description: 'Checked in successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check in',
        variant: 'destructive',
      });
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/hrms/attendance/check-out', {
        location,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      toast({
        title: 'Success',
        description: 'Checked out successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check out',
        variant: 'destructive',
      });
    },
  });

  const handleCheckIn = () => {
    getLocation();
    checkInMutation.mutate();
  };

  const handleCheckOut = () => {
    getLocation();
    checkOutMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-500';
      case 'ABSENT':
        return 'bg-red-500';
      case 'HALF_DAY':
        return 'bg-yellow-500';
      case 'LEAVE':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Check in/out and view your attendance history
        </p>
      </div>

      {/* Check-in/out Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Status Display */}
            <div className="flex-1 grid grid-cols-2 gap-6 w-full">
              {/* Check-in */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check In</p>
                  <p className="text-2xl font-bold">
                    {todayAttendance?.checkIn
                      ? new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--:--'}
                  </p>
                  {todayAttendance?.lateBy && todayAttendance.lateBy > 0 && (
                    <p className="text-xs text-red-500">
                      Late by {todayAttendance.lateBy} min
                    </p>
                  )}
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check Out</p>
                  <p className="text-2xl font-bold">
                    {todayAttendance?.checkOut
                      ? new Date(todayAttendance.checkOut).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--:--'}
                  </p>
                  {todayAttendance?.workHours && (
                    <p className="text-xs text-muted-foreground">
                      {todayAttendance.workHours}h worked
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {!todayAttendance?.checkIn ? (
                <Button
                  size="lg"
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              ) : !todayAttendance?.checkOut ? (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Check Out
                </Button>
              ) : (
                <Badge variant="secondary" className="text-sm py-2">
                  <Clock className="mr-2 h-4 w-4" />
                  Attendance marked for today
                </Badge>
              )}
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Location captured
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">This Month's Attendance</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {history?.map((record: Attendance) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                        })}
                      </p>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">In: </span>
                        <span className="font-medium">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--:--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Out: </span>
                        <span className="font-medium">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--:--'}
                        </span>
                      </div>
                      {record.workHours && (
                        <div>
                          <span className="text-muted-foreground">Hours: </span>
                          <span className="font-medium">{record.workHours}h</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge className={`${getStatusColor(record.status)} text-white border-0`}>
                    {record.status}
                  </Badge>
                </div>
              ))}

              {history?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found for this month
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
