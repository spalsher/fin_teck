'use client';

import { useState } from 'react';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/lib/api-client';

interface ExportDialogProps {
  entity: string;
  columns: Array<{ key: string; label: string }>;
  filters?: any;
  trigger?: React.ReactNode;
}

export function ExportDialog({ entity, columns, filters, trigger }: ExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(c => c.key));
  const [exporting, setExporting] = useState(false);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(k => k !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns.map(c => c.key));
    }
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one column',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    try {
      const response = await apiClient.post(
        '/export',
        {
          entity,
          filters,
          columns: selectedColumns,
          format,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${entity}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Data exported successfully as ${format.toUpperCase()}`,
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Export failed',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose the format and columns you want to export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    CSV (Comma Separated Values)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON (JavaScript Object Notation)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Columns</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-auto p-1 text-xs"
              >
                {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <label className="text-sm cursor-pointer" onClick={() => handleColumnToggle(column.key)}>
                    {column.label}
                  </label>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedColumns.length} of {columns.length} columns selected
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || selectedColumns.length === 0}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
