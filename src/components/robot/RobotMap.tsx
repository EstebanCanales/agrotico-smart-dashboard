"use client";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useRef, useEffect, useState } from "react";

interface RobotMapProps {
  lat: number;
  lng: number;
  robotName: string;
  className?: string;
}

const MapComponent = ({
  lat,
  lng,
  robotName,
}: {
  lat: number;
  lng: number;
  robotName: string;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#1d2c4d" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#2c5aa0" }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#2c5aa0" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#2c5aa0" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#000000" }, { weight: 2 }],
        },
      ],
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP,
      },
    });

    // Crear marcador personalizado con animación avanzada
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: robotName,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Gradiente principal -->
              <radialGradient id="robotGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#1E40AF;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:1" />
              </radialGradient>
              
              <!-- Gradiente de pulso -->
              <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:0" />
              </radialGradient>
              
              <!-- Efecto de resplandor -->
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <!-- Sombra -->
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
              </filter>
            </defs>
            
            <!-- Círculo de pulso exterior -->
            <circle cx="40" cy="40" r="35" fill="url(#pulseGradient)" opacity="0.4">
              <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Círculo de pulso interior -->
            <circle cx="40" cy="40" r="30" fill="url(#pulseGradient)" opacity="0.6">
              <animate attributeName="r" values="30;38;30" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Sombra del marcador -->
            <circle cx="42" cy="42" r="22" fill="#000000" opacity="0.2" filter="url(#shadow)"/>
            
            <!-- Círculo principal -->
            <circle cx="40" cy="40" r="22" fill="url(#robotGradient)" stroke="#FFFFFF" stroke-width="4" filter="url(#glow)"/>
            
            <!-- Círculo interno con gradiente -->
            <circle cx="40" cy="40" r="16" fill="#60A5FA" opacity="0.9"/>
            
            <!-- Círculo central -->
            <circle cx="40" cy="40" r="8" fill="#FFFFFF" stroke="#1E40AF" stroke-width="2"/>
            
            <!-- Icono del robot mejorado -->
            <text x="40" y="47" text-anchor="middle" fill="#1E40AF" font-size="14" font-weight="bold" font-family="Arial">🤖</text>
            
            <!-- Punto de conexión con animación -->
            <circle cx="40" cy="40" r="3" fill="#10B981">
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Anillos decorativos -->
            <circle cx="40" cy="40" r="18" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.3"/>
            <circle cx="40" cy="40" r="14" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(80, 80),
        anchor: new google.maps.Point(40, 40),
      },
    });

    // Agregar InfoWindow con información del robot mejorada
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="
          padding: 16px; 
          font-family: 'Inter', sans-serif; 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          min-width: 200px;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="
              width: 16px; 
              height: 16px; 
              background: linear-gradient(135deg, #10B981, #059669); 
              border-radius: 50%; 
              margin-right: 10px;
              box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
              animation: pulse 2s infinite;
            "></div>
            <strong style="
              color: #1E40AF; 
              font-size: 16px; 
              background: linear-gradient(135deg, #1E40AF, #3B82F6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            ">${robotName}</strong>
          </div>
          
          <div style="
            background: rgba(255,255,255,0.7); 
            padding: 12px; 
            border-radius: 8px; 
            margin-bottom: 8px;
            border: 1px solid rgba(0,0,0,0.05);
          ">
            <div style="color: #4B5563; font-size: 13px; margin-bottom: 4px;">
              <span style="color: #6B7280;">📍</span> <strong>Latitud:</strong> ${lat.toFixed(
                6
              )}
            </div>
            <div style="color: #4B5563; font-size: 13px;">
              <span style="color: #6B7280;">📍</span> <strong>Longitud:</strong> ${lng.toFixed(
                6
              )}
            </div>
          </div>
          
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          ">
            <span>🟢 Estado: En línea</span>
            <span style="
              background: rgba(255,255,255,0.2); 
              padding: 2px 6px; 
              border-radius: 4px;
              font-size: 10px;
            ">ACTIVO</span>
          </div>
          
          <style>
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          </style>
        </div>
      `,
    });

    // Mostrar InfoWindow al hacer clic en el marcador
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [lat, lng, robotName]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Overlay con información del robot */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-slate-800">
            {robotName}
          </span>
        </div>
        <div className="text-xs text-slate-600 mt-1">
          📍 {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>

      {/* Indicador de zoom */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
        <div className="text-xs text-slate-600 font-medium">Zoom: 16x</div>
      </div>

      {/* Indicador de satélite */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-600 font-medium">Satélite</span>
        </div>
      </div>

      {/* Indicador de dirección */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-1">
            <span className="text-white text-sm">🧭</span>
          </div>
          <div className="text-xs text-slate-600 font-medium">Norte</div>
        </div>
      </div>

      {/* Indicador de escala */}
      <div className="absolute bottom-16 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-1 bg-gradient-to-r from-slate-400 to-slate-600 rounded"></div>
          <span className="text-xs text-slate-600 font-medium">100m</span>
        </div>
      </div>

      {/* Efectos de partículas decorativas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping"></div>
        <div
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-indigo-400/40 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-500/40 rounded-full animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
    </div>
  );
};

const LoadingMap = () => (
  <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden">
    {/* Efectos de fondo animados */}
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200/20 rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-indigo-200/20 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-200/20 rounded-full animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
    </div>

    <div className="text-center relative z-10">
      <div className="relative mb-6">
        {/* Spinner principal */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
        <div
          className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-spin"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute inset-2 rounded-full h-12 w-12 border-4 border-transparent border-t-indigo-400 animate-spin"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Icono del mapa en el centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
            <span className="text-white text-xs">🗺️</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg text-blue-700 font-semibold">Cargando mapa...</p>
        <p className="text-sm text-blue-500">
          Preparando visualización satelital
        </p>
        <div className="flex items-center justify-center space-x-1 mt-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorMap = () => (
  <div className="w-full h-full bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="text-red-500 text-2xl">⚠️</div>
      </div>
      <p className="text-sm text-red-700 font-medium">
        Error al cargar el mapa
      </p>
      <p className="text-xs text-red-500 mt-1">
        Verifica tu conexión a internet
      </p>
    </div>
  </div>
);

export default function RobotMap({
  lat,
  lng,
  robotName,
  className = "",
}: RobotMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // En un entorno real, obtendrías esto de las variables de entorno
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null);
  }, []);

  if (!apiKey) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-amber-600 text-2xl">🗝️</div>
          </div>
          <p className="text-sm text-amber-700 font-medium mb-2">
            Google Maps API Key no configurada
          </p>
          <p className="text-xs text-amber-600 mb-3">
            Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env.local
          </p>
          <div className="bg-amber-100 rounded-lg p-3 text-left">
            <p className="text-xs text-amber-800 font-mono">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
            </p>
          </div>
        </div>
      </div>
    );
  }

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingMap />;
      case Status.FAILURE:
        return <ErrorMap />;
      case Status.SUCCESS:
        return <MapComponent lat={lat} lng={lng} robotName={robotName} />;
    }
  };

  return (
    <div
      className={`w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}
    >
      <Wrapper apiKey={apiKey} render={render} />
    </div>
  );
}
