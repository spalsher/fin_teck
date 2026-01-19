'use client';

import { useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
}

interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onCardMove?: (cardId: string, newColumnId: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
  renderCard?: (card: KanbanCard) => React.ReactNode;
}

export function KanbanBoard({
  columns,
  cards,
  onCardMove,
  onCardClick,
  onAddCard,
  renderCard,
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedCard && onCardMove) {
      onCardMove(draggedCard, columnId);
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const getColumnCards = (columnId: string) => {
    return cards.filter(card => card.columnId === columnId);
  };

  const defaultRenderCard = (card: KanbanCard) => (
    <div className="p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
      <h4 className="font-medium text-sm">{card.title}</h4>
      {card.description && (
        <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
      )}
      {card.metadata && Object.keys(card.metadata).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(card.metadata).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {String(value)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnCards = getColumnCards(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className={isDragOver ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {column.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                    )}
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {columnCards.length}
                    </Badge>
                  </div>
                  {onAddCard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onAddCard(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[200px]">
                {columnCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onClick={() => onCardClick?.(card)}
                    className={`cursor-move ${
                      draggedCard === card.id ? 'opacity-50' : ''
                    }`}
                  >
                    {renderCard ? renderCard(card) : defaultRenderCard(card)}
                  </div>
                ))}
                {columnCards.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No items
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
