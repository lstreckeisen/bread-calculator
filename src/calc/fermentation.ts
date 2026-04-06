import type { FermentationConfig, FermentationResult, StuckgareConfig, StuckgareResult } from '../types'

const Q10 = 2.0
// Hardcoded calibration constants (reference fermentation baseline)
const REF_TEMP = 20               // °C
const REF_LEVAIN_PCT = 20         // %
const REF_TIME_BULK_HOURS = 4     // hours for bulk fermentation
const REF_TIME_STUCK_HOURS = 1.5  // hours for final proof
const REF_PIECE_WEIGHT_G = 800    // grams
// Power law exponent for piece-weight scaling (surface-to-volume approximation for spherical loaves)
const PIECE_WEIGHT_EXPONENT = 1 / 3

/**
 * Estimate bulk fermentation time (hours) given levain % and temperature.
 * Uses Q10 temperature scaling combined with inverse linear levain % scaling.
 */
export function estimateTime(levainPct: number, temp: number, refTimeHours: number): number {
  const tempFactor = Math.pow(Q10, (REF_TEMP - temp) / 10)
  const levainFactor = REF_LEVAIN_PCT / levainPct
  return refTimeHours * tempFactor * levainFactor
}

/**
 * Estimate levain % needed to achieve a target fermentation duration.
 */
export function estimateLevainPct(targetHours: number, temp: number, refTimeHours: number): number {
  const tempFactor = Math.pow(Q10, (REF_TEMP - temp) / 10)
  return REF_LEVAIN_PCT * refTimeHours * tempFactor / targetHours
}

export function calcStuckgare(cfg: StuckgareConfig, levainPct: number, pieceWeightG: number | null): StuckgareResult {
  const pieceWeightUsed = pieceWeightG !== null ? pieceWeightG : null
  const pieceWeightFactor = pieceWeightUsed !== null
    ? Math.pow(REF_PIECE_WEIGHT_G / pieceWeightUsed, PIECE_WEIGHT_EXPONENT)
    : 1

  const estimatedHours = estimateTime(levainPct, cfg.temperature, REF_TIME_STUCK_HOURS) * pieceWeightFactor

  const estimatedLevainPct = cfg.levainTarget.enabled
    ? estimateLevainPct(cfg.levainTarget.targetHours / pieceWeightFactor, cfg.temperature, REF_TIME_STUCK_HOURS)
    : null
  const levainTargetHours = cfg.levainTarget.enabled ? cfg.levainTarget.targetHours : null

  return { estimatedHours, estimatedLevainPct, levainTargetHours, pieceWeightUsed }
}

export function calcFermentation(cfg: FermentationConfig, levainPct: number, pieceWeightG: number | null = null): FermentationResult {
  const estimatedHours = estimateTime(levainPct, cfg.temperature, REF_TIME_BULK_HOURS)

  const estimatedLevainPct = cfg.levainTarget.enabled
    ? estimateLevainPct(cfg.levainTarget.targetHours, cfg.temperature, REF_TIME_BULK_HOURS)
    : null
  const levainTargetHours = cfg.levainTarget.enabled ? cfg.levainTarget.targetHours : null

  const stuckgare = cfg.stuckgare.enabled
    ? calcStuckgare(cfg.stuckgare, levainPct, pieceWeightG)
    : null

  return { estimatedHours, estimatedLevainPct, levainTargetHours, stuckgare }
}
