"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  nombre: string;
  tipo: string;
  estado: string;
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

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          console.log(
            "AuthContext: Token y usuario encontrados en localStorage"
          );
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // Verificar que el token sigue siendo válido
          try {
            const response = await axios.get(
              "http://localhost:5001/api/auth/profile"
            );
            if (response.data.success) {
              console.log("AuthContext: Token válido, usuario autenticado");
            } else {
              throw new Error("Token inválido");
            }
          } catch (error) {
            console.log("AuthContext: Token inválido, limpiando datos");
            logout();
          }
        } else {
          console.log("AuthContext: No hay datos de autenticación");
        }
      } catch (error) {
        console.error("AuthContext: Error verificando autenticación:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        userData
      );

      if (response.data.success) {
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
