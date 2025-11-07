"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import RobotDashboard from "@/components/robot/RobotDashboard";
import { RobotStats } from "@/lib/types";

// Tipos para datos de sensores
interface SensorDataLegacy {
  temperature?: {
    temperatura_celsius: string;
    presion_hpa: string;
  };
  humidity?: {
    humedad_pct: string;
    co2_ppm: string;
  };
  soil?: {
    humedad_suelo: number;
    temperatura_suelo_celsius: string;
  };
  light?: {
    lux: string;
    indice_uv: string;
  };
}

export default function RobotPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [robot, setRobot] = useState<RobotStats | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const robotId = params?.id as string;

  const loadRobotData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      // Cargar datos del robot
      const robotsResponse = await fetch("/api/analytics/robots");
      if (robotsResponse.ok) {
        const robotsData = await robotsResponse.json();
        if (
          robotsData.success &&
          robotsData.data &&
          Array.isArray(robotsData.data.robots)
        ) {
          const foundRobot = robotsData.data.robots.find(
            (r: RobotStats) => r.uuid === robotId
          );
          if (foundRobot) {
            setRobot(foundRobot);
          } else {
            throw new Error("Robot no encontrado");
          }
        } else {
          throw new Error("Datos de robots no válidos");
        }
      }

      // Cargar datos de sensores
      const sensorsResponse = await fetch("/api/analytics/current");
      if (sensorsResponse.ok) {
        const sensorsData = await sensorsResponse.json();
        if (sensorsData.success && sensorsData.data) {
          const robotSensorData = sensorsData.data.find(
            (s: any) => s.robot_uuid === robotId
          );
          if (robotSensorData) {
            setSensorData({
              temperature: {
                temperatura_celsius:
                  robotSensorData.temperature?.temperatura_celsius || "0",
                presion_hpa: robotSensorData.temperature?.presion_hpa || "0",
              },
              humidity: {
                humedad_pct: robotSensorData.humidity?.humedad_pct || "0",
                co2_ppm: robotSensorData.humidity?.co2_ppm || "0",
              },
              soil: {
                humedad_suelo: robotSensorData.soil?.humedad_suelo || 0,
                temperatura_suelo_celsius:
                  robotSensorData.soil?.temperatura_suelo_celsius || "0",
              },
              light: {
                lux: robotSensorData.light?.lux || "0",
                indice_uv: robotSensorData.light?.indice_uv || "0",
              },
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading robot:", err);
      setError(err.message || "Error al cargar los datos del robot");
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [robotId]);

  useEffect(() => {
    if (robotId) {
      loadRobotData(true); // Carga inicial
    }
  }, [robotId, loadRobotData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRobotData(false); // Recarga, no carga inicial
    setRefreshing(false);
  };

  const generateNewRecord = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/registros/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          robotUuid: robotId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Recargar datos después de generar el registro
          await loadRobotData(false); // Recarga, no carga inicial
        } else {
          setError(result.message || "Error al generar el registro");
        }
      } else {
        setError("Error al generar el registro");
      }
    } catch (err: any) {
      console.error("Error generating record:", err);
      setError("Error al generar el registro");
    } finally {
      setRefreshing(false);
    }
  };

  // Validar que el robotId existe
  if (!robotId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ID de Robot Inválido
          </h2>
          <p className="text-gray-600 mb-4">
            No se proporcionó un ID de robot válido
          </p>
          <Button onClick={() => router.push("/")}>Volver al Dashboard</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Cargando datos del robot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error al cargar el robot
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={handleRefresh}>Reintentar</Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!robot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
    <RobotDashboard
      robot={robot}
      onRefresh={handleRefresh}
      onGenerateRecord={generateNewRecord}
      onBack={() => router.push("/")}
      loading={loading}
      refreshing={refreshing}
    />
  );
}
