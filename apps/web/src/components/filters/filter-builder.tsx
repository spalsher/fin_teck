'use client';

import { useState } from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface FilterBuilderProps {
  fields: FilterField[];
  filters: FilterCondition[];
  onChange: (filters: FilterCondition[]) => void;
}

const operators = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'in', label: 'In' },
  ],
};

export function FilterBuilder({ fields, filters, onChange }: FilterBuilderProps) {
  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: fields[0]?.key || '',
      operator: 'equals',
      value: '',
    };
    onChange([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onChange(
      filters.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const clearAll = () => {
    onChange([]);
  };

  const getFieldType = (fieldKey: string): FilterField['type'] => {
    const field = fields.find(f => f.key === fieldKey);
    return field?.type || 'text';
  };

  const getOperators = (fieldKey: string) => {
    const type = getFieldType(fieldKey);
    return operators[type] || operators.text;
  };

  const getFieldOptions = (fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    return field?.options || [];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
            <CardDescription>
              Build complex filters to narrow down your results
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {filters.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
            <Button size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-1" />
              Add Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No filters applied. Click &quot;Add Filter&quot; to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-sm font-medium text-muted-foreground w-12">
                    AND
                  </span>
                )}
                {index === 0 && <div className="w-12" />}

                <Select
                  value={filter.field}
                  onValueChange={(value) => updateFilter(filter.id, { field: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperators(filter.field).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {getFieldType(filter.field) === 'select' ? (
                  <Select
                    value={filter.value}
                    onValueChange={(value) => updateFilter(filter.id, { value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldOptions(filter.field).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={getFieldType(filter.field) === 'number' ? 'number' : getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Enter value"
                    className="flex-1"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
