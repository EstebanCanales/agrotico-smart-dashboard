/**
 * Weather simulation utilities and configuration
 */

// Optimal conditions for different crops
// Optimal conditions for different crops
export const CROP_OPTIMAL_CONDITIONS = {
  cafe: { temperature: 22, precipitation: 8 },
  maiz: { temperature: 24, precipitation: 10 },
  arroz: { temperature: 26, precipitation: 15 },
  platano: { temperature: 27, precipitation: 12 },
  papa: { temperature: 18, precipitation: 7 },
  tomate: { temperature: 24, precipitation: 6 },
  cacao: { temperature: 25, precipitation: 14 },
  caña: { temperature: 28, precipitation: 9 },
  frijol: { temperature: 23, precipitation: 8 },
  yuca: { temperature: 26, precipitation: 10 },
  piña: { temperature: 27, precipitation: 11 },
  mango: { temperature: 30, precipitation: 5 },
  aguacate: { temperature: 24, precipitation: 9 },
  cebolla: { temperature: 22, precipitation: 6 },
  lechuga: { temperature: 18, precipitation: 5 },
  zanahoria: { temperature: 19, precipitation: 6 },
  sandía: { temperature: 29, precipitation: 8 },
  melón: { temperature: 28, precipitation: 7 },
  repollo: { temperature: 20, precipitation: 6 },
  // fallback
  default: { temperature: 24, precipitation: 10 },
} as const;


// Impact calculation weights
export const IMPACT_WEIGHTS = {
  temperatureSensitivity: 5,
  precipitationSensitivity: 3,
} as const;

/**
 * Calculate yield impact based on weather conditions and crop type
 * @param temp - Current temperature in Celsius
 * @param precip - Current precipitation in mm
 * @param cropType - Type of crop being grown
 * @returns Yield impact percentage (0-100)
 */
export function calculateYieldImpact(
  temp: number,
  precip: number,
  cropType: string
): number {
  const conditions = CROP_OPTIMAL_CONDITIONS[cropType as keyof typeof CROP_OPTIMAL_CONDITIONS] 
    || CROP_OPTIMAL_CONDITIONS.default;
  
  const tempDiff = Math.abs(temp - conditions.temperature);
  const tempImpact = Math.max(0, 100 - tempDiff * IMPACT_WEIGHTS.temperatureSensitivity);
  
  const precipDiff = Math.abs(precip - conditions.precipitation);
  const precipImpact = Math.max(0, 100 - precipDiff * IMPACT_WEIGHTS.precipitationSensitivity);
  
  return (tempImpact + precipImpact) / 2;
}

/**
 * Generate deterministic pseudo-random number based on seed
 * @param seed - Seed value
 * @param index - Index for variation
 * @returns Pseudo-random number between 0 and 1
 */
export function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 2.5) * 10000;
  return x - Math.floor(x);
}
