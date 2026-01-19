'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityFeed } from './activity-feed';

interface EntityActivityProps {
  entity: string;
  entityId: string;
  title?: string;
}

export function EntityActivity({ entity, entityId, title = 'Activity History' }: EntityActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          View all changes and actions performed on this record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityFeed entity={entity} entityId={entityId} />
      </CardContent>
    </Card>
  );
}
