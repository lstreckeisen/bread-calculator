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
  // Soaking water is fully deducted from the main dough water
  return {
    entries: cfg.entries.map(e => ({ name: e.name, grams: e.grams })),
    soakingWaterGrams: cfg.soakingWaterGrams,
    absorbedWaterGrams: cfg.soakingWaterGrams,
  }
}
