"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  loginUser,
  registerUser,
  getProfile,
  logoutUser,
} from "@/actions/auth";

interface User {
  id: string;
  email: string;
  nombre: string;
  tipo: string;
  estado: string;
  ai_model?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  ubicacion?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si estamos en el cliente
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Verify token validity using server action
          const profileResponse = await getProfile(storedToken);

          if (profileResponse.success && profileResponse.data) {
            setToken(storedToken);
            setUser(profileResponse.data as User);
          } else {
            // Limpiar datos sin llamar a logout para evitar recursión
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("AuthContext: Error verificando autenticación:", error);
        // Limpiar datos sin llamar a logout para evitar recursión
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    try {
      // Limpiar estado
      setUser(null);
      setToken(null);

      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Limpiar sessionStorage también por seguridad
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("AuthContext: Error durante el logout:", error);
      // Forzar limpieza incluso si hay error
      setUser(null);
      setToken(null);
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await loginUser(email, password);

      if (response.success && response.data) {
        const { user, token } = response.data;

        setUser(user);
        setToken(token);

        // Guardar en localStorage de forma segura
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Error en login:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await registerUser(userData);

      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en registro:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
