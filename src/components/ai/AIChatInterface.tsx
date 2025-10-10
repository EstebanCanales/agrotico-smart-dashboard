"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SensorData } from "@/actions/ai";
import {
  Brain,
  ArrowLeft,
  Send,
  RefreshCw,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  FileText,
  Bot as RobotIcon,
  Plus,
  MessageSquare,
  Save,
} from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { chatWithAI } from "@/actions/ai";
import { saveReport } from "@/actions/reports";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Robot {
  uuid: string;
  nombre: string;
  estado: string;
}

interface AIChatInterfaceProps {
  initialSensorData: SensorData | null;
}

export default function AIChatInterface({
  initialSensorData,
}: AIChatInterfaceProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(
    initialSensorData
  );
  const [loadingSensorData, setLoadingSensorData] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<string>("all");
  const [loadingRobots, setLoadingRobots] = useState(false);
  const [savedChats, setSavedChats] = useState<{ [key: string]: Message[] }>(
    {}
  );
  const [currentChatId, setCurrentChatId] = useState<string>("default");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados para paneles colapsables

  // Función para guardar el chat en la base de datos
  const saveChatToDatabase = async () => {
    if (messages.length <= 1) {
      toast({
        title: "No hay conversación",
        description: "No hay mensajes para guardar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear el reporte en formato Markdown
      const reportContent = messages
        .filter(
          (msg) =>
            msg.role !== "assistant" ||
            !msg.content.includes("¡Bienvenido a AgroTico AI!")
        )
        .map((msg) => {
          if (msg.role === "user") {
            return `## Pregunta del Usuario\n\n${msg.content}`;
          } else {
            return `## Respuesta de AgroTico AI\n\n${msg.content}`;
          }
        })
        .join("\n\n---\n\n");

      // Obtener el robot seleccionado
      const robotUuid = selectedRobot === "all" ? null : selectedRobot;

      // Llamar a la función de guardar reporte
      const result = await saveReport(
        robotUuid || "general", // Usar "general" si no hay robot específico
        reportContent,
        new Date().toISOString().split("T")[0] // Fecha actual en formato YYYY-MM-DD
      );

      if (result.success) {
        toast({
          title: "✅ Chat guardado",
          description:
            "La conversación se ha guardado exitosamente en la base de datos.",
        });
      } else {
        toast({
          title: "❌ Error al guardar",
          description: result.error || "No se pudo guardar la conversación.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al guardar chat:", error);
      toast({
        title: "❌ Error al guardar",
        description: "Ocurrió un error inesperado al guardar la conversación.",
        variant: "destructive",
      });
    }
  };

  const { toast } = useToast();

  // Manual chat state management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `# 🌱 ¡Bienvenido a AgroTico AI!

Soy tu asistente especializado en **agricultura de precisión** y análisis de datos agrícolas. Estoy aquí para ayudarte a optimizar tus cultivos y tomar decisiones informadas basadas en los datos de tus sensores.

## 🎯 ¿En qué puedo ayudarte?

- **📊 Análisis de datos**: Interpretación de condiciones ambientales
- **🌱 Recomendaciones de cultivos**: Qué plantar según las condiciones
- **💧 Gestión del riego**: Optimización del uso del agua
- **⚠️ Alertas tempranas**: Detección de problemas potenciales
- **🔬 Diagnóstico**: Identificación de enfermedades y plagas
- **📈 Optimización**: Mejora del rendimiento de cultivos

## 💡 Ejemplos de preguntas:
- "¿Cómo están mis cultivos hoy?"
- "¿Necesito regar más?"
- "¿Qué cultivos son mejores para esta época?"
- "¿Hay algún problema con mis plantas?"

**¿En qué puedo ayudarte hoy?** 🤔`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Cargar robots del usuario
  const loadRobots = async () => {
    setLoadingRobots(true);
    try {
      const response = await fetch("/api/analytics/robots");

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data && data.data.robots) {
          setRobots(data.data.robots);
        } else {
          setRobots([]);
        }
      } else {
        console.error("❌ Error en la respuesta:", response.status);
        setRobots([]);
      }
    } catch (error) {
      console.error("❌ Error loading robots:", error);
      setRobots([]);
    } finally {
      setLoadingRobots(false);
    }
  };

  // Actualizar datos de sensores basado en robot seleccionado
  const updateSensorData = async (robotUuid: string) => {
    setLoadingSensorData(true);
    try {
      const response = await fetch(`/api/analytics/current?robot=${robotUuid}`);

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const robotData = data.data[0];

          setSensorData({
            id: 0,
            robot_uuid: robotData.robot_uuid || "",
            timestamp: new Date().toISOString(),
            location: {
              latitud: robotData.latitud || 0,
              longitud: robotData.longitud || 0,
            },
            temperature: robotData.temperature,
            humidity: robotData.humidity,
            light: robotData.light,
            soil: robotData.soil,
            climate: robotData.climate,
          });
        }
      } else {
        console.error("❌ Error en la respuesta de sensores:", response.status);
      }
    } catch (error) {
      console.error("❌ Error updating sensor data:", error);
    } finally {
      setLoadingSensorData(false);
    }
  };

  // Manejar cambio de robot seleccionado
  const handleRobotChange = (value: string) => {
    setSelectedRobot(value);
    if (value === "all") {
      // Cargar datos de todos los robots (usar datos iniciales)
      setSensorData(initialSensorData);
    } else {
      // Cargar datos del robot específico
      updateSensorData(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      return newMessages;
    });
    setInput("");
    setIsLoading(true);

    try {
      // Call real AI
      const responseText = await chatWithAI(
        [...messages, userMessage],
        sensorData
      );

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          responseText ||
          "Lo siento, no pude procesar tu solicitud. Intenta de nuevo.",
      };

      setMessages((prev) => {
        const newMessages = [...prev, aiResponse];
        // Guardar automáticamente el chat
        setTimeout(() => {
          const updatedChats = {
            ...savedChats,
            [currentChatId]: newMessages,
          };
          setSavedChats(updatedChats);
          localStorage.setItem("ai-chats", JSON.stringify(updatedChats));
        }, 100);
        return newMessages;
      });
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error en chat:", error);
      setIsLoading(false);

      // Add error message
      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Lo siento, hubo un error al procesar tu mensaje. Por favor, verifica tu conexión e intenta de nuevo.",
      };

      setMessages((prev) => [...prev, errorResponse]);

      toast({
        title: "Error en el chat",
        description: "No se pudo procesar tu mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Debug logs for messages
  useEffect(() => {
    // Messages updated
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar robots al montar el componente
  useEffect(() => {
    loadRobots();
    loadSavedChats();
  }, []);

  // Guardar chats en localStorage
  const saveChats = () => {
    try {
      localStorage.setItem("ai-chats", JSON.stringify(savedChats));
    } catch (error) {
      console.error("Error saving chats:", error);
    }
  };

  // Cargar chats desde localStorage
  const loadSavedChats = () => {
    try {
      const saved = localStorage.getItem("ai-chats");
      if (saved) {
        const chats = JSON.parse(saved);
        setSavedChats(chats);
        if (chats[currentChatId]) {
          setMessages(chats[currentChatId]);
        }
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  // Guardar mensajes actuales
  const saveCurrentChat = () => {
    const updatedChats = {
      ...savedChats,
      [currentChatId]: messages,
    };
    setSavedChats(updatedChats);
    localStorage.setItem("ai-chats", JSON.stringify(updatedChats));
  };

  // Crear nuevo chat
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "¡Hola! Soy tu asistente de IA agrícola. Puedo ayudarte a analizar tus datos de sensores, dar recomendaciones sobre cultivos, y responder preguntas sobre agricultura. ¿En qué puedo ayudarte hoy?",
      },
    ]);
  };

  // Cargar chat específico
  const loadChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (savedChats[chatId]) {
      setMessages(savedChats[chatId]);
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "¡Hola! Soy tu asistente de IA agrícola. Puedo ayudarte a analizar tus datos de sensores, dar recomendaciones sobre cultivos, y responder preguntas sobre agricultura. ¿En qué puedo ayudarte hoy?",
        },
      ]);
    }
  };

  // Handle sensor data refresh
  const handleRefreshSensorData = async () => {
    setLoadingSensorData(true);
    try {
      // Simulate API call to refresh sensor data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Datos actualizados",
        description: "Los datos de sensores se han actualizado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos de sensores.",
        variant: "destructive",
      });
    } finally {
      setLoadingSensorData(false);
    }
  };

  // Handle clear chat
  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "¡Hola! Soy tu asistente de IA agrícola. Puedo ayudarte a analizar tus datos de sensores, dar recomendaciones sobre cultivos, y responder preguntas sobre agricultura. ¿En qué puedo ayudarte hoy?",
      },
    ]);
    toast({
      title: "Chat limpiado",
      description: "La conversación ha sido reiniciada.",
    });
  };

  // Handle copy message
  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copiado",
        description: "El mensaje se ha copiado al portapapeles.",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el mensaje.",
        variant: "destructive",
      });
    }
  };

  // Handle download chat
  const handleDownloadChat = () => {
    const chatContent = messages
      .map(
        (msg) =>
          `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`
      )
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-agricola-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat descargado",
      description: "La conversación se ha descargado como archivo de texto.",
    });
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      // Verificar que hay mensajes para generar reporte
      if (messages.length <= 1) {
        toast({
          title: "No hay conversación",
          description:
            "Necesitas tener una conversación para generar un reporte.",
          variant: "destructive",
        });
        return;
      }

      // Verificar que hay respuestas del asistente
      const assistantMessages = messages.filter(
        (msg) => msg.role === "assistant"
      );
      if (assistantMessages.length === 0) {
        toast({
          title: "No hay respuestas del asistente",
          description:
            "Necesitas respuestas del asistente para generar un reporte.",
          variant: "destructive",
        });
        return;
      }

      // Generar reporte basado en la conversación y datos de sensores
      const reportContent = `# Reporte Agrícola - ${new Date().toLocaleDateString()}

## 📊 Datos de Sensores

${
  sensorData
    ? `
- **Temperatura**: ${sensorData.temperature?.temperatura_celsius || "N/A"}°C
- **Humedad**: ${sensorData.humidity?.humedad_pct || "N/A"}%
- **Luminosidad**: ${sensorData.light?.lux || "N/A"} lux
- **Humedad del Suelo**: ${sensorData.soil?.humedad_suelo || "N/A"}%
- **Temperatura del Suelo**: ${
        sensorData.soil?.temperatura_suelo_celsius || "N/A"
      }°C
`
    : "Datos de sensores no disponibles"
}

## 💬 Conversación

${messages
  .filter((msg) => msg.role === "assistant")
  .map((msg) => `### ${msg.content}`)
  .join("\n\n")}

---
*Reporte generado automáticamente el ${new Date().toLocaleString()}*
`;

      // Guardar reporte en la base de datos
      const result = await saveReport(
        "default-robot-uuid", // TODO: Obtener UUID del robot actual
        reportContent
      );

      if (result.success) {
        toast({
          title: "Reporte generado",
          description: `Reporte guardado con ID: ${result.id}`,
        });

        // Agregar mensaje de confirmación al chat
        const confirmationMessage: Message = {
          id: `report-${Date.now()}`,
          role: "assistant",
          content: `✅ **Reporte generado exitosamente**

📊 **ID del Reporte**: ${result.id}
📅 **Fecha**: ${new Date().toLocaleDateString()}
📝 **Contenido**: Incluye datos de sensores y conversación

El reporte ha sido guardado en la base de datos y está disponible para consulta.`,
        };

        setMessages((prev) => [...prev, confirmationMessage]);
      } else {
        toast({
          title: "Error al generar reporte",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Link href="/" className="flex items-center mr-4">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-shrink-0 flex items-center min-w-0">
                <Brain className="h-8 w-8 text-purple-600 mr-3" />
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    Asistente de IA Agrícola
                  </h1>
                  <p className="text-sm text-gray-500 truncate">
                    Análisis inteligente de datos agrícolas
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={saveChatToDatabase}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                disabled={messages.length <= 1}
              >
                <Save className="h-3 w-3 mr-1" />
                Guardar Chat
              </Button>
              <Button
                onClick={handleRefreshSensorData}
                disabled={loadingSensorData}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    loadingSensorData ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </Button>
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reporte
              </Button>
              <Button onClick={handleClearChat} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Unified Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Interface */}
        <main className="flex-1 flex flex-col bg-white min-w-0">
          {/* Unified Control Panel */}
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Robot Selection */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <RobotIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Robot Seleccionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Select
                      value={selectedRobot}
                      onValueChange={handleRobotChange}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Seleccionar robot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center">
                            <RobotIcon className="h-4 w-4 mr-2" />
                            <span>Todos los robots</span>
                          </div>
                        </SelectItem>
                        {robots.map((robot) => (
                          <SelectItem key={robot.uuid} value={robot.uuid}>
                            <div className="flex items-center">
                              <RobotIcon className="h-4 w-4 mr-2" />
                              <span>{robot.nombre || robot.uuid}</span>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                                style={{
                                  backgroundColor:
                                    robot.estado === "activo"
                                      ? "#4caf50"
                                      : "#ff9800",
                                  color: "white",
                                }}
                              >
                                {robot.estado}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loadingRobots && (
                      <div className="flex items-center justify-center mt-2">
                        <LoadingSpinner />
                        <span className="ml-2 text-xs text-gray-600">
                          Cargando robots...
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sensor Data */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-2 text-green-600" />
                        Sensores Locales
                      </div>
                      {sensorData && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          📡 Activos
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!sensorData ? (
                      <div className="flex items-center justify-center p-2">
                        <LoadingSpinner />
                        <span className="ml-2 text-xs text-gray-600">
                          Cargando...
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {sensorData.temperature && (
                          <div className="flex items-center p-2 bg-blue-50 rounded border border-blue-200">
                            <Thermometer className="h-3 w-3 text-blue-600 mr-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {sensorData.temperature.temperatura_celsius}°C
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {sensorData.temperature.presion_hpa} hPa
                              </p>
                            </div>
                          </div>
                        )}

                        {sensorData.humidity && (
                          <div className="flex items-center p-2 bg-green-50 rounded border border-green-200">
                            <Droplets className="h-3 w-3 text-green-600 mr-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {sensorData.humidity.humedad_pct}%
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {sensorData.humidity.co2_ppm} ppm
                              </p>
                            </div>
                          </div>
                        )}

                        {sensorData.light && (
                          <div className="flex items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                            <Sun className="h-3 w-3 text-yellow-600 mr-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {sensorData.light.lux} lux
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                UV: {sensorData.light.indice_uv}
                              </p>
                            </div>
                          </div>
                        )}

                        {sensorData.soil && (
                          <div className="flex items-center p-2 bg-orange-50 rounded border border-orange-200">
                            <Leaf className="h-3 w-3 text-orange-600 mr-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {sensorData.soil.humedad_suelo}%
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {sensorData.soil.temperatura_suelo_celsius}°C
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chat Management */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
                        Chats Guardados
                      </div>
                      <Button
                        onClick={createNewChat}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {Object.keys(savedChats).map((chatId) => (
                        <div
                          key={chatId}
                          onClick={() => loadChat(chatId)}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            currentChatId === chatId
                              ? "bg-purple-50 border border-purple-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1">
                              <MessageSquare className="h-3 w-3 mr-2 text-gray-500 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate">
                                {chatId === "default"
                                  ? "Chat Principal"
                                  : `Chat ${chatId.split("-")[1]}`}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {savedChats[chatId]?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-6xl mx-auto space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] group`}
                  >
                    <div
                      className={`relative overflow-hidden ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto shadow-lg"
                          : "bg-white text-gray-900 shadow-lg border border-gray-200"
                      } rounded-2xl`}
                    >
                      {/* Header del mensaje */}
                      <div
                        className={`px-5 py-4 border-b ${
                          message.role === "user"
                            ? "border-blue-400/30"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.role === "user"
                                  ? "bg-blue-400"
                                  : "bg-green-100"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div>
                              <span
                                className={`text-sm font-semibold ${
                                  message.role === "user"
                                    ? "text-white"
                                    : "text-gray-800"
                                }`}
                              >
                                {message.role === "user" ? "Tú" : "AgroTico AI"}
                              </span>
                              {message.role === "assistant" && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  🌱 Especialista Agrícola
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyMessage(message.content, message.id)
                              }
                              className={`h-7 w-7 p-0 ${
                                message.role === "user"
                                  ? "hover:bg-blue-400/20 text-white"
                                  : "hover:bg-gray-100 text-gray-600"
                              }`}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Contenido del mensaje */}
                      <div className="px-5 py-6">
                        <div className="prose prose-sm max-w-none break-words prose-p:mb-4 prose-headings:mb-3 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1">
                          {message.role === "assistant" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap text-white leading-relaxed">
                              {message.content}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Decoración sutil */}
                      {message.role === "assistant" && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-400"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de procesamiento */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]`}>
                    <div className="relative overflow-hidden bg-white text-gray-900 shadow-lg border border-gray-200 rounded-2xl">
                      {/* Header del mensaje */}
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                            <Bot className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800">
                              AgroTico AI
                            </span>
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              🌱 Especialista Agrícola
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contenido del mensaje */}
                      <div className="px-5 py-6">
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-gray-800">
                              Analizando tus datos agrícolas...
                            </span>
                            <p className="text-xs text-gray-600 mt-1">
                              Procesando información de sensores y generando
                              recomendaciones
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Decoración sutil */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-400"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t bg-white p-4">
            <div className="max-w-6xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="flex items-center space-x-3"
              >
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Escribe tu pregunta sobre agricultura..."
                    disabled={isLoading}
                    className="pr-14 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="px-6"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <span>Enviar</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
