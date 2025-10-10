"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Limpiar datos de autenticación
        logout();

        // Redirigir a la página de login después de un breve delay
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      } catch (error) {
        console.error("Error durante el logout:", error);
        // Redirigir de todas formas
        router.push("/auth/login");
      }
    };

    handleLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg
              className="animate-spin h-12 w-12"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Cerrando sesión...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor espera mientras cerramos tu sesión de forma segura.
          </p>
        </div>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
}
