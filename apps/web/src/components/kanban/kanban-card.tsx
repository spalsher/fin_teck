'use client';

import { MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanCardProps {
  title: string;
  description?: string;
  badges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'outline' | 'destructive' }>;
  actions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
  onClick?: () => void;
}

export function KanbanCard({ title, description, badges, actions, onClick }: KanbanCardProps) {
  return (
    <div
      className="p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm flex-1">{title}</h4>
        {actions && actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      )}

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {badges.map((badge, idx) => (
            <Badge key={idx} variant={badge.variant || 'outline'} className="text-xs">
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
