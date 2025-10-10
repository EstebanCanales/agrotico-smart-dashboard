"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Zap,
  TrendingUp,
  BarChart3,
  Activity,
  Settings,
  Database,
  Download,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  Calendar,
  Clock,
} from "lucide-react";
import { SensorData } from "@/actions/sensors";

interface HistoricalDataPoint {
  timestamp: string;
  temperatura_celsius: number;
  humedad_pct: number;
  lux: number;
  humedad_suelo: number;
  co2_ppm: number;
  presion_hpa: number;
  indice_uv: number;
  temperatura_suelo_celsius: number;
}

interface RobotChartsProps {
  sensorData: SensorData | null;
  historicalData: HistoricalDataPoint[];
  onGenerateRecord?: () => void;
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

export default function RobotCharts({
  sensorData,
  historicalData = [],
  onGenerateRecord,
}: RobotChartsProps) {
  const [dataLimit, setDataLimit] = useState<"20" | "50" | "100" | "200">("20");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeRange, setTimeRange] = useState<
    "1h" | "6h" | "24h" | "7d" | "30d" | "custom"
  >("24h");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Filtrar datos según el rango de tiempo y cantidad de registros
  const getFilteredData = useMemo(() => {
    if (!historicalData.length) {
      return [];
    }

    let filteredData = [...historicalData];
    const now = new Date();

    // Filtrar por rango de tiempo
    if (timeRange !== "custom") {
      let startTime: Date;

      switch (timeRange) {
        case "1h":
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "6h":
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const beforeFilter = filteredData.length;
      filteredData = filteredData.filter(
        (point) => new Date(point.timestamp) >= startTime
      );

      // Si no hay datos después del filtro de tiempo, mostrar todos los datos disponibles
      if (filteredData.length === 0) {
        filteredData = [...historicalData];
      }
    } else if (customStartDate && customEndDate) {
      // Filtro personalizado por fechas
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);

      const beforeFilter = filteredData.length;
      filteredData = filteredData.filter((point) => {
        const pointDate = new Date(point.timestamp);
        return pointDate >= startDate && pointDate <= endDate;
      });

      // Si no hay datos después del filtro personalizado, mostrar todos los datos disponibles
      if (filteredData.length === 0) {
        filteredData = [...historicalData];
      }
    }

    // Aplicar límite de registros
    const limit = parseInt(dataLimit);
    const finalData = filteredData.slice(-limit);
    return finalData;
  }, [historicalData, dataLimit, timeRange, customStartDate, customEndDate]);

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    return getFilteredData.map((point, index) => {
      const pointDate = new Date(point.timestamp);

      // Mostrar fecha y hora para rangos largos, solo hora para rangos cortos
      const showDate =
        timeRange === "7d" || timeRange === "30d" || timeRange === "custom";

      return {
        time: showDate
          ? pointDate.toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : pointDate.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        date: pointDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
        }),
        timestamp: point.timestamp,
        temperatura: point.temperatura_celsius,
        humedad: point.humedad_pct,
        co2: point.co2_ppm,
        luz: point.lux,
        humedad_suelo: point.humedad_suelo,
        presion: point.presion_hpa,
        indice_uv: point.indice_uv,
        temperatura_suelo: point.temperatura_suelo_celsius,
      };
    });
  }, [getFilteredData, historicalData, timeRange]);

  // Configuración de gráficos individuales
  const individualMetrics = [
    {
      key: "temperatura",
      label: "Temperatura",
      icon: Thermometer,
      color: "bg-white",
      iconColor: "text-red-600",
      chartColor: "#EF4444",
      unit: "°C",
      min: 0,
      max: 40,
    },
    {
      key: "presion",
      label: "Presión",
      icon: Wind,
      color: "bg-white",
      iconColor: "text-purple-600",
      chartColor: "#8B5CF6",
      unit: "hPa",
      min: 0,
      max: 1000,
    },
    {
      key: "humedad",
      label: "Humedad",
      icon: Droplets,
      color: "bg-white",
      iconColor: "text-blue-600",
      chartColor: "#3B82F6",
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      key: "co2",
      label: "CO2",
      icon: Activity,
      color: "bg-white",
      iconColor: "text-gray-600",
      chartColor: "#6B7280",
      unit: "ppm",
      min: 0,
      max: 400,
    },
    {
      key: "luz",
      label: "Luz",
      icon: Sun,
      color: "bg-white",
      iconColor: "text-yellow-600",
      chartColor: "#F59E0B",
      unit: "lux",
      min: 0,
      max: 1000,
    },
    {
      key: "indice_uv",
      label: "Índice UV",
      icon: Sun,
      color: "bg-white",
      iconColor: "text-orange-600",
      chartColor: "#F97316",
      unit: "UV",
      min: 0,
      max: 3,
    },
    {
      key: "humedad_suelo",
      label: "Humedad Suelo",
      icon: Activity,
      color: "bg-white",
      iconColor: "text-green-600",
      chartColor: "#10B981",
      unit: "adc",
      min: 200,
      max: 600,
    },
    {
      key: "temperatura_suelo",
      label: "Temp. Suelo",
      icon: Thermometer,
      color: "bg-white",
      iconColor: "text-amber-600",
      chartColor: "#F59E0B",
      unit: "°C",
      min: 10,
      max: 40,
    },
  ];

  const renderIndividualChart = (metric: any) => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-2 text-slate-400" />
            <p className="text-lg font-medium">
              No hay datos históricos disponibles
            </p>
            <p className="text-sm mb-3">
              {historicalData.length === 0
                ? "No se encontraron registros históricos para este robot"
                : `Se encontraron ${historicalData.length} registros, pero ninguno coincide con el filtro seleccionado`}
            </p>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">💡 Intenta:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTimeRange("24h")}
                  className="text-xs"
                >
                  Cambiar a 24h
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDataLimit("200")}
                  className="text-xs"
                >
                  Más registros
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTimeRange("custom")}
                  className="text-xs"
                >
                  Rango personalizado
                </Button>
                {onGenerateRecord && (
                  <Button
                    size="sm"
                    onClick={onGenerateRecord}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    style={{ backgroundColor: "#0057a3" }}
                  >
                    Generar datos
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 20, left: 10, bottom: 10 },
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
            <p className="font-medium text-slate-900 mb-3">{label}</p>
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.chartColor }}
                />
                <span className="text-sm font-medium text-slate-700">
                  {metric.label}:
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {payload[0].value.toFixed(1)} {metric.unit}
              </span>
            </div>
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[metric.min || "auto", metric.max || "auto"]}
                label={{
                  value: metric.unit || "Valores",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={metric.key}
                stroke={metric.chartColor}
                strokeWidth={3}
                name={metric.label}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[metric.min || "auto", metric.max || "auto"]}
                label={{
                  value: metric.unit || "Valores",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={metric.key}
                fill={metric.chartColor}
                radius={[4, 4, 0, 0]}
                name={metric.label}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[metric.min || "auto", metric.max || "auto"]}
                label={{
                  value: metric.unit || "Valores",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric.key}
                stroke={metric.chartColor}
                fill={metric.chartColor}
                fillOpacity={0.3}
                name={metric.label}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`space-y-6 ${
        isFullscreen ? "fixed inset-0 z-50 bg-white p-6 overflow-auto" : ""
      }`}
    >
      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white rounded-md border border-slate-200">
        <div className="flex items-center space-x-4">
          {/* Rango de tiempo */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Período:</span>
            <div className="flex space-x-1">
              {[
                { value: "1h", label: "1h" },
                { value: "6h", label: "6h" },
                { value: "24h", label: "24h" },
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
                { value: "custom", label: "Personalizado" },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={timeRange === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(value as any)}
                  className="h-7 px-2 text-xs font-medium"
                  style={
                    timeRange === value ? { backgroundColor: "#0057a3" } : {}
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Fechas personalizadas */}
          {timeRange === "custom" && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="datetime-local"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-7 px-2 text-xs border border-slate-300 rounded-md"
                placeholder="Fecha inicio"
              />
              <span className="text-xs text-slate-500">a</span>
              <input
                type="datetime-local"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-7 px-2 text-xs border border-slate-300 rounded-md"
                placeholder="Fecha fin"
              />
            </div>
          )}

          {/* Cantidad de registros */}
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              Registros:
            </span>
            <div className="flex space-x-1">
              {["20", "50", "100", "200"].map((limit) => (
                <Button
                  key={limit}
                  variant={dataLimit === limit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDataLimit(limit as any)}
                  className="h-7 px-2 text-xs font-medium"
                  style={
                    dataLimit === limit ? { backgroundColor: "#4caf50" } : {}
                  }
                >
                  {limit}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              Tipo de gráfico:
            </span>
            <div className="flex space-x-1">
              {[
                {
                  type: "line",
                  label: "Línea",
                  icon: <TrendingUp className="h-3 w-3" />,
                },
                {
                  type: "bar",
                  label: "Barras",
                  icon: <BarChart3 className="h-3 w-3" />,
                },
                {
                  type: "area",
                  label: "Área",
                  icon: <Activity className="h-3 w-3" />,
                },
              ].map(({ type, label, icon }) => (
                <Button
                  key={type}
                  variant={chartType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType(type as any)}
                  className="h-7 px-2 text-xs font-medium flex items-center space-x-1"
                  style={
                    chartType === type ? { backgroundColor: "#0057a3" } : {}
                  }
                >
                  {icon}
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 px-3"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-8 px-3"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Información del rango seleccionado */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              Mostrando datos de:
            </span>
            <Badge variant="outline" className="text-xs">
              {timeRange === "custom"
                ? `${
                    customStartDate
                      ? new Date(customStartDate).toLocaleDateString("es-ES")
                      : "Inicio"
                  } - ${
                    customEndDate
                      ? new Date(customEndDate).toLocaleDateString("es-ES")
                      : "Fin"
                  }`
                : timeRange === "1h"
                ? "Última hora"
                : timeRange === "6h"
                ? "Últimas 6 horas"
                : timeRange === "24h"
                ? "Últimas 24 horas"
                : timeRange === "7d"
                ? "Últimos 7 días"
                : timeRange === "30d"
                ? "Últimos 30 días"
                : "Período personalizado"}
            </Badge>
          </div>
          <div className="text-xs text-slate-500">
            {getFilteredData.length} registros encontrados
          </div>
        </div>
      </div>

      {/* Gráficos individuales por métrica */}
      <div className="grid grid-cols-2 gap-4">
        {individualMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card
              key={index}
              className={`${metric.color} border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 rounded-lg`}
            >
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                  <div className="p-1.5 rounded-md bg-slate-100">
                    <IconComponent className={`h-4 w-4 ${metric.iconColor}`} />
                  </div>
                  <span className="text-slate-700">{metric.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full px-4 pb-4">
                <div className="h-auto">{renderIndividualChart(metric)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Datos climáticos */}
      {sensorData?.climate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Datos Climáticos Satelitales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Thermometer className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Temp. 2m</p>
                <p className="text-lg font-bold text-slate-900">
                  {sensorData.climate.temperatura_2m.toFixed(1)}°C
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Wind className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Viento</p>
                <p className="text-lg font-bold text-slate-900">
                  {sensorData.climate.velocidad_viento.toFixed(1)} m/s
                </p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">Radiación</p>
                <p className="text-lg font-bold text-slate-900">
                  {sensorData.climate.radiacion_onda_corta.toFixed(0)} W/m²
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Droplets className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">
                  Precipitación
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {sensorData.climate.precipitacion_corregida.toFixed(1)} mm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spacing adicional al final */}
      <div className="h-8"></div>
    </div>
  );
}
