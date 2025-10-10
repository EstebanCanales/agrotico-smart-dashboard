"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  BarChart3,
  Gauge,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  Plus,
  Settings,
  Trash2,
  GripVertical,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Tipos de widgets disponibles
export type WidgetType = "map" | "chart" | "metrics" | "gauge" | "sensors";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
  data?: any;
  isMinimized?: boolean;
}

// Componente de widget individual
const WidgetComponent: React.FC<{
  widget: Widget;
  onRemove: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onUpdateData: (id: string, data: any) => void;
}> = ({ widget, onRemove, onToggleMinimize, onUpdateData }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSizeClasses = () => {
    switch (widget.size) {
      case "small":
        return "col-span-1 row-span-1";
      case "medium":
        return "col-span-2 row-span-1";
      case "large":
        return "col-span-2 row-span-2";
      default:
        return "col-span-1 row-span-1";
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

    switch (widget.type) {
      case "map":
        return <MapWidget data={widget.data} />;
      case "chart":
        return <ChartWidget data={widget.data} />;
      case "metrics":
        return <MetricsWidget data={widget.data} />;
      case "gauge":
        return <GaugeWidget data={widget.data} />;
      case "sensors":
        return <SensorsWidget data={widget.data} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Widget no disponible
          </div>
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`${getSizeClasses()} group`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
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
                className="h-6 w-6 p-0"
              >
                {widget.isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(widget.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">{renderWidgetContent()}</CardContent>
      </Card>
    </div>
  );
};

// Componentes de widgets específicos
const MapWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Map className="h-12 w-12 text-blue-500 mx-auto mb-2" />
      <p className="text-sm text-blue-700 font-medium">Mapa del Robot</p>
      <p className="text-xs text-blue-600">Ubicación en tiempo real</p>
    </div>
  </div>
);

const ChartWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-2" />
      <p className="text-sm text-green-700 font-medium">Gráfico de Datos</p>
      <p className="text-xs text-green-600">Tendencias y análisis</p>
    </div>
  </div>
);

const MetricsWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-50 p-3 rounded-lg text-center">
        <Thermometer className="h-6 w-6 text-blue-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-blue-700">24°C</p>
        <p className="text-xs text-blue-600">Temperatura</p>
      </div>
      <div className="bg-green-50 p-3 rounded-lg text-center">
        <Droplets className="h-6 w-6 text-green-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-green-700">65%</p>
        <p className="text-xs text-green-600">Humedad</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-yellow-50 p-3 rounded-lg text-center">
        <Sun className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-yellow-700">850</p>
        <p className="text-xs text-yellow-600">Lux</p>
      </div>
      <div className="bg-orange-50 p-3 rounded-lg text-center">
        <Leaf className="h-6 w-6 text-orange-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-orange-700">45%</p>
        <p className="text-xs text-orange-600">Suelo</p>
      </div>
    </div>
  </div>
);

const GaugeWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="h-48 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Gauge className="h-12 w-12 text-purple-500 mx-auto mb-2" />
      <p className="text-sm text-purple-700 font-medium">Medidor</p>
      <p className="text-xs text-purple-600">Estado del sistema</p>
    </div>
  </div>
);

const SensorsWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor 1</span>
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Activo
      </Badge>
    </div>
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor 2</span>
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Activo
      </Badge>
    </div>
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor 3</span>
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
        Advertencia
      </Badge>
    </div>
  </div>
);

// Panel de widgets disponibles
const WidgetPalette: React.FC<{
  onAddWidget: (type: WidgetType) => void;
}> = ({ onAddWidget }) => {
  const availableWidgets = [
    {
      type: "map" as WidgetType,
      title: "Mapa",
      icon: Map,
      description: "Ubicación del robot",
    },
    {
      type: "chart" as WidgetType,
      title: "Gráfico",
      icon: BarChart3,
      description: "Datos históricos",
    },
    {
      type: "metrics" as WidgetType,
      title: "Métricas",
      icon: Gauge,
      description: "Valores actuales",
    },
    {
      type: "gauge" as WidgetType,
      title: "Medidor",
      icon: Gauge,
      description: "Estado del sistema",
    },
    {
      type: "sensors" as WidgetType,
      title: "Sensores",
      icon: Thermometer,
      description: "Estado de sensores",
    },
  ];

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Widgets Disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableWidgets.map((widget) => (
          <Button
            key={widget.type}
            variant="outline"
            className="w-full justify-start h-auto p-3"
            onClick={() => onAddWidget(widget.type)}
          >
            <div className="flex items-center space-x-3">
              <widget.icon className="h-4 w-4" />
              <div className="text-left">
                <p className="text-sm font-medium">{widget.title}</p>
                <p className="text-xs text-gray-500">{widget.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

// Función auxiliar para obtener iconos
const getWidgetIcon = (type: WidgetType) => {
  switch (type) {
    case "map":
      return <Map className="h-4 w-4 text-blue-500" />;
    case "chart":
      return <BarChart3 className="h-4 w-4 text-green-500" />;
    case "metrics":
      return <Gauge className="h-4 w-4 text-purple-500" />;
    case "gauge":
      return <Gauge className="h-4 w-4 text-orange-500" />;
    case "sensors":
      return <Thermometer className="h-4 w-4 text-red-500" />;
    default:
      return <div className="h-4 w-4 bg-gray-300 rounded" />;
  }
};

// Componente principal del dashboard
const DragDropDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "1",
      type: "map",
      title: "Mapa del Robot",
      size: "large",
      position: { x: 0, y: 0 },
    },
    {
      id: "2",
      type: "metrics",
      title: "Métricas Actuales",
      size: "medium",
      position: { x: 2, y: 0 },
    },
    {
      id: "3",
      type: "chart",
      title: "Gráfico de Datos",
      size: "medium",
      position: { x: 0, y: 2 },
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: "medium",
      position: { x: 0, y: 0 },
    };

    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setWidgets(
      widgets.map((widget) =>
        widget.id === id
          ? { ...widget, isMinimized: !widget.isMinimized }
          : widget
      )
    );
  };

  const getWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case "map":
        return "Mapa del Robot";
      case "chart":
        return "Gráfico de Datos";
      case "metrics":
        return "Métricas Actuales";
      case "gauge":
        return "Medidor del Sistema";
      case "sensors":
        return "Estado de Sensores";
      default:
        return "Widget";
    }
  };

  return (
    <div className="h-full flex">
      {/* Panel de widgets */}
      <div className="w-64 p-4 border-r bg-gray-50">
        <WidgetPalette onAddWidget={addWidget} />
      </div>

      {/* Área principal del dashboard */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard del Robot
          </h2>
          <p className="text-sm text-gray-600">
            Arrastra y organiza tus widgets
          </p>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-4 gap-4 auto-rows-min">
              {widgets.map((widget) => (
                <WidgetComponent
                  key={widget.id}
                  widget={widget}
                  onRemove={removeWidget}
                  onToggleMinimize={toggleMinimize}
                  onUpdateData={() => {}}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                <WidgetComponent
                  widget={widgets.find((w) => w.id === activeId)!}
                  onRemove={() => {}}
                  onToggleMinimize={() => {}}
                  onUpdateData={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default DragDropDashboard;
