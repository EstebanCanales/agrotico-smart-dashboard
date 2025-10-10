"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [aiModel, setAiModel] = useState("deepseek-chat");

  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAiModel("deepseek-chat");

      // Cargar datos completos del usuario desde la API
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;

        setName(userData.nombre || "");
        setEmail(userData.email || "");
        setTelefono(userData.telefono || "");
        setUbicacion(userData.ubicacion || "");
        
        toast({
          title: "Datos actualizados",
          description: "Los datos del usuario se han cargado correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingAccount(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: name,
          email: email,
          telefono: telefono,
          ubicacion: ubicacion,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil se ha actualizado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al actualizar el perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error de validación",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña se ha cambiado exitosamente.",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al cambiar la contraseña",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingAI(true);

    try {
      const response = await fetch("/api/user/ai-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiModel: aiModel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Preferencias actualizadas",
          description: "Las preferencias de IA se han actualizado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al actualizar las preferencias de IA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAI(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <p>Debes iniciar sesión para ver la configuración.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="account" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>
                Gestiona la configuración de tu cuenta y perfil.
              </CardDescription>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadUserData}
                  disabled={isLoadingData}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoadingData ? "animate-spin" : ""
                    }`}
                  />
                  Recargar Datos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingData && (
                <div className="flex items-center justify-center p-4">
                  <LoadingSpinner />
                  <span className="ml-2">Cargando datos del usuario...</span>
                </div>
              )}
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de Usuario</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    type="text"
                    placeholder="Ciudad, País"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSavingAccount}
                >
                  {isSavingAccount ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
              <Separator />
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Contraseña Actual</Label>
                  <Input
                    id="old-password"
                    type="password"
                    placeholder="********"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">
                    Confirmar Nueva Contraseña
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="********"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de IA</CardTitle>
              <CardDescription>
                Configura el modelo de IA y las opciones relacionadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAISubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">Modelo de IA</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek-chat">
                        DeepSeek Chat
                      </SelectItem>
                      <SelectItem value="deepseek-coder">
                        DeepSeek Coder
                      </SelectItem>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo (via DeepSeek)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-status">Estado de la API Key</Label>
                  <Input
                    id="api-key-status"
                    type="text"
                    value="Cargada desde .env"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    La clave API de DeepSeek se gestiona a través de variables
                    de entorno.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isSavingAI}>
                  {isSavingAI
                    ? "Actualizando..."
                    : "Actualizar Configuración de IA"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Uso y Estadísticas</CardTitle>
              <CardDescription>
                Revisa el uso de tu cuenta y las estadísticas de IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Llamadas a la API (últimos 30 días)</Label>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div>
                  <Label>Tokens Consumidos (últimos 30 días)</Label>
                  <p className="text-2xl font-bold">567,890</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Último Informe de IA Generado</Label>
                <p className="text-lg">2023-10-27 10:30 AM</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Facturación y Suscripción</CardTitle>
              <CardDescription>
                Gestiona tus planes de suscripción y detalles de facturación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta sección está en desarrollo. Pronto podrás gestionar tus
                suscripciones aquí.
              </p>
              <Button className="w-full" disabled>
                Ver Planes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta sección está en desarrollo. Pronto podrás cambiar temas y
                configuraciones visuales.
              </p>
              <Button className="w-full" disabled>
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
