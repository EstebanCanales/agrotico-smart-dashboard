
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
  handleRefresh: () => void;
  loading: boolean;
}

export default function Header({ handleRefresh, loading }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
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

            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="secondary"
              className="flex items-center space-x-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "Actualizando..." : "Actualizar"}</span>
            </Button>

            <Button
              onClick={logout}
              variant="secondary"
              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
