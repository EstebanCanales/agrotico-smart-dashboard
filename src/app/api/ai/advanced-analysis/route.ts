import { NextRequest, NextResponse } from 'next/server';
import AIServiceImproved from '@/services/aiServiceImproved';

export async function POST(request: NextRequest) {
  try {
    const { sensorData, robotId, location } = await request.json();

    if (!sensorData || !robotId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Datos de sensores y ID del robot son requeridos' 
        },
        { status: 400 }
      );
    }

    const aiService = AIServiceImproved.getInstance();
    const analysis = await aiService.analyzeAgriculturalConditions(
      sensorData,
      robotId,
      location
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Análisis de IA completado exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error en análisis de IA:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor durante el análisis de IA',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
    return NextResponse.json({
      success: true,
      message: 'Endpoint de análisis avanzado de IA con DeepSeek disponible',
      version: '3.1',
      model: 'DeepSeek Chat',
      features: [
        'Análisis de condiciones del terreno',
        'Recomendaciones de cultivos por época',
        'Predicciones climáticas basadas en modelos IPCC',
        'Planificación de 6 meses',
        'Análisis de sostenibilidad',
        'Evaluación de riesgos'
      ]
    });
}
