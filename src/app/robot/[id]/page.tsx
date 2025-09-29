"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  RefreshCw,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  Activity,
  Clock,
  Battery,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Brain,
  Calendar,
  BarChart3,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AIAnalysis, SensorData } from "@/services/aiServiceImproved";

interface RobotStats {
  nombre: string;
  uuid: string;
  estado: string;
  total_readings: number;
  last_reading: string | null;
  minutes_since_last: number | null;
}

interface SensorDataLegacy {
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

// Datos de ejemplo para gráficos
const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperatura: 20 + Math.random() * 10,
      humedad: 40 + Math.random() * 20,
      luz: Math.random() * 100,
      suelo: 200 + Math.random() * 300,
    });
  }
  return data;
};

const chartData = generateChartData();

const pieData = [
  { name: "Temperatura", value: 25, color: "#ef4444" },
  { name: "Humedad", value: 30, color: "#3b82f6" },
  { name: "Luz", value: 20, color: "#f59e0b" },
  { name: "Suelo", value: 25, color: "#10b981" },
];

export default function RobotPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [robot, setRobot] = useState<RobotStats | null>(null);
  const [sensorData, setSensorData] = useState<SensorDataLegacy | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const robotId = params.id as string;

  // Cargar análisis de IA avanzado desde el servicio
  const loadAIAnalysis = async (sensorData: SensorDataLegacy) => {
    if (aiLoading) return; // Evitar llamadas duplicadas

    try {
      setAiLoading(true);
      console.log("🤖 Cargando análisis de IA avanzado...");

      const response = await fetch("/api/ai/advanced-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sensorData: {
            temperature: sensorData.temperature
              ? {
                  temperatura_celsius:
                    sensorData.temperature.temperatura_celsius,
                  presion_hpa: sensorData.temperature.presion_hpa,
                }
              : undefined,
            humidity: sensorData.humidity
              ? {
                  humedad_pct: sensorData.humidity.humedad_pct,
                  co2_ppm: sensorData.humidity.co2_ppm,
                }
              : undefined,
            soil: sensorData.soil
              ? {
                  humedad_suelo: sensorData.soil.humedad_suelo,
                  temperatura_suelo_celsius:
                    sensorData.soil.temperatura_suelo_celsius,
                }
              : undefined,
            light: sensorData.light
              ? {
                  lux: sensorData.light.lux,
                  indice_uv: sensorData.light.indice_uv,
                }
              : undefined,
          },
          robotId: robotId,
          location: "Costa Rica",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("✅ Análisis de IA cargado exitosamente");
          return data.data;
        }
      }

      console.log("⚠️ Usando análisis de fallback");
      return generateFallbackAnalysis(sensorData);
    } catch (error) {
      console.error("❌ Error cargando análisis de IA:", error);
      return generateFallbackAnalysis(sensorData);
    } finally {
      setAiLoading(false);
    }
  };

  // Análisis de fallback básico
  const generateFallbackAnalysis = (
    sensorData: SensorDataLegacy
  ): AIAnalysis => {
    const currentMonth = new Date().getMonth();
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const temp = sensorData.temperature
      ? parseFloat(sensorData.temperature.temperatura_celsius)
      : 25;
    const humidity = sensorData.humidity
      ? parseFloat(sensorData.humidity.humedad_pct)
      : 50;
    const soilHumidity = sensorData.soil ? sensorData.soil.humedad_suelo : 300;
    const light = sensorData.light ? parseFloat(sensorData.light.lux) : 50;

    return {
      id: `fallback-${Date.now()}`,
      robot_id: robotId,
      analisis_general: `Análisis básico basado en datos actuales. Se recomienda recopilar más datos históricos para un análisis más preciso.`,
      condiciones_terreno: {
        ph_estimado: 6.5 + (temp - 25) * 0.02,
        materia_organica: Math.min(5, Math.max(1, soilHumidity / 100)),
        nitrogeno: Math.min(100, Math.max(20, soilHumidity / 3)),
        fosforo: Math.min(80, Math.max(15, soilHumidity / 4)),
        potasio: Math.min(90, Math.max(25, soilHumidity / 3.5)),
        textura:
          soilHumidity > 400
            ? "Arcillosa"
            : soilHumidity > 200
            ? "Franca"
            : "Arenosa",
        drenaje: soilHumidity > 400 ? "Limitado" : "Bueno",
      },
      predicciones_climaticas: {
        proximos_30_dias: {
          temperatura_promedio: temp + (Math.random() - 0.5) * 4,
          precipitacion_esperada: "100-150mm",
          humedad_relativa: humidity + (Math.random() - 0.5) * 10,
          dias_lluvia: Math.floor(Math.random() * 15),
        },
        proximos_90_dias: {
          temperatura_promedio: temp + (Math.random() - 0.5) * 4,
          precipitacion_esperada: "200-300mm",
          humedad_relativa: humidity + (Math.random() - 0.5) * 10,
          dias_lluvia: Math.floor(Math.random() * 20) + 10,
        },
        proximos_180_dias: {
          temperatura_promedio: temp + (Math.random() - 0.5) * 4,
          precipitacion_esperada: "400-600mm",
          humedad_relativa: humidity + (Math.random() - 0.5) * 10,
          dias_lluvia: Math.floor(Math.random() * 30) + 20,
        },
      },
      cultivos_recomendados: [
        {
          nombre: "Tomate",
          epoca_siembra: "Primavera",
          probabilidad_exito: 85,
          razon: "Condiciones ideales para el cultivo",
        },
      ],
      factores_riesgo: [
        "Variabilidad climática",
        "Precios de mercado fluctuantes",
      ],
      oportunidades_optimizacion: [
        "Implementar riego por goteo",
        "Usar fertilizantes orgánicos",
      ],
      plan_seis_meses: {
        mes_1: "Preparación del suelo y siembra",
        mes_2: "Control de malezas y fertilización",
        mes_3: "Monitoreo de plagas y enfermedades",
        mes_4: "Primera cosecha",
        mes_5: "Cosecha y preparación para segunda siembra",
        mes_6: "Siembra de cultivos de invierno",
      },
      confianza_analisis: 60,
      fecha_analisis: new Date().toISOString(),
      modelo_ia: "AgroTico AI v3.1 con DeepSeek (Fallback)",
    };
  };

  const loadRobotData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del robot
      const robotsResponse = await fetch(
        "http://localhost:5001/api/analytics/robots"
      );
      if (robotsResponse.ok) {
        const robotsData = await robotsResponse.json();
        if (robotsData.success) {
          const foundRobot = robotsData.data.find(
            (r: RobotStats) => r.uuid === robotId
          );
          if (foundRobot) {
            setRobot(foundRobot);
          } else {
            throw new Error("Robot no encontrado");
          }
        }
      }

      // Cargar datos de sensores
      const sensorsResponse = await fetch(
        "http://localhost:5001/api/analytics/current"
      );
      if (sensorsResponse.ok) {
        const sensorsData = await sensorsResponse.json();
        if (sensorsData.success) {
          setSensorData(sensorsData.data);
          // Cargar análisis de IA avanzado
          const analysis = await loadAIAnalysis(sensorsData.data);
          setAiAnalysis(analysis);
        }
      }
    } catch (err: any) {
      setError(err.message || "Error cargando los datos del robot");
      console.error("Error loading robot:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (robotId) {
      loadRobotData();
    }
  }, [robotId]);

  const handleRefresh = () => {
    loadRobotData();
  };

  const generateNewRecord = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5001/api/registros/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            robotUuid: robotId, // Usar el robot actual
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Nuevo registro generado:", result.data);

        // Recargar datos del robot
        await loadRobotData();

        // Registro generado exitosamente
        console.log("✅ Nuevo registro generado exitosamente:", result.data);
      } else {
        throw new Error("Error generando registro");
      }
    } catch (error) {
      console.error("❌ Error generando registro:", error);
      console.error("❌ Error generando nuevo registro. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Reintentar</Button>
        </div>
      </div>
    );
  }

  if (!robot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Robot no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            El robot con ID {robotId} no existe
          </p>
          <Button onClick={() => router.push("/")}>Volver al Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                <h1 className="text-xl font-semibold text-gray-900">
                  {robot.nombre}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={generateNewRecord}
                disabled={loading}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? "Generando..." : "Generar Registro"}</span>
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-1"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Robot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {robot.estado}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Lecturas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {robot.total_readings.toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Última Lectura
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {robot.minutes_since_last
                      ? `${robot.minutes_since_last} min`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Battery className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">UUID</p>
                  <p className="text-sm font-mono text-gray-900 truncate">
                    {robot.uuid}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Datos de Sensores en Tiempo Real */}
        {sensorData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Thermometer className="h-4 w-4 mr-2 text-red-500" />
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {sensorData.temperature?.temperatura_celsius || "N/A"}°C
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Presión: {sensorData.temperature?.presion_hpa || "N/A"} hPa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                  Humedad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {sensorData.humidity?.humedad_pct || "N/A"}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  CO2: {sensorData.humidity?.co2_ppm || "N/A"} ppm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                  Luz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {sensorData.light?.lux || "N/A"} lux
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  UV: {sensorData.light?.indice_uv || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Leaf className="h-4 w-4 mr-2 text-green-500" />
                  Suelo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {sensorData.soil?.humedad_suelo || "N/A"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Temp: {sensorData.soil?.temperatura_suelo_celsius || "N/A"}°C
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos de Datos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Sensores (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="humedad"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Sensores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Análisis de IA Avanzado v3.1 */}
        {aiLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-lg font-medium text-gray-700">
                  Generando análisis de IA...
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Analizando condiciones del terreno y generando recomendaciones
              </p>
            </CardContent>
          </Card>
        ) : aiAnalysis ? (
          <div className="space-y-6">
            {/* Header del Análisis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-purple-600" />
                  Análisis de IA Avanzado v3.1 con DeepSeek
                </CardTitle>
                <CardDescription>
                  Análisis completo de condiciones del terreno, predicciones
                  climáticas basadas en modelos IPCC, y recomendaciones de
                  cultivos para los próximos 6 meses. Powered by DeepSeek AI.
                </CardDescription>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                  <span>Modelo: {aiAnalysis.modelo_ia}</span>
                  <span>Confianza: {aiAnalysis.confianza_analisis}%</span>
                  <span>
                    Fecha:{" "}
                    {new Date(aiAnalysis.fecha_analisis).toLocaleDateString(
                      "es-ES"
                    )}
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Análisis General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análisis General</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {aiAnalysis.analisis_general}
                </p>
              </CardContent>
            </Card>

            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {aiAnalysis.confianza_analisis}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Confianza del Análisis
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {aiAnalysis.cultivos_recomendados.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cultivos Recomendados
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {aiAnalysis.factores_riesgo.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Factores de Riesgo
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {aiAnalysis.oportunidades_optimizacion.length}
                  </div>
                  <div className="text-sm text-gray-600">Oportunidades</div>
                </CardContent>
              </Card>
            </div>

            {/* Análisis del Terreno */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-green-600" />
                  Análisis de Condiciones del Terreno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Propiedades del Suelo
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          pH Estimado:
                        </span>
                        <span className="text-sm font-medium">
                          {aiAnalysis.condiciones_terreno.ph_estimado.toFixed(
                            1
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Materia Orgánica:
                        </span>
                        <span className="text-sm font-medium">
                          {aiAnalysis.condiciones_terreno.materia_organica.toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Textura:</span>
                        <span className="text-sm font-medium">
                          {aiAnalysis.condiciones_terreno.textura}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Drenaje:</span>
                        <span className="text-sm font-medium">
                          {aiAnalysis.condiciones_terreno.drenaje}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Nutrientes
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Nitrógeno:
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(aiAnalysis.condiciones_terreno.nitrogeno)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fósforo:</span>
                        <span className="text-sm font-medium">
                          {Math.round(aiAnalysis.condiciones_terreno.fosforo)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Potasio:</span>
                        <span className="text-sm font-medium">
                          {Math.round(aiAnalysis.condiciones_terreno.potasio)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Cultivos Recomendados
                    </h4>
                    <div className="space-y-1">
                      {aiAnalysis.cultivos_recomendados
                        .slice(0, 3)
                        .map((crop, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-green-800">
                              {crop.nombre}
                            </span>
                            <span className="text-gray-600 ml-2">
                              ({crop.probabilidad_exito}%)
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Oportunidades de Optimización */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Oportunidades de Optimización
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiAnalysis.oportunidades_optimizacion.map(
                      (oportunidad, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg"
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{oportunidad}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predicciones Climáticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-yellow-600" />
                  Predicciones Climáticas (6 Meses)
                </CardTitle>
                <CardDescription>
                  Basadas en modelos IPCC y datos históricos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Próximos 30 días */}
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Próximos 30 días
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Temp:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_30_dias.temperatura_promedio
                            }
                            °C
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Humedad:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_30_dias.humedad_relativa
                            }
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Lluvia:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_30_dias.precipitacion_esperada
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Días lluvia:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_30_dias.dias_lluvia
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Próximos 90 días */}
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Próximos 90 días
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Temp:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_90_dias.temperatura_promedio
                            }
                            °C
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Humedad:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_90_dias.humedad_relativa
                            }
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Lluvia:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_90_dias.precipitacion_esperada
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Días lluvia:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_90_dias.dias_lluvia
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Próximos 180 días */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Próximos 180 días
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Temp:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_180_dias.temperatura_promedio
                            }
                            °C
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Humedad:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_180_dias.humedad_relativa
                            }
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Lluvia:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_180_dias.precipitacion_esperada
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Días lluvia:</span>
                          <span className="font-medium ml-1">
                            {
                              aiAnalysis.predicciones_climaticas
                                .proximos_180_dias.dias_lluvia
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones de Cultivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Recomendaciones de Cultivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiAnalysis.cultivos_recomendados.map((cultivo, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {cultivo.nombre}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">
                              Época siembra:
                            </span>
                            <span className="font-medium ml-1">
                              {cultivo.epoca_siembra}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Probabilidad éxito:
                            </span>
                            <span className="font-medium ml-1 text-green-600">
                              {cultivo.probabilidad_exito}%
                            </span>
                          </div>
                          <div className="mt-3">
                            <h5 className="font-medium text-gray-700 mb-1">
                              Razón:
                            </h5>
                            <p className="text-sm text-gray-600">
                              {cultivo.razon}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan de 6 Meses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Plan de Actividades (6 Meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mes 1 */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg">Mes 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {aiAnalysis.plan_seis_meses.mes_1}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mes 2 */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg">Mes 2</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {aiAnalysis.plan_seis_meses.mes_2}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mes 3 */}
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-lg">Mes 3</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {aiAnalysis.plan_seis_meses.mes_3}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mes 4 */}
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-lg">Mes 4</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {aiAnalysis.plan_seis_meses.mes_4}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mes 5 */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="text-lg">Mes 5</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {aiAnalysis.plan_seis_meses.mes_5}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mes 6 */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-lg">Mes 6</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {aiAnalysis.plan_seis_meses.mes_6}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Factores de Riesgo y Oportunidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Factores de Riesgo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Factores de Riesgo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiAnalysis.factores_riesgo.map((riesgo, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{riesgo}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Oportunidades de Optimización */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Oportunidades de Optimización
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiAnalysis.oportunidades_optimizacion.map(
                      (oportunidad, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{oportunidad}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
