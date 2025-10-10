"use client";

import React, { useState, useCallback } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
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
  RotateCcw,
} from "lucide-react";

// Importar react-grid-layout CSS
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Tipos de widgets disponibles
export type WidgetType =
  | "map"
  | "chart"
  | "metrics"
  | "gauge"
  | "sensors"
  | "alerts"
  | "weather";

export interface Widget {
  i: string;
  type: WidgetType;
  title: string;
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
      case "alerts":
        return <AlertsWidget data={widget.data} />;
      case "weather":
        return <WeatherWidget data={widget.data} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Widget no disponible
          </div>
        );
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="cursor-move p-1 hover:bg-gray-100 rounded">
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
              onClick={() => onToggleMinimize(widget.i)}
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
              onClick={() => onRemove(widget.i)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{renderWidgetContent()}</CardContent>
    </Card>
  );
};

// Componentes de widgets específicos
const MapWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="h-full min-h-[200px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <Map className="h-12 w-12 text-blue-500 mx-auto mb-2" />
      <p className="text-sm text-blue-700 font-medium">Mapa del Robot</p>
      <p className="text-xs text-blue-600">Ubicación en tiempo real</p>
      <div className="mt-2 text-xs text-blue-500">Lat: 9.5°N, Lng: -84.0°W</div>
    </div>
  </div>
);

const ChartWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="h-full min-h-[200px] bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-2" />
      <p className="text-sm text-green-700 font-medium">Gráfico de Datos</p>
      <p className="text-xs text-green-600">Tendencias y análisis</p>
      <div className="mt-2 flex justify-center space-x-1">
        <div className="w-2 h-8 bg-green-400 rounded"></div>
        <div className="w-2 h-12 bg-green-500 rounded"></div>
        <div className="w-2 h-6 bg-green-400 rounded"></div>
        <div className="w-2 h-10 bg-green-500 rounded"></div>
      </div>
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
  <div className="h-full min-h-[200px] bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <div className="absolute inset-0 rounded-full border-8 border-purple-200"></div>
        <div className="absolute inset-0 rounded-full border-8 border-purple-500 border-t-transparent transform rotate-45"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-purple-700">75%</span>
        </div>
      </div>
      <p className="text-sm text-purple-700 font-medium">Estado del Sistema</p>
      <p className="text-xs text-purple-600">Salud general</p>
    </div>
  </div>
);

const SensorsWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor de Temperatura</span>
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Activo
      </Badge>
    </div>
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor de Humedad</span>
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Activo
      </Badge>
    </div>
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor de Luz</span>
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
        Advertencia
      </Badge>
    </div>
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm">Sensor de Suelo</span>
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Activo
      </Badge>
    </div>
  </div>
);

const AlertsWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="space-y-2">
    <div className="p-2 bg-red-50 border border-red-200 rounded">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm text-red-700">Temperatura alta detectada</span>
      </div>
      <p className="text-xs text-red-600 mt-1">Hace 5 minutos</p>
    </div>
    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-sm text-yellow-700">Humedad del suelo baja</span>
      </div>
      <p className="text-xs text-yellow-600 mt-1">Hace 15 minutos</p>
    </div>
    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-blue-700">
          Sistema funcionando normal
        </span>
      </div>
      <p className="text-xs text-blue-600 mt-1">Hace 1 hora</p>
    </div>
  </div>
);

const WeatherWidget: React.FC<{ data?: any }> = ({ data }) => (
  <div className="h-full min-h-[200px] bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4">
    <div className="text-center">
      <Sun className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
      <p className="text-lg font-bold text-sky-700">28°C</p>
      <p className="text-sm text-sky-600">Soleado</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/50 p-2 rounded">
          <p className="text-sky-700">Viento</p>
          <p className="font-medium">12 km/h</p>
        </div>
        <div className="bg-white/50 p-2 rounded">
          <p className="text-sky-700">Humedad</p>
          <p className="font-medium">68%</p>
        </div>
      </div>
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
      color: "blue",
    },
    {
      type: "chart" as WidgetType,
      title: "Gráfico",
      icon: BarChart3,
      description: "Datos históricos",
      color: "green",
    },
    {
      type: "metrics" as WidgetType,
      title: "Métricas",
      icon: Gauge,
      description: "Valores actuales",
      color: "purple",
    },
    {
      type: "gauge" as WidgetType,
      title: "Medidor",
      icon: Gauge,
      description: "Estado del sistema",
      color: "orange",
    },
    {
      type: "sensors" as WidgetType,
      title: "Sensores",
      icon: Thermometer,
      description: "Estado de sensores",
      color: "red",
    },
    {
      type: "alerts" as WidgetType,
      title: "Alertas",
      icon: Settings,
      description: "Notificaciones",
      color: "yellow",
    },
    {
      type: "weather" as WidgetType,
      title: "Clima",
      icon: Sun,
      description: "Condiciones actuales",
      color: "sky",
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
            className="w-full justify-start h-auto p-3 hover:shadow-md transition-shadow"
            onClick={() => onAddWidget(widget.type)}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${widget.color}-50`}>
                <widget.icon className={`h-4 w-4 text-${widget.color}-500`} />
              </div>
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
    case "alerts":
      return <Settings className="h-4 w-4 text-yellow-500" />;
    case "weather":
      return <Sun className="h-4 w-4 text-sky-500" />;
    default:
      return <div className="h-4 w-4 bg-gray-300 rounded" />;
  }
};

// Componente principal del dashboard
const GridDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      i: "map",
      type: "map",
      title: "Mapa del Robot",
    },
    {
      i: "metrics",
      type: "metrics",
      title: "Métricas Actuales",
    },
    {
      i: "chart",
      type: "chart",
      title: "Gráfico de Datos",
    },
    {
      i: "sensors",
      type: "sensors",
      title: "Estado de Sensores",
    },
  ]);

  const [layout, setLayout] = useState<Layout[]>([
    { i: "map", x: 0, y: 0, w: 6, h: 4 },
    { i: "metrics", x: 6, y: 0, w: 6, h: 2 },
    { i: "chart", x: 6, y: 2, w: 6, h: 2 },
    { i: "sensors", x: 0, y: 4, w: 6, h: 2 },
  ]);

  const addWidget = (type: WidgetType) => {
    const newId = `${type}-${Date.now()}`;
    const newWidget: Widget = {
      i: newId,
      type,
      title: getWidgetTitle(type),
    };

    // Encontrar una posición libre
    const newLayout = {
      i: newId,
      x: 0,
      y: Math.max(...layout.map((l) => l.y + l.h), 0),
      w: getDefaultWidth(type),
      h: getDefaultHeight(type),
    };

    setWidgets([...widgets, newWidget]);
    setLayout([...layout, newLayout]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.i !== id));
    setLayout(layout.filter((item) => item.i !== id));
  };

  const toggleMinimize = (id: string) => {
    setWidgets(
      widgets.map((widget) =>
        widget.i === id
          ? { ...widget, isMinimized: !widget.isMinimized }
          : widget
      )
    );
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const resetLayout = () => {
    setLayout([
      { i: "map", x: 0, y: 0, w: 6, h: 4 },
      { i: "metrics", x: 6, y: 0, w: 6, h: 2 },
      { i: "chart", x: 6, y: 2, w: 6, h: 2 },
      { i: "sensors", x: 0, y: 4, w: 6, h: 2 },
    ]);
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
      case "alerts":
        return "Alertas del Sistema";
      case "weather":
        return "Condiciones Climáticas";
      default:
        return "Widget";
    }
  };

  const getDefaultWidth = (type: WidgetType): number => {
    switch (type) {
      case "map":
        return 6;
      case "chart":
        return 6;
      case "metrics":
        return 6;
      case "gauge":
        return 3;
      case "sensors":
        return 6;
      case "alerts":
        return 3;
      case "weather":
        return 3;
      default:
        return 3;
    }
  };

  const getDefaultHeight = (type: WidgetType): number => {
    switch (type) {
      case "map":
        return 4;
      case "chart":
        return 3;
      case "metrics":
        return 2;
      case "gauge":
        return 3;
      case "sensors":
        return 2;
      case "alerts":
        return 4;
      case "weather":
        return 3;
      default:
        return 2;
    }
  };

  return (
    <div className="h-full flex">
      {/* Panel de widgets */}
      <div className="w-64 p-4 border-r bg-gray-50">
        <WidgetPalette onAddWidget={addWidget} />
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Layout
          </Button>
        </div>
      </div>

      {/* Área principal del dashboard */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Dashboard del Robot
            </h2>
            <p className="text-sm text-gray-600">
              Arrastra, redimensiona y organiza tus widgets
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {widgets.length} widgets activos
          </Badge>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {widgets.map((widget) => (
              <div key={widget.i} className="widget-container">
                <WidgetComponent
                  widget={widget}
                  onRemove={removeWidget}
                  onToggleMinimize={toggleMinimize}
                  onUpdateData={() => {}}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    </div>
  );
};

export default GridDashboard;
