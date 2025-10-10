"use client";

import React, { useState, useEffect } from "react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  BarChart3,
  Maximize2,
  Minimize2,
  Trash2,
} from "lucide-react";

// Tipos de widgets
type WidgetType = "chart";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: "small" | "medium" | "large";
  isMinimized?: boolean;
}

interface SimpleDragDropDashboardProps {
  sensorData?: any;
  historicalData?: any;
  onGenerateRecord?: () => void;
  robotUuid: string;
  widgetOrder: string[];
  onWidgetOrderChange: (order: string[]) => void;
}

const SimpleDragDropDashboard: React.FC<SimpleDragDropDashboardProps> = ({
  sensorData,
  historicalData,
  onGenerateRecord,
  robotUuid,
  widgetOrder,
  onWidgetOrderChange,
}) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Inicializar widgets basado en el orden - Solo gráfica
  useEffect(() => {
    const widgetMap = {
      chart: {
        id: "1",
        type: "chart" as WidgetType,
        title: "Gráfico de Datos",
        size: "large" as const,
      },
    };

    const orderedWidgets = widgetOrder
      .map((type) => widgetMap[type as keyof typeof widgetMap])
      .filter(Boolean);

    setWidgets(orderedWidgets);
  }, [widgetOrder]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Actualizar el orden en el componente padre
        const newOrder = newItems.map((item) => {
          switch (item.type) {
            case "chart":
              return "chart";
            default:
              return item.type;
          }
        });
        onWidgetOrderChange(newOrder);

        return newItems;
      });
    }

    setActiveId(null);
    setIsDragging(false);
  };

  const removeWidget = (id: string) => {
    setWidgets((items) => items.filter((item) => item.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setWidgets((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isMinimized: !item.isMinimized } : item
      )
    );
  };

  const getWidgetIcon = (type: WidgetType) => {
    switch (type) {
      case "chart":
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded" />;
    }
  };

  // Componente de widget individual
  const WidgetComponent: React.FC<{
    widget: Widget;
    onRemove: (id: string) => void;
    onToggleMinimize: (id: string) => void;
    sensorData?: any;
    historicalData?: any;
    onGenerateRecord?: () => void;
  }> = ({ widget, onRemove, onToggleMinimize }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging,
    } = useSortable({ id: widget.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isItemDragging ? 10 : 0,
    };

    const getSizeClasses = () => {
      switch (widget.size) {
        case "small":
          return "w-64 h-48";
        case "medium":
          return "w-80 h-64";
        case "large":
          return "w-96 h-80";
        default:
          return "w-64 h-48";
      }
    };

    const renderWidgetContent = () => {
      if (widget.isMinimized) {
        return (
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-2">
              {getWidgetIcon(widget.type)}
              <span className="text-sm font-medium">{widget.title}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="h-full min-h-[300px] bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-green-700 font-medium">
              Gráfico de Datos
            </p>
            <p className="text-sm text-green-600">
              Datos históricos de sensores
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Arrastra para reorganizar
            </p>
          </div>
        </div>
      );
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${getSizeClasses()} group`}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-green-500" />
                </div>
                {getWidgetIcon(widget.type)}
                <CardTitle className="text-sm font-medium">
                  {widget.title}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleMinimize(widget.id)}
                  className="h-7 w-7 p-0 hover:bg-gray-100"
                >
                  {widget.isMinimized ? (
                    <Maximize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(widget.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">{renderWidgetContent()}</CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Organización de la Gráfica
          </h1>
          <p className="text-slate-600">
            Arrastra la gráfica para reorganizar su posición en el dashboard.
          </p>
        </div>

        <DndContext
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex justify-center">
            <SortableContext
              items={widgets.map((w) => w.id)}
              strategy={rectSortingStrategy}
            >
              {widgets.map((widget) => (
                <WidgetComponent
                  key={widget.id}
                  widget={widget}
                  onRemove={removeWidget}
                  onToggleMinimize={toggleMinimize}
                  sensorData={sensorData}
                  historicalData={historicalData}
                  onGenerateRecord={onGenerateRecord}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-50 rotate-3 scale-105">
                <WidgetComponent
                  widget={widgets.find((w) => w.id === activeId)!}
                  onRemove={() => {}}
                  onToggleMinimize={() => {}}
                  sensorData={sensorData}
                  historicalData={historicalData}
                  onGenerateRecord={onGenerateRecord}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Indicador de arrastre */}
        {isDragging && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium text-slate-800">
                Reorganizando gráfica...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDragDropDashboard;
