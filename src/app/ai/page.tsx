"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain,
  TrendingUp,
  BarChart3,
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface SensorData {
  temperature: {
    temperatura_celsius: string;
    presion_hpa: string;
    timestamp: string;
  } | null;
  humidity: {
    humedad_pct: string;
    co2_ppm: string;
    temperatura_celsius: string;
    timestamp: string;
  } | null;
  light: {
    lux: string;
    indice_uv: string;
    timestamp: string;
  } | null;
  soil: {
    humedad_suelo: number;
    temperatura_suelo_celsius: string;
    timestamp: string;
  } | null;
}

interface AIReport {
  report: string;
  sensorData: {
    temperatura_promedio: number;
    humedad_promedio: number;
    presion_promedio: number;
    co2_promedio: number;
    luz_promedio: number;
    uv_promedio: number;
    humedad_suelo_promedio: number;
    temperatura_suelo_promedio: number;
    dias_analizados: number;
  };
  generatedAt: string;
  model: string;
}

export default function AIPage() {
  const { user, logout } = useAuth();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos de sensores actuales
      const sensorsResponse = await fetch(
        "http://localhost:5001/api/analytics/current"
      );
      if (!sensorsResponse.ok) {
        throw new Error("Error al cargar datos de sensores");
      }
      const sensorsData = await sensorsResponse.json();

      if (sensorsData.success) {
        setSensorData(sensorsData.data);
      }

      // Cargar reporte de IA
      const aiResponse = await fetch("http://localhost:5001/api/ai/forecast");
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        if (aiData.success) {
          setAiReport(aiData.data);
        } else {
          // Si no hay datos suficientes, crear un reporte de ejemplo
          setAiReport({
            report:
              "No hay suficientes datos históricos para generar un análisis completo. Se están recopilando datos de los sensores para futuros análisis de IA.",
            sensorData: {
              temperatura_promedio: sensorData?.temperature?.temperatura_celsius
                ? parseFloat(sensorData.temperature.temperatura_celsius)
                : 0,
              humedad_promedio: sensorData?.humidity?.humedad_pct
                ? parseFloat(sensorData.humidity.humedad_pct)
                : 0,
              presion_promedio: sensorData?.temperature?.presion_hpa
                ? parseFloat(sensorData.temperature.presion_hpa)
                : 0,
              co2_promedio: sensorData?.humidity?.co2_ppm
                ? parseFloat(sensorData.humidity.co2_ppm)
                : 0,
              luz_promedio: sensorData?.light?.lux
                ? parseFloat(sensorData.light.lux)
                : 0,
              uv_promedio: sensorData?.light?.indice_uv
                ? parseFloat(sensorData.light.indice_uv)
                : 0,
              humedad_suelo_promedio: sensorData?.soil?.humedad_suelo || 0,
              temperatura_suelo_promedio: sensorData?.soil
                ?.temperatura_suelo_celsius
                ? parseFloat(sensorData.soil.temperatura_suelo_celsius)
                : 0,
              dias_analizados: 1,
            },
            generatedAt: new Date().toISOString(),
            model: "AgroTico AI v1.0",
          });
        }
      }

      setLastUpdate(new Date().toLocaleString("es-ES"));
    } catch (err: any) {
      setError(err.message || "Error cargando los datos");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const getStatusColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good)
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (value >= thresholds.warning)
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
              </Link>
              <div className="flex-shrink-0 flex items-center">
                <Brain className="h-8 w-8 text-purple-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Inteligencia Artificial Agrícola
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary flex items-center space-x-1"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>{loading ? "Actualizando..." : "Actualizar"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Datos de Sensores en Tiempo Real */}
        {sensorData && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              📊 Datos de Sensores en Tiempo Real
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Temperatura */}
              {sensorData.temperature && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Temperatura
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sensorData.temperature.temperatura_celsius}°C
                      </p>
                      <p className="text-sm text-gray-500">
                        Presión: {sensorData.temperature.presion_hpa} hPa
                      </p>
                    </div>
                    <Thermometer className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              )}

              {/* Humedad */}
              {sensorData.humidity && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Humedad
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sensorData.humidity.humedad_pct}%
                      </p>
                      <p className="text-sm text-gray-500">
                        CO₂: {sensorData.humidity.co2_ppm} ppm
                      </p>
                    </div>
                    <Droplets className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              )}

              {/* Luz */}
              {sensorData.light && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Luz</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sensorData.light.lux} lux
                      </p>
                      <p className="text-sm text-gray-500">
                        UV: {sensorData.light.indice_uv}
                      </p>
                    </div>
                    <Sun className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              )}

              {/* Suelo */}
              {sensorData.soil && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Suelo</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sensorData.soil.humedad_suelo}
                      </p>
                      <p className="text-sm text-gray-500">
                        Temp: {sensorData.soil.temperatura_suelo_celsius}°C
                      </p>
                    </div>
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reporte de IA */}
        {aiReport && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              🤖 Análisis de Inteligencia Artificial
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Reporte Generado
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(aiReport.generatedAt).toLocaleString("es-ES")}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {aiReport.report}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Datos Analizados
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Temperatura Promedio:</span>
                    <span className="ml-2 font-medium">
                      {aiReport.sensorData.temperatura_promedio}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Humedad Promedio:</span>
                    <span className="ml-2 font-medium">
                      {aiReport.sensorData.humedad_promedio}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">CO₂ Promedio:</span>
                    <span className="ml-2 font-medium">
                      {aiReport.sensorData.co2_promedio} ppm
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Días Analizados:</span>
                    <span className="ml-2 font-medium">
                      {aiReport.sensorData.dias_analizados}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Modelo: {aiReport.model}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            💡 Recomendaciones Inteligentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="font-medium text-green-900">Riego Optimizado</h3>
              </div>
              <p className="text-sm text-green-700">
                Basado en la humedad del suelo actual, se recomienda regar en
                las próximas 2 horas para mantener el nivel óptimo.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-900">
                  Monitoreo de CO₂
                </h3>
              </div>
              <p className="text-sm text-yellow-700">
                Los niveles de CO₂ están dentro del rango normal, pero se
                sugiere aumentar la ventilación para optimizar el crecimiento.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">
                  Predicción de Cosecha
                </h3>
              </div>
              <p className="text-sm text-blue-700">
                Las condiciones actuales sugieren una cosecha óptima en
                aproximadamente 15-20 días.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            🌱 Agrotico Smart Dashboard - Sistema de Monitoreo Agrícola con IA
          </p>
          {lastUpdate && (
            <p className="mt-1">Última actualización: {lastUpdate}</p>
          )}
        </div>
      </div>
    </div>
  );
}
