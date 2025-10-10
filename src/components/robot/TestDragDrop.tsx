"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

interface TestItem {
  id: string;
  title: string;
  color: string;
}

const TestItemComponent: React.FC<{ item: TestItem }> = ({ item }) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="col-span-1">
      <Card className={`h-32 ${item.color} hover:shadow-lg transition-all`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <GripVertical className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-sm font-medium text-white">
                {item.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-white/80">Arrastra para mover</p>
        </CardContent>
      </Card>
    </div>
  );
};

const TestDragDrop: React.FC = () => {
  const [items, setItems] = useState<TestItem[]>([
    { id: "1", title: "Item 1", color: "bg-blue-500" },
    { id: "2", title: "Item 2", color: "bg-green-500" },
    { id: "3", title: "Item 3", color: "bg-purple-500" },
    { id: "4", title: "Item 4", color: "bg-red-500" },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
    setIsDragging(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Drag & Drop</h1>
      <p className="text-gray-600 mb-6">
        Arrastra los elementos para reorganizarlos
      </p>

      {isDragging && (
        <div className="mb-4 flex items-center space-x-2 text-blue-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">Arrastrando...</span>
        </div>
      )}

      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-4 gap-4">
            {items.map((item) => (
              <TestItemComponent key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-80 rotate-3 scale-105 shadow-2xl">
              <TestItemComponent item={items.find((i) => i.id === activeId)!} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TestDragDrop;



