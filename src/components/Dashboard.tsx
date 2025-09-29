"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Database,
  Users,
  Activity,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  LogOut,
  User,
  X,
  Clock,
  Battery,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  Plus,
} from "lucide-react";
import { DashboardData, RegistrationRecord, RobotStats } from "@/types";
import LoadingSpinner from "./LoadingSpinner";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [robots, setRobots] = useState<RobotStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<RobotStats | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos de robots desde la API
      const robotsResponse = await fetch(
        "http://localhost:5001/api/analytics/robots"
      );
      if (!robotsResponse.ok) {
        throw new Error("Error al cargar datos de robots");
      }
      const robotsData = await robotsResponse.json();

      if (robotsData.success) {
        setRobots(robotsData.data);
      } else {
        throw new Error("Error en la respuesta de la API de robots");
      }

      setLastUpdate(new Date().toLocaleString("es-ES"));
    } catch (err: any) {
      setError(err.message || "Error cargando los datos de robots");
      console.error("Error loading robots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewRobot = (robot: RobotStats) => {
    // Redirigir a la página del robot
    window.location.href = `/robot/${(robot as any).uuid}`;
  };

  const handleEditRobot = (robot: RobotStats) => {
    setSelectedRobot(robot);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedRobot(null);
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
            robotUuid: "f7e6de09-0d83-45e2-9d1b-a4dc4aa1c8cc", // Robot por defecto
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Nuevo registro generado:", result.data);

        // Recargar datos del dashboard
        await loadDashboardData();

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

  const handleSaveRobot = async (updatedRobot: RobotStats) => {
    try {
      // Aquí implementarías la lógica para guardar los cambios
      console.log("Guardando robot:", updatedRobot);
      // Por ahora solo cerramos el modal
      setShowEditModal(false);
      setSelectedRobot(null);
      // Recargar datos
      loadDashboardData();
    } catch (error) {
      console.error("Error guardando robot:", error);
    }
  };

  const filteredRobots = robots.filter((robot) => {
    const matchesSearch =
      (robot.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((robot as any).uuid || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "todos" || (robot.estado || "desconocido") === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (estado: string | undefined) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-red-100 text-red-800";
      case "mantenimiento":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalReadings = robots.reduce(
    (sum, robot) => sum + ((robot as any).total_readings || 0),
    0
  );
  const activeRobots = robots.filter(
    (robot) => (robot.estado || "desconocido") === "activo"
  ).length;
  const totalRobots = robots.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl mr-2">🌱</span>
                <h1 className="text-xl font-semibold text-gray-900">
                  Agrotico Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{user?.nombre}</span>
                <span className="text-gray-300">|</span>
                <span className="capitalize">{user?.tipo}</span>
              </div>

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

              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
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
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Robots
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalRobots}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Robots Activos
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeRobots}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Lecturas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalReadings.toLocaleString("es-ES")}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Promedio Lecturas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalRobots > 0
                    ? Math.round(totalReadings / totalRobots)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Robots */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Robots Agrícolas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Haz clic en cualquier fila para ver detalles del robot y sus
                sensores
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateNewRecord}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Generando..." : "Generar Registro"}
              </button>
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o UUID..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="input-field pl-10"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de robots */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UUID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Lecturas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Lectura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minutos Desde Última
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRobots.map((robot) => (
                  <tr
                    key={(robot as any).uuid}
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                    onClick={() => handleViewRobot(robot)}
                    title="Haz clic para ver detalles del robot"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🤖</span>
                        <span className="text-sm font-medium text-gray-900">
                          {robot.nombre || "Sin nombre"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {(robot as any).uuid || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          robot.estado || "desconocido"
                        )}`}
                      >
                        {robot.estado || "desconocido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((robot as any).total_readings || 0).toLocaleString(
                        "es-ES"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(robot as any).last_reading
                        ? new Date((robot as any).last_reading).toLocaleString(
                            "es-ES"
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(robot as any).last_reading
                        ? Math.floor(
                            (Date.now() -
                              new Date((robot as any).last_reading).getTime()) /
                              (1000 * 60)
                          ) + " min"
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          robot.estado || "desconocido"
                        )}`}
                      >
                        {robot.estado || "desconocido"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRobots.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No se encontraron robots
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🌱 Agrotico Smart Dashboard - Sistema de Monitoreo Agrícola</p>
          {lastUpdate && (
            <p className="mt-1">Última actualización: {lastUpdate}</p>
          )}
        </div>
      </div>

      {/* Modal de edición del robot */}
      {showEditModal && selectedRobot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header del modal */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  <h3 className="text-lg font-medium text-gray-900">
                    Editar Robot: {selectedRobot.nombre}
                  </h3>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Formulario de edición */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Robot
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedRobot.nombre}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del robot"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    defaultValue={selectedRobot.estado}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UUID (Solo lectura)
                  </label>
                  <input
                    type="text"
                    value={(selectedRobot as any)?.uuid || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Lecturas
                    </label>
                    <input
                      type="number"
                      defaultValue={(selectedRobot as any)?.total_readings || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minutos Desde Última
                    </label>
                    <input
                      type="number"
                      defaultValue={
                        (selectedRobot as any)?.last_reading
                          ? Math.floor(
                              (Date.now() -
                                new Date(
                                  (selectedRobot as any).last_reading
                                ).getTime()) /
                                (1000 * 60)
                            )
                          : 0
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveRobot(selectedRobot)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
