import type { KochstueckConfig, KochstueckResult, QuellstueckConfig, QuellstueckResult } from '../types'

export function calcKochstueck(cfg: KochstueckConfig): KochstueckResult {
  return {
    flourGrams: cfg.flourGrams,
    waterGrams: cfg.waterGrams,
    flourGrain: cfg.flourGrain,
    flourType: cfg.flourType,
  }
}

export function calcQuellstueck(cfg: QuellstueckConfig): QuellstueckResult {
  const totalIngredientGrams = cfg.entries.reduce((s, e) => s + e.grams, 0)

  // Absorbed water = weighted average absorptionPct × soakingWater
  const weightedAbsorptionPct = totalIngredientGrams > 0
    ? cfg.entries.reduce((s, e) => s + (e.grams / totalIngredientGrams) * e.absorptionPct, 0)
    : 0
  const absorbedWaterGrams = cfg.soakingWaterGrams * weightedAbsorptionPct / 100

  return {
    entries: cfg.entries.map(e => ({ name: e.name, grams: e.grams })),
    soakingWaterGrams: cfg.soakingWaterGrams,
    absorbedWaterGrams,
  }
}
