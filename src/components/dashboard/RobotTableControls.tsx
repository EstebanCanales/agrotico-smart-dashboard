"use client";

import { Search, Filter, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

interface RobotTableControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  loading: boolean;
  handleRefresh: () => void;
}

export default function RobotTableControls({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  loading,
  handleRefresh,
}: RobotTableControlsProps) {
  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6 gap-4">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
            Robots Agrícolas
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Haz clic en cualquier fila para ver detalles del robot y sus
            sensores
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
          <Button
            onClick={() => (window.location.href = "/ai")}
            className="flex items-center justify-center space-x-1 text-white shadow-md hover:shadow-lg transition-all duration-200"
            style={{ backgroundColor: "#0057a3" }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Chat con IA</span>
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="flex items-center justify-center space-x-1 border-2 hover:shadow-md transition-all duration-200"
            style={{ borderColor: "#0057a3", color: "#0057a3" }}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-sm sm:text-base">Actualizar</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nombre o UUID..."
            className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base border-2 focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base border-2 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
