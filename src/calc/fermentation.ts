import type { FermentationConfig, FermentationResult, StuckgareConfig, StuckgareResult } from '../types'

const Q10 = 2.0
// Power law exponent for piece-weight scaling (surface-to-volume approximation for spherical loaves)
const PIECE_WEIGHT_EXPONENT = 1 / 3

/**
 * Estimate bulk fermentation time (hours) given levain % and temperature.
 * Uses Q10 temperature scaling combined with inverse linear levain % scaling.
 */
export function estimateTime(
  levainPct: number,
  temp: number,
  refTemp: number,
  refLevainPct: number,
  refTimeHours: number,
): number {
  const tempFactor = Math.pow(Q10, (refTemp - temp) / 10)
  const levainFactor = refLevainPct / levainPct
  return refTimeHours * tempFactor * levainFactor
}

/**
 * Estimate levain % needed to achieve a target fermentation duration.
 */
export function estimateLevainPct(
  targetHours: number,
  temp: number,
  refTemp: number,
  refLevainPct: number,
  refTimeHours: number,
): number {
  const tempFactor = Math.pow(Q10, (refTemp - temp) / 10)
  return refLevainPct * refTimeHours * tempFactor / targetHours
}

export function calcStuckgare(cfg: StuckgareConfig, levainPct: number, pieceWeightG: number | null): StuckgareResult {
  const { temperature, referenceTemp, referenceLevainPct, referenceTimeHours, usePieceWeight, referencePieceWeightG } = cfg

  const pieceWeightUsed = usePieceWeight && pieceWeightG !== null ? pieceWeightG : null
  const pieceWeightFactor = pieceWeightUsed !== null && referencePieceWeightG > 0
    ? Math.pow(referencePieceWeightG / pieceWeightUsed, PIECE_WEIGHT_EXPONENT)
    : 1

  const estimatedHours = estimateTime(levainPct, temperature, referenceTemp, referenceLevainPct, referenceTimeHours) * pieceWeightFactor

  const estimatedLevainPct = cfg.levainTarget.enabled
    ? estimateLevainPct(cfg.levainTarget.targetHours / pieceWeightFactor, temperature, referenceTemp, referenceLevainPct, referenceTimeHours)
    : null
  const levainTargetHours = cfg.levainTarget.enabled ? cfg.levainTarget.targetHours : null

  return { estimatedHours, estimatedLevainPct, levainTargetHours, pieceWeightUsed }
}

export function calcFermentation(cfg: FermentationConfig, levainPct: number, pieceWeightG: number | null = null): FermentationResult {
  const { temperature, referenceTemp, referenceLevainPct, referenceTimeHours } = cfg

  const estimatedHours = estimateTime(levainPct, temperature, referenceTemp, referenceLevainPct, referenceTimeHours)

  const estimatedLevainPct = cfg.levainTarget.enabled
    ? estimateLevainPct(cfg.levainTarget.targetHours, temperature, referenceTemp, referenceLevainPct, referenceTimeHours)
    : null
  const levainTargetHours = cfg.levainTarget.enabled ? cfg.levainTarget.targetHours : null

  const stuckgare = cfg.stuckgare.enabled
    ? calcStuckgare(cfg.stuckgare, levainPct, pieceWeightG)
    : null

  return { estimatedHours, estimatedLevainPct, levainTargetHours, stuckgare }
}
