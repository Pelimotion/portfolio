export interface MarineConditions {
  tideState: 'fluxo' | 'refluxo' | 'estofo';
  lunarPhase: string;
  waterClarityIndex: number; // 0.0 a 1.0
  source: 'satélite' | 'efeméride astronômica';
}

/**
 * Cálculo astronômico determinístico da fase lunar (Ciclo sinódico ~29.53 dias)
 */
function calculateDeterministicLunarPhase(date: Date = new Date()): { phaseName: string; illumination: number } {
  // Marco zero: Lua Nova de 11 de janeiro de 2024
  const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57));
  const synodicMonth = 29.53058867;
  const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const cycleDay = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseFraction = cycleDay / synodicMonth;

  let phaseName = 'Lua Nova';
  if (phaseFraction > 0.03 && phaseFraction < 0.22) phaseName = 'Crescente Côncava';
  else if (phaseFraction >= 0.22 && phaseFraction <= 0.28) phaseName = 'Quarto Crescente';
  else if (phaseFraction > 0.28 && phaseFraction < 0.47) phaseName = 'Crescente Convexa';
  else if (phaseFraction >= 0.47 && phaseFraction <= 0.53) phaseName = 'Lua Cheia';
  else if (phaseFraction > 0.53 && phaseFraction < 0.72) phaseName = 'Minguante Convexa';
  else if (phaseFraction >= 0.72 && phaseFraction <= 0.78) phaseName = 'Quarto Minguante';
  else if (phaseFraction > 0.78 && phaseFraction <= 0.97) phaseName = 'Minguante Côncava';

  const illumination = 0.5 * (1 - Math.cos(phaseFraction * 2 * Math.PI));
  return { phaseName, illumination };
}

export async function getMarineConditions(): Promise<MarineConditions> {
  const { phaseName, illumination } = calculateDeterministicLunarPhase();

  // Maré semidiurna baseada na hora solar local
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const tideCycle = Math.sin((hour / 12.42) * 2 * Math.PI);
  let tideState: 'fluxo' | 'refluxo' | 'estofo' = 'estofo';

  if (tideCycle > 0.25) tideState = 'fluxo';
  else if (tideCycle < -0.25) tideState = 'refluxo';

  return {
    tideState,
    lunarPhase: phaseName,
    waterClarityIndex: 0.65 + illumination * 0.25,
    source: 'efeméride astronômica'
  };
}
