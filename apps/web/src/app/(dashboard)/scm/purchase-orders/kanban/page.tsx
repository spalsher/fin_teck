'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { KanbanCard } from '@/components/kanban/kanban-card';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

const columns = [
  { id: 'DRAFT', title: 'Draft', color: '#94a3b8' },
  { id: 'SUBMITTED', title: 'Submitted', color: '#3b82f6' },
  { id: 'APPROVED', title: 'Approved', color: '#10b981' },
  { id: 'RECEIVED', title: 'Received', color: '#8b5cf6' },
];

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  vendor?: {
    name: string;
  };
}

export default function PurchaseOrderKanbanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/scm/purchase-orders');
      setPurchaseOrders(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch purchase orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardMove = async (cardId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/scm/purchase-orders/${cardId}/status`, {
        status: newStatus,
      });

      // Update local state
      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === cardId ? { ...po, status: newStatus } : po
        )
      );

      toast({
        title: 'Success',
        description: 'Purchase order status updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
      // Revert on error
      fetchPurchaseOrders();
    }
  };

  const handleCardClick = (po: PurchaseOrder) => {
    router.push(`/scm/purchase-orders/${po.id}`);
  };

  const cards = purchaseOrders.map(po => ({
    id: po.id,
    columnId: po.status,
    title: po.poNumber,
    description: po.vendor?.name || 'Unknown Vendor',
    metadata: {
      amount: `$${po.totalAmount.toFixed(2)}`,
      date: new Date(po.orderDate).toLocaleDateString(),
    },
  }));

  const renderCard = (card: any) => {
    const po = purchaseOrders.find(p => p.id === card.id);
    if (!po) return null;

    return (
      <KanbanCard
        title={po.poNumber}
        description={po.vendor?.name || 'Unknown Vendor'}
        badges={[
          {
            label: `$${po.totalAmount.toFixed(2)}`,
            variant: 'secondary',
          },
          {
            label: new Date(po.orderDate).toLocaleDateString(),
            variant: 'outline',
          },
        ]}
        onClick={() => handleCardClick(po)}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/scm/purchase-orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders - Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop to update status
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <KanbanBoard
          columns={columns}
          cards={cards}
          onCardMove={handleCardMove}
          onCardClick={(card) => {
            const po = purchaseOrders.find(p => p.id === card.id);
            if (po) handleCardClick(po);
          }}
          renderCard={renderCard}
        />
      )}
    </div>
  );
}
