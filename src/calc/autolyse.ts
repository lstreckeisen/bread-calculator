import type { AutolyseConfig, AutolyseResult } from '../types'

export function calcAutolyse(mainWater: number, cfg: AutolyseConfig): AutolyseResult {
  const autolysisWater = mainWater * cfg.autolyseWaterPct / 100
  const bassinageWater = mainWater * cfg.bassinageWaterPct / 100
  const initialWater = mainWater - autolysisWater - bassinageWater
  return { autolysisWater, bassinageWater, initialWater }
}
