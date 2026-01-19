'use client';

import { useState, useEffect } from 'react';
import { Activity, User, Clock, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api-client';

interface ActivityItem {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface ActivityFeedProps {
  entity?: string;
  entityId?: string;
  userId?: string;
  limit?: number;
}

export function ActivityFeed({ entity, entityId, userId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [entity, entityId, userId, actionFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = '/activity';
      
      if (entity && entityId) {
        url = `/activity/${entity}/${entityId}`;
      } else {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (actionFilter !== 'all') params.append('action', actionFilter);
        params.append('limit', limit.toString());
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await apiClient.get(url);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionDescription = (activity: ActivityItem) => {
    const { action, entity, user } = activity;
    const userName = `${user.firstName} ${user.lastName}`;
    
    switch (action) {
      case 'CREATE':
        return `${userName} created a ${entity}`;
      case 'UPDATE':
        return `${userName} updated a ${entity}`;
      case 'DELETE':
        return `${userName} deleted a ${entity}`;
      default:
        return `${userName} performed ${action} on ${entity}`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!entity && !entityId && (
        <div className="flex items-center gap-3">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground mt-2">No activity found</p>
        </div>
      ) : (
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {activities.map((activity) => (
            <div key={activity.id} className="relative flex items-start gap-4 pl-2">
              {/* Timeline dot */}
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-border">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getActionDescription(activity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(activity.createdAt)}
                      </span>
                    </div>
                    {activity.changes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                        <details>
                          <summary className="cursor-pointer text-muted-foreground">
                            View changes
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(activity.changes, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
