'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Permission {
  id: string;
  module: string;
  entity: string;
  action: string;
  key: string;
}

interface PermissionTreeProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onModuleToggle: (module: string, allPermissionIds: string[]) => void;
}

export function PermissionTree({
  permissions,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
}: PermissionTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  // Group permissions by module and entity
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = {};
    }
    if (!acc[perm.module][perm.entity]) {
      acc[perm.module][perm.entity] = [];
    }
    acc[perm.module][perm.entity].push(perm);
    return acc;
  }, {} as Record<string, Record<string, Permission[]>>);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const toggleEntity = (moduleEntity: string) => {
    const newExpanded = new Set(expandedEntities);
    if (newExpanded.has(moduleEntity)) {
      newExpanded.delete(moduleEntity);
    } else {
      newExpanded.add(moduleEntity);
    }
    setExpandedEntities(newExpanded);
  };

  const getModulePermissionIds = (module: string): string[] => {
    const modulePerms: string[] = [];
    Object.values(groupedPermissions[module] || {}).forEach(entityPerms => {
      entityPerms.forEach(perm => modulePerms.push(perm.id));
    });
    return modulePerms;
  };

  const isModuleFullySelected = (module: string): boolean => {
    const modulePermIds = getModulePermissionIds(module);
    return modulePermIds.length > 0 && modulePermIds.every(id => selectedPermissions.includes(id));
  };

  const isModulePartiallySelected = (module: string): boolean => {
    const modulePermIds = getModulePermissionIds(module);
    return modulePermIds.some(id => selectedPermissions.includes(id)) && !isModuleFullySelected(module);
  };

  const handleModuleSelectAll = (module: string) => {
    const modulePermIds = getModulePermissionIds(module);
    onModuleToggle(module, modulePermIds);
  };

  const formatModuleName = (module: string) => {
    return module
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatEntityName = (entity: string) => {
    return entity
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatActionName = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-100 text-blue-800',
      auth: 'bg-purple-100 text-purple-800',
      finance: 'bg-green-100 text-green-800',
      scm: 'bg-orange-100 text-orange-800',
      asset: 'bg-cyan-100 text-cyan-800',
      hrms: 'bg-pink-100 text-pink-800',
      manufacturing: 'bg-indigo-100 text-indigo-800',
      report: 'bg-yellow-100 text-yellow-800',
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-2">
      {Object.entries(groupedPermissions).map(([module, entities]) => {
        const isExpanded = expandedModules.has(module);
        const isFullySelected = isModuleFullySelected(module);
        const isPartiallySelected = isModulePartiallySelected(module);

        return (
          <div key={module} className="border rounded-lg">
            <div className="flex items-center gap-3 p-3 bg-muted/50">
              <button
                onClick={() => toggleModule(module)}
                className="p-1 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <Checkbox
                checked={isFullySelected}
                onCheckedChange={() => handleModuleSelectAll(module)}
                className={isPartiallySelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />

              <div className="flex-1 flex items-center gap-3">
                <Badge className={getModuleColor(module)}>
                  {formatModuleName(module)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedPermissions.filter(id => 
                    getModulePermissionIds(module).includes(id)
                  ).length} / {getModulePermissionIds(module).length} selected
                </span>
              </div>
            </div>

            {isExpanded && (
              <div className="p-3 space-y-2">
                {Object.entries(entities).map(([entity, perms]) => {
                  const entityKey = `${module}-${entity}`;
                  const isEntityExpanded = expandedEntities.has(entityKey);

                  return (
                    <div key={entityKey} className="ml-8 border-l-2 pl-4">
                      <div className="flex items-center gap-3 py-2">
                        <button
                          onClick={() => toggleEntity(entityKey)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {isEntityExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>

                        <span className="font-medium text-sm">
                          {formatEntityName(entity)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({perms.length} permissions)
                        </span>
                      </div>

                      {isEntityExpanded && (
                        <div className="ml-8 space-y-2 mt-2">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center gap-3 py-1.5"
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(perm.id)}
                                onCheckedChange={() => onPermissionToggle(perm.id)}
                              />
                              <span className="text-sm">
                                {formatActionName(perm.action)}
                              </span>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                {perm.key}
                              </code>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
