
"use client";

import { RobotStats } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

interface EditRobotModalProps {
  robot: RobotStats | null;
  onClose: () => void;
  onSave: (robot: RobotStats) => void;
}

export default function EditRobotModal({ robot, onClose, onSave }: EditRobotModalProps) {
  if (!robot) return null;

  const handleSave = () => {
    // Here you would handle form state and pass it to onSave
    onSave(robot);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🤖</span>
              <h3 className="text-lg font-medium text-gray-900">
                Editar Robot: {robot.nombre}
              </h3>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Robot
              </label>
              <Input
                type="text"
                defaultValue={robot.nombre}
                placeholder="Nombre del robot"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select defaultValue={robot.estado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UUID (Solo lectura)
              </label>
              <Input
                type="text"
                value={(robot as any)?.uuid || ""}
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
