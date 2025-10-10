"use client";

import { Card } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface RobotLocationMapProps {
  lat?: number;
  lng?: number;
  ubicacion?: string;
}

export default function RobotLocationMap({
  lat,
  lng,
  ubicacion,
}: RobotLocationMapProps) {
  // Si no hay coordenadas, mostrar ubicación por nombre
  if (!lat || !lng) {
    return (
      <Card className="w-40 h-24 sm:w-56 sm:h-36 p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex flex-col items-center justify-center h-full">
          <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400" />
          <span className="text-xs sm:text-sm text-slate-500 text-center mt-1 sm:mt-2">
            {ubicacion || "Sin ubicación"}
          </span>
        </div>
      </Card>
    );
  }

  // Simular un mapa pequeño con coordenadas
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=12&size=224x144&markers=color:red%7C${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  return (
    <Card className="w-40 h-24 sm:w-56 sm:h-36 p-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="relative w-full h-full">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <img
            src={mapUrl}
            alt="Ubicación del robot"
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
            <Navigation className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-500 text-center mt-1 sm:mt-2">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>
        )}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border border-white shadow-sm"></div>
        </div>
      </div>
    </Card>
  );
}
