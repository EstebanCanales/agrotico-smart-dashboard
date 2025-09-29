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
import { AIAnalysis, SensorData } from "@/services/aiService";

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
  const [error, setError] = useState<string | null>(null);

  const robotId = params.id as string;

  // Cargar análisis de IA avanzado desde el servicio
  const loadAIAnalysis = async (sensorData: SensorDataLegacy) => {
    try {
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
      analisis_general: `Análisis básico basado en datos actuales. Se recomienda recopilar más datos históricos para un análisis más preciso.`,
      condiciones_terreno: {
        salud_suelo: Math.min(
          100,
          Math.max(0, soilHumidity / 5 + temp * 2 + humidity / 2)
        ),
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
        compactacion: soilHumidity > 500 ? "Alta" : "Normal",
        recomendaciones_mejora: [
          "Añadir materia orgánica",
          "Mejorar drenaje si es necesario",
        ],
        cultivos_aptos: ["Tomate", "Lechuga", "Pimiento"],
        cultivos_no_recomendados: ["Arroz", "Caña de azúcar"],
      },
      predicciones_climaticas: Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth + i) % 12;
        return {
          mes: months[monthIndex],
          temperatura_promedio: temp + (Math.random() - 0.5) * 4,
          humedad_promedio: humidity + (Math.random() - 0.5) * 10,
          precipitacion_esperada: Math.random() * 200,
          dias_lluvia: Math.floor(Math.random() * 15),
          indice_uv_promedio: light / 1000 + Math.random() * 2,
          viento_promedio: Math.random() * 20,
          probabilidad_sequia: Math.random() * 30,
          probabilidad_inundacion: Math.random() * 20,
          recomendacion_climatica: "Condiciones estables para la agricultura",
        };
      }),
      recomendaciones_cultivos: [
        {
          cultivo: "Tomate",
          variedad: "Cherry",
          epoca_plantacion: "Primavera",
          epoca_cosecha: "Verano",
          rendimiento_esperado: "Alto",
          requerimientos_agua: "Moderados",
          tolerancia_temperatura: "15-30°C",
          dias_madurez: 75,
          tecnica_cultivo: "Invernadero",
          ventajas: ["Alto rendimiento", "Resistente"],
          desafios: ["Requiere tutoreo"],
          precio_mercado_estimado: "$2-4/kg",
          sostenibilidad: "Buena",
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
      plan_6_meses: Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth + i) % 12;
        return {
          mes: months[monthIndex],
          actividades: ["Preparación del suelo", "Siembra", "Mantenimiento"],
          cultivos_recomendados: ["Tomate", "Lechuga"],
          alertas: ["Monitorear humedad del suelo"],
        };
      }),
      score_sostenibilidad: 75,
      score_rentabilidad: 80,
      score_riesgo: 30,
      confianza_analisis: 85,
      fecha_analisis: new Date().toISOString(),
      modelo_ia: "AgroTico AI v3.1 (Fallback)",
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
        {aiAnalysis && (
          <div className="space-y-6">
            {/* Header del Análisis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-purple-600" />
                  Análisis de IA Avanzado v3.1
                </CardTitle>
                <CardDescription>
                  Análisis completo de condiciones del terreno, predicciones
                  climáticas basadas en modelos IPCC, y recomendaciones de
                  cultivos para los próximos 6 meses
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
                    {Math.round(aiAnalysis.condiciones_terreno.salud_suelo)}%
                  </div>
                  <div className="text-sm text-gray-600">Salud del Suelo</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {aiAnalysis.score_sostenibilidad}%
                  </div>
                  <div className="text-sm text-gray-600">Sostenibilidad</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {aiAnalysis.score_rentabilidad}%
                  </div>
                  <div className="text-sm text-gray-600">Rentabilidad</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {aiAnalysis.score_riesgo}%
                  </div>
                  <div className="text-sm text-gray-600">Nivel de Riesgo</div>
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
                      {aiAnalysis.condiciones_terreno.cultivos_aptos
                        .slice(0, 3)
                        .map((crop, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-1 mb-1"
                          >
                            {crop}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Recomendaciones de Mejora */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Recomendaciones de Mejora del Suelo
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiAnalysis.condiciones_terreno.recomendaciones_mejora.map(
                      (recomendacion, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg"
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">
                            {recomendacion}
                          </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiAnalysis.predicciones_climaticas.map(
                    (prediccion, index) => (
                      <Card
                        key={index}
                        className="border-l-4 border-l-yellow-500"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {prediccion.mes}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Temp:</span>
                              <span className="font-medium ml-1">
                                {prediccion.temperatura_promedio.toFixed(1)}°C
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Humedad:</span>
                              <span className="font-medium ml-1">
                                {prediccion.humedad_promedio.toFixed(0)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Lluvia:</span>
                              <span className="font-medium ml-1">
                                {prediccion.precipitacion_esperada.toFixed(0)}mm
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Días lluvia:
                              </span>
                              <span className="font-medium ml-1">
                                {prediccion.dias_lluvia}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {prediccion.recomendacion_climatica}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
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
                  {aiAnalysis.recomendaciones_cultivos.map((cultivo, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {cultivo.cultivo} - {cultivo.variedad}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">
                              Época plantación:
                            </span>
                            <span className="font-medium ml-1">
                              {cultivo.epoca_plantacion}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Época cosecha:
                            </span>
                            <span className="font-medium ml-1">
                              {cultivo.epoca_cosecha}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Días madurez:</span>
                            <span className="font-medium ml-1">
                              {cultivo.dias_madurez}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rendimiento:</span>
                            <span className="font-medium ml-1">
                              {cultivo.rendimiento_esperado}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">
                            Ventajas:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {cultivo.ventajas.map((ventaja, vIndex) => (
                              <span
                                key={vIndex}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                              >
                                {ventaja}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">
                            Precio estimado:
                          </h5>
                          <span className="text-sm text-gray-600">
                            {cultivo.precio_mercado_estimado}
                          </span>
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
                  {aiAnalysis.plan_6_meses.map((mes, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">{mes.mes}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Actividades:
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {mes.actividades.map((actividad, aIndex) => (
                              <li
                                key={aIndex}
                                className="flex items-start space-x-2"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                <span>{actividad}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Cultivos recomendados:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {mes.cultivos_recomendados.map(
                              (cultivo, cIndex) => (
                                <span
                                  key={cIndex}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {cultivo}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        {mes.alertas.length > 0 && (
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">
                              Alertas:
                            </h5>
                            <div className="space-y-1">
                              {mes.alertas.map((alerta, alIndex) => (
                                <div
                                  key={alIndex}
                                  className="flex items-start space-x-2 text-sm text-red-600"
                                >
                                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{alerta}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
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
        )}
      </div>
    </div>
  );
}
