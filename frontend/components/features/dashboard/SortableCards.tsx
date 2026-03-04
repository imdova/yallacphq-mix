"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface SortableCardItem {
  id: string;
  title: string;
  description?: string;
}

interface SortableCardsProps {
  items: SortableCardItem[];
  onReorder: (items: SortableCardItem[]) => void;
  className?: string;
}

function SortableCard({
  item,
  className,
}: {
  item: SortableCardItem;
  className?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(isDragging && "z-50 opacity-90 shadow-lg", className)}
    >
      <Card
        ref={setNodeRef}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-shadow",
          isDragging && "ring-2 ring-primary shadow-md"
        )}
      >
        <CardHeader
          className="flex flex-row items-center gap-2 space-y-0 py-3 px-4"
          {...attributes}
          {...listeners}
        >
          <span className="text-muted-foreground">⋮⋮</span>
          <span className="font-medium">{item.title}</span>
        </CardHeader>
        {item.description && (
          <CardContent className="pt-0 px-4 pb-4 text-sm text-muted-foreground">
            {item.description}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export function SortableCards({ items, onReorder, className }: SortableCardsProps) {
  const [localItems, setLocalItems] = React.useState(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(next);
    onReorder(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-2", className)}>
          <AnimatePresence mode="popLayout">
            {localItems.map((item) => (
              <SortableCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
