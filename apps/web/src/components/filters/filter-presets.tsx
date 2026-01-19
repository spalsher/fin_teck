'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, Share2, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/lib/api-client';
import type { FilterCondition } from './filter-builder';

interface FilterPreset {
  id: string;
  name: string;
  entity: string;
  filters: FilterCondition[];
  isPublic: boolean;
  createdAt: string;
}

interface FilterPresetsProps {
  entity: string;
  currentFilters: FilterCondition[];
  onLoadPreset: (filters: FilterCondition[]) => void;
}

export function FilterPresets({ entity, currentFilters, onLoadPreset }: FilterPresetsProps) {
  const { toast } = useToast();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPresets();
  }, [entity]);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/filter-presets/${entity}`);
      setPresets(response.data);
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a preset name',
        variant: 'destructive',
      });
      return;
    }

    if (currentFilters.length === 0) {
      toast({
        title: 'Error',
        description: 'No filters to save',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/filter-presets', {
        name: presetName,
        entity,
        filters: currentFilters,
        isPublic,
      });

      toast({
        title: 'Success',
        description: 'Filter preset saved successfully',
      });

      setSaveDialogOpen(false);
      setPresetName('');
      setIsPublic(false);
      fetchPresets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save preset',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await apiClient.delete(`/filter-presets/${id}`);

      toast({
        title: 'Success',
        description: 'Filter preset deleted',
      });

      fetchPresets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete preset',
        variant: 'destructive',
      });
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset.filters);
    toast({
      title: 'Success',
      description: `Loaded preset: ${preset.name}`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load Preset
                {presets.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {presets.length}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <DropdownMenuLabel>Saved Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {presets.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No saved presets
            </div>
          ) : (
            presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{preset.name}</span>
                    {preset.isPublic ? (
                      <Share2 className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {preset.filters.length} filter{preset.filters.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(preset.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setSaveDialogOpen(true)}
        disabled={currentFilters.length === 0}
      >
        <Save className="mr-2 h-4 w-4" />
        Save Preset
      </Button>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filters for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset Name</label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., High Value Customers"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <label className="text-sm cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                Share with organization (public preset)
              </label>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current Filters:</p>
              <div className="space-y-1">
                {currentFilters.map((filter, idx) => (
                  <p key={filter.id} className="text-xs text-muted-foreground">
                    {idx + 1}. {filter.field} {filter.operator} {filter.value}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
