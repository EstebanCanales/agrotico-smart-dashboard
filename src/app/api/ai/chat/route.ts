import { chatWithAI } from "@/actions/ai";

export async function POST(request: Request) {
  try {
    const { messages, currentSensorData } = await request.json();
    
    const response = await chatWithAI(messages, currentSensorData);
    
    // Asegurar que siempre devolvemos un Response
    if (typeof response === 'string') {
      return new Response(
        JSON.stringify({ message: response }),
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    return response;
  } catch (error) {
    console.error("❌ API Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}



