import { deepseek } from '@ai-sdk/deepseek';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

// Esquemas de validación para los datos de entrada y salida
const SensorDataSchema = z.object({
  temperature: z.object({
    temperatura_celsius: z.string(),
    presion_hpa: z.string(),
  }).optional(),
  humidity: z.object({
    humedad_pct: z.string(),
    co2_ppm: z.string(),
  }).optional(),
  soil: z.object({
    humedad_suelo: z.number(),
    temperatura_suelo_celsius: z.string(),
  }).optional(),
  light: z.object({
    lux: z.string(),
    indice_uv: z.string(),
  }).optional(),
});

const ClimatePredictionSchema = z.object({
  mes: z.string(),
  temperatura_promedio: z.number(),
  humedad_promedio: z.number(),
  precipitacion_esperada: z.number(),
  dias_lluvia: z.number(),
  indice_uv_promedio: z.number(),
  viento_promedio: z.number(),
  probabilidad_sequia: z.number(),
  probabilidad_inundacion: z.number(),
  recomendacion_climatica: z.string(),
});

const CropRecommendationSchema = z.object({
  cultivo: z.string(),
  variedad: z.string(),
  epoca_plantacion: z.string(),
  epoca_cosecha: z.string(),
  rendimiento_esperado: z.string(),
  requerimientos_agua: z.string(),
  tolerancia_temperatura: z.string(),
  dias_madurez: z.number(),
  tecnica_cultivo: z.string(),
  ventajas: z.array(z.string()),
  desafios: z.array(z.string()),
  precio_mercado_estimado: z.string(),
  sostenibilidad: z.string(),
});

const SoilAnalysisSchema = z.object({
  salud_suelo: z.number(),
  ph_estimado: z.number(),
  materia_organica: z.number(),
  nitrogeno: z.number(),
  fosforo: z.number(),
  potasio: z.number(),
  textura: z.string(),
  drenaje: z.string(),
  compactacion: z.string(),
  recomendaciones_mejora: z.array(z.string()),
  cultivos_aptos: z.array(z.string()),
  cultivos_no_recomendados: z.array(z.string()),
});

const AIAnalysisSchema = z.object({
  analisis_general: z.string(),
  condiciones_terreno: SoilAnalysisSchema,
  predicciones_climaticas: z.array(ClimatePredictionSchema),
  recomendaciones_cultivos: z.array(CropRecommendationSchema),
  factores_riesgo: z.array(z.string()),
  oportunidades_optimizacion: z.array(z.string()),
  plan_6_meses: z.array(z.object({
    mes: z.string(),
    actividades: z.array(z.string()),
    cultivos_recomendados: z.array(z.string()),
    alertas: z.array(z.string()),
  })),
  score_sostenibilidad: z.number(),
  score_rentabilidad: z.number(),
  score_riesgo: z.number(),
  confianza_analisis: z.number(),
  fecha_analisis: z.string(),
  modelo_ia: z.string(),
});

export type SensorData = z.infer<typeof SensorDataSchema>;
export type ClimatePrediction = z.infer<typeof ClimatePredictionSchema>;
export type CropRecommendation = z.infer<typeof CropRecommendationSchema>;
export type SoilAnalysis = z.infer<typeof SoilAnalysisSchema>;
export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;

export class AIService {
  private static instance: AIService;
  private deepseekModel = deepseek('deepseek-chat');

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeAgriculturalConditions(
    sensorData: SensorData,
    robotId: string,
    location?: string
  ): Promise<AIAnalysis> {
    try {
      // Preparar datos de sensores para el análisis
      const sensorSummary = this.prepareSensorSummary(sensorData);
      
      // Generar contexto geográfico y temporal
      const context = this.generateContext(location);
      
      // Crear prompt detallado para análisis agrícola avanzado
      const prompt = this.createAdvancedPrompt(sensorSummary, context, robotId);

      console.log('🤖 Iniciando análisis de IA avanzado con DeepSeek...');
      console.log('📊 Datos de sensores:', sensorSummary);

      // Usar DeepSeek para análisis complejo de agricultura
      const result = await generateObject({
        model: this.deepseekModel,
        schema: AIAnalysisSchema,
        prompt: prompt,
        temperature: 0.7,
      });

      console.log('✅ Análisis de IA completado con DeepSeek');
      console.log('🎯 Score de confianza:', result.object.confianza_analisis);

      return result.object;
    } catch (error) {
      console.error('❌ Error en análisis de IA:', error);
      
      // Fallback con análisis básico
      return this.generateFallbackAnalysis(sensorData, robotId);
    }
  }

  private prepareSensorSummary(sensorData: SensorData): string {
    const parts = [];
    
    if (sensorData.temperature) {
      parts.push(`Temperatura: ${sensorData.temperature.temperatura_celsius}°C, Presión: ${sensorData.temperature.presion_hpa} hPa`);
    }
    
    if (sensorData.humidity) {
      parts.push(`Humedad: ${sensorData.humidity.humedad_pct}%, CO2: ${sensorData.humidity.co2_ppm} ppm`);
    }
    
    if (sensorData.soil) {
      parts.push(`Humedad del suelo: ${sensorData.soil.humedad_suelo}%, Temperatura del suelo: ${sensorData.soil.temperatura_suelo_celsius}°C`);
    }
    
    if (sensorData.light) {
      parts.push(`Luz: ${sensorData.light.lux} lux, Índice UV: ${sensorData.light.indice_uv}`);
    }
    
    return parts.join('; ');
  }

  private generateContext(location?: string): string {
    const currentDate = new Date();
    const season = this.getSeason(currentDate);
    const hemisphere = location?.toLowerCase().includes('norte') ? 'norte' : 'sur';
    
    return `
Contexto geográfico y temporal:
- Ubicación: ${location || 'Región tropical'}
- Hemisferio: ${hemisphere}
- Estación actual: ${season}
- Fecha: ${currentDate.toLocaleDateString('es-ES')}
- Época de plantación: ${this.getPlantingSeason(season)}
    `.trim();
  }

  private getSeason(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Primavera';
    if (month >= 6 && month <= 8) return 'Verano';
    if (month >= 9 && month <= 11) return 'Otoño';
    return 'Invierno';
  }

  private getPlantingSeason(season: string): string {
    const seasonMap: Record<string, string> = {
      'Primavera': 'Época ideal para siembra de cultivos de verano',
      'Verano': 'Época de mantenimiento y cosecha temprana',
      'Otoño': 'Época de siembra de cultivos de invierno',
      'Invierno': 'Época de preparación del suelo y planificación'
    };
    return seasonMap[season] || 'Época de transición';
  }

  private createAdvancedPrompt(sensorSummary: string, context: string, robotId: string): string {
    return `
Eres un experto en agricultura de precisión y análisis climático con acceso a modelos IPCC. 
Analiza las siguientes condiciones del terreno y proporciona recomendaciones detalladas.

${context}

Datos de sensores del robot ${robotId}:
${sensorSummary}

INSTRUCCIONES ESPECÍFICAS:

1. ANÁLISIS DEL TERRENO:
   - Evalúa la salud del suelo basándote en los datos de humedad y temperatura
   - Estima pH, materia orgánica y nutrientes principales
   - Identifica textura del suelo y capacidad de drenaje
   - Detecta problemas de compactación o erosión

2. PREDICCIONES CLIMÁTICAS (6 MESES):
   - Usa modelos IPCC para proyecciones de temperatura y precipitación
   - Incluye análisis de eventos extremos (sequías, inundaciones)
   - Considera variabilidad climática regional
   - Evalúa riesgos de heladas, granizo, vientos fuertes

3. RECOMENDACIONES DE CULTIVOS:
   - Sugiere cultivos viables para cada época del año
   - Incluye variedades específicas adaptadas al clima local
   - Considera rotación de cultivos y sostenibilidad
   - Evalúa rentabilidad y demanda del mercado

4. PLAN DE 6 MESES:
   - Cronograma detallado de actividades agrícolas
   - Momentos óptimos para siembra, riego, fertilización
   - Alertas tempranas para riesgos climáticos
   - Estrategias de mitigación y adaptación

5. ANÁLISIS DE SOSTENIBILIDAD:
   - Evalúa impacto ambiental de las recomendaciones
   - Sugiere prácticas de agricultura regenerativa
   - Optimiza uso de agua y fertilizantes
   - Promueve biodiversidad y salud del suelo

IMPORTANTE: Proporciona un análisis completo, preciso y accionable que permita al agricultor tomar decisiones informadas para los próximos 6 meses. 
Usa datos científicos y modelos climáticos para fundamentar tus recomendaciones.
    `.trim();
  }

  private generateFallbackAnalysis(sensorData: SensorData, robotId: string): AIAnalysis {
    const currentDate = new Date();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const temp = sensorData.temperature ? parseFloat(sensorData.temperature.temperatura_celsius) : 25;
    const humidity = sensorData.humidity ? parseFloat(sensorData.humidity.humedad_pct) : 50;
    const soilHumidity = sensorData.soil ? sensorData.soil.humedad_suelo : 300;
    const light = sensorData.light ? parseFloat(sensorData.light.lux) : 50;

    return {
      analisis_general: `Análisis básico basado en datos actuales de sensores. Se recomienda recopilar más datos históricos para un análisis más preciso.`,
      condiciones_terreno: {
        salud_suelo: Math.min(100, Math.max(0, soilHumidity / 5 + temp * 2 + humidity / 2)),
        ph_estimado: 6.5 + (temp - 25) * 0.02,
        materia_organica: Math.min(5, Math.max(1, soilHumidity / 100)),
        nitrogeno: Math.min(100, Math.max(20, soilHumidity / 3)),
        fosforo: Math.min(80, Math.max(15, soilHumidity / 4)),
        potasio: Math.min(90, Math.max(25, soilHumidity / 3.5)),
        textura: soilHumidity > 400 ? 'Arcillosa' : soilHumidity > 200 ? 'Franca' : 'Arenosa',
        drenaje: soilHumidity > 400 ? 'Limitado' : 'Bueno',
        compactacion: soilHumidity > 500 ? 'Alta' : 'Normal',
        recomendaciones_mejora: [
          'Añadir materia orgánica',
          'Mejorar drenaje si es necesario',
          'Rotación de cultivos'
        ],
        cultivos_aptos: ['Tomate', 'Lechuga', 'Pimiento'],
        cultivos_no_recomendados: ['Arroz', 'Caña de azúcar']
      },
      predicciones_climaticas: Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentDate.getMonth() + i) % 12;
        return {
          mes: months[monthIndex],
          temperatura_promedio: temp + (Math.random() - 0.5) * 4,
          humedad_promedio: humidity + (Math.random() - 0.5) * 10,
          precipitacion_esperada: Math.random() * 200,
          dias_lluvia: Math.floor(Math.random() * 15),
          indice_uv_promedio: light / 1000 + Math.random() * 2,
          viento_promedio: Math.random() * 20,
          probabilidad_sequia: Math.random() * 30,
          probabilidad_inundacion: Math.random() * 20,
          recomendacion_climatica: 'Condiciones estables para la agricultura'
        };
      }),
      recomendaciones_cultivos: [
        {
          cultivo: 'Tomate',
          variedad: 'Cherry',
          epoca_plantacion: 'Primavera',
          epoca_cosecha: 'Verano',
          rendimiento_esperado: 'Alto',
          requerimientos_agua: 'Moderados',
          tolerancia_temperatura: '15-30°C',
          dias_madurez: 75,
          tecnica_cultivo: 'Invernadero',
          ventajas: ['Alto rendimiento', 'Resistente'],
          desafios: ['Requiere tutoreo'],
          precio_mercado_estimado: '$2-4/kg',
          sostenibilidad: 'Buena'
        }
      ],
      factores_riesgo: [
        'Variabilidad climática',
        'Precios de mercado fluctuantes'
      ],
      oportunidades_optimizacion: [
        'Implementar riego por goteo',
        'Usar fertilizantes orgánicos'
      ],
      plan_6_meses: Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentDate.getMonth() + i) % 12;
        return {
          mes: months[monthIndex],
          actividades: ['Preparación del suelo', 'Siembra', 'Mantenimiento'],
          cultivos_recomendados: ['Tomate', 'Lechuga'],
          alertas: ['Monitorear humedad del suelo']
        };
      }),
      score_sostenibilidad: 75,
      score_rentabilidad: 80,
      score_riesgo: 30,
      confianza_analisis: 60,
      fecha_analisis: currentDate.toISOString(),
      modelo_ia: 'AgroTico AI v3.1 con DeepSeek (Fallback)'
    };
  }
}

export default AIService;
