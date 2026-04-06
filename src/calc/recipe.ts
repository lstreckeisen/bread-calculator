import type {
  RecipeInput,
  RecipeResult,
  PerFlourEntry,
} from '../types'
import { getAbsorptionMidpoint } from '../data/flours'
import { calcLeaven } from './levain'
import { calcAutolyse } from './autolyse'
import { calcFermentation } from './fermentation'
import { calcEnrichments } from './enrichments'
import { calcInclusions } from './inclusions'
import { calcDoughSplit } from './doughSplit'
import { calcKochstueck, calcQuellstueck } from './preparations'

export function calcWeightedHydrationHint(input: RecipeInput): number {
  const total = input.flourBlend.reduce((sum, e) => sum + e.grams, 0)
  if (total === 0) return 65
  return input.flourBlend.reduce((sum, e) => {
    return sum + (e.grams / total) * getAbsorptionMidpoint(e.grain, e.type)
  }, 0)
}

function validate(input: RecipeInput): string[] {
  const errors: string[] = []
  const totalFlour = input.flourBlend.reduce((sum, e) => sum + e.grams, 0)
  if (totalFlour <= 0) errors.push('Mindestens eine Mehlsorte mit Menge > 0 angeben.')
  if (input.hydration <= 0 || input.hydration >= 200) errors.push('Hydration muss zwischen 1% und 199% liegen.')
  if (input.saltPct < 0) errors.push('Salzanteil darf nicht negativ sein.')
  if (input.flourBlend.length === 0) errors.push('Mindestens eine Mehlsorte angeben.')

  if (input.enrichments.honey.enabled && input.enrichments.honey.amountG < 0) {
    errors.push('Honig-Menge darf nicht negativ sein.')
  }
  if (input.enrichments.malt.enabled && input.enrichments.malt.amountG < 0) {
    errors.push('Backmalz-Menge darf nicht negativ sein.')
  }

  if (input.preparations.kochstueck.enabled) {
    const ks = input.preparations.kochstueck
    const inBlend = input.flourBlend.some(e => e.grain === ks.flourGrain && e.type === ks.flourType)
    if (!inBlend) {
      errors.push(`Kochstück-Mehl (${ks.flourGrain} ${ks.flourType}) ist nicht in der Mehlmischung.`)
    }
    if (ks.flourGrams <= 0) errors.push('Kochstück-Mehlmenge muss grösser als 0 sein.')
    if (ks.waterGrams <= 0) errors.push('Kochstück-Wassermenge muss grösser als 0 sein.')
  }

  if (input.preparations.quellstueck.enabled) {
    if (input.preparations.quellstueck.entries.some(e => e.grams <= 0)) {
      errors.push('Alle Quellstück-Zutatenmengen müssen grösser als 0 sein.')
    }
    if (input.preparations.quellstueck.soakingWaterGrams < 0) {
      errors.push('Quellstück-Quellwasser darf nicht negativ sein.')
    }
  }

  if (input.doughSplit.enabled) {
    if (input.doughSplit.numPieces < 1 || !Number.isInteger(input.doughSplit.numPieces)) {
      errors.push('Anzahl Teigstücke muss eine ganze Zahl ≥ 1 sein.')
    }
    if (input.doughSplit.mode === 'custom') {
      const weights = input.doughSplit.customWeights.slice(0, input.doughSplit.numPieces)
      if (weights.some(w => w <= 0)) {
        errors.push('Alle Teigstück-Gewichte müssen grösser als 0 sein.')
      }
    }
  }

  const mode = input.levain.mode
  if (mode === 'sourdough-direct') {
    if (input.levain.levainPct <= 0) errors.push('Levain-Anteil muss grösser als 0 sein.')
    if (input.levain.starterHydration <= 0) errors.push('Anstellgut-Hydration muss grösser als 0 sein.')
  } else if (mode === 'sourdough-build') {
    if (input.levain.anstellgutGrams < 0) errors.push('Anstellgut-Menge darf nicht negativ sein.')
    if (input.levain.levainFlourGrams <= 0) errors.push('Levain-Mehl muss grösser als 0 sein.')
    if (input.levain.levainHydration <= 0) errors.push('Levain-Hydration muss grösser als 0 sein.')
  } else if (mode === 'fresh-yeast' || mode === 'dry-yeast') {
    if (input.levain.yeastGrams <= 0) errors.push('Hefemenge muss grösser als 0 sein.')
  }

  // Validate levain flour is in blend for sourdough modes
  const sourdoughConfig = mode === 'sourdough-direct' || mode === 'sourdough-build'
    ? input.levain
    : (mode === 'hybrid-yeast-primary' || mode === 'hybrid-sourdough-primary')
    ? input.levain.levain
    : null
  if (sourdoughConfig) {
    const levainFlourInBlend = input.flourBlend.some(
      e => e.grain === sourdoughConfig.flourGrain && e.type === sourdoughConfig.flourType
    )
    if (!levainFlourInBlend) {
      errors.push(`Levain-Mehl (${sourdoughConfig.flourGrain} ${sourdoughConfig.flourType}) ist nicht in der Mehlmischung — bitte Mehlsorte hinzufügen oder Levain-Mehl anpassen.`)
    }
  }

  if (input.autolyse.enabled) {
    const combined = input.autolyse.autolyseWaterPct + input.autolyse.bassinageWaterPct
    if (combined > 100) errors.push(`Autolyse (${input.autolyse.autolyseWaterPct}%) + Bassinage (${input.autolyse.bassinageWaterPct}%) überschreiten 100%.`)
  }

  return errors
}

export function calculate(input: RecipeInput): RecipeResult {
  const errors = validate(input)
  const warnings: string[] = []
  const weightedHydrationHint = calcWeightedHydrationHint(input)

  const empty: RecipeResult = {
    targetWeight: 0, totalFlour: 0, totalWater: 0, totalSalt: 0,
    mainFlour: 0, mainWater: 0,
    weightedHydrationHint,
    perFlour: [],
    levain: { levainTotal: 0, flourInLevain: 0, waterInLevain: 0, yeastGrams: 0, yeastType: null, hint: null },
    autolyse: null, fermentation: null, enrichments: null, inclusions: null,
    doughSplit: null, kochstueck: null, quellstueck: null,
    valid: false, errors, warnings,
  }

  if (errors.length > 0) return empty

  // --- Core baker's math ---
  // totalFlour comes directly from the flour blend inputs (absolute grams)
  const totalFlour = input.flourBlend.reduce((sum, e) => sum + e.grams, 0)
  const totalWater = totalFlour * input.hydration / 100
  const totalSalt  = totalFlour * input.saltPct / 100

  // --- Preparations (Kochstück & Quellstück) ---
  // Computed before levain so deductions are known
  const kochstueck = input.preparations.kochstueck.enabled
    ? calcKochstueck(input.preparations.kochstueck)
    : null
  const quellstueck = input.preparations.quellstueck.enabled
    ? calcQuellstueck(input.preparations.quellstueck)
    : null

  const kochstueckFlourDeduction = kochstueck?.flourGrams ?? 0
  const kochstueckWaterDeduction = kochstueck?.waterGrams ?? 0
  const quellstueckWaterDeduction = quellstueck?.absorbedWaterGrams ?? 0

  // --- Leaven ---
  const levainResult = calcLeaven(input.levain, totalFlour)

  const mainFlour = totalFlour - levainResult.flourInLevain - kochstueckFlourDeduction
  const mainWater = totalWater - levainResult.waterInLevain - kochstueckWaterDeduction - quellstueckWaterDeduction

  if (mainWater < 0) {
    errors.push('Kochstück- und Quellstück-Wasserabzüge überschreiten das verfügbare Hauptteigwasser.')
    return { ...empty, errors }
  }

  // --- Per-flour breakdown ---
  // Levain and Kochstück flour are both subtracted from their specific types.
  const lm = input.levain.mode
  const levainSourdoughCfg = (lm === 'sourdough-direct' || lm === 'sourdough-build')
    ? input.levain
    : (lm === 'hybrid-yeast-primary' || lm === 'hybrid-sourdough-primary')
    ? input.levain.levain
    : null
  const levainGrain = levainSourdoughCfg?.flourGrain ?? null
  const levainType  = levainSourdoughCfg?.flourType ?? null
  const ksGrain = input.preparations.kochstueck.flourGrain
  const ksType  = input.preparations.kochstueck.flourType

  const perFlour: PerFlourEntry[] = input.flourBlend.map(entry => {
    const isLevainFlour = levainGrain !== null && entry.grain === levainGrain && entry.type === levainType
    const isKsFlour = kochstueck && entry.grain === ksGrain && entry.type === ksType
    let deduction = 0
    if (isLevainFlour) deduction += levainResult.flourInLevain
    if (isKsFlour) deduction += kochstueckFlourDeduction
    const mainFlourGrams = Math.max(0, entry.grams - deduction)
    return { grain: entry.grain, type: entry.type, flourGrams: entry.grams, mainFlourGrams }
  })

  // Validate Kochstück flour deduction doesn't exceed available flour
  if (kochstueck) {
    const blendEntry = input.flourBlend.find(e => e.grain === ksGrain && e.type === ksType)
    const levainDeductionFromSameFlour = (levainGrain !== null && ksGrain === levainGrain && ksType === levainType)
      ? levainResult.flourInLevain
      : 0
    const available = (blendEntry?.grams ?? 0) - levainDeductionFromSameFlour
    if (kochstueck.flourGrams > available) {
      errors.push(`Kochstück-Mehl (${kochstueck.flourGrams} g) überschreitet verfügbare Mehlmenge dieser Sorte (${available.toFixed(0)} g nach Levain-Abzug).`)
      return { ...empty, errors }
    }
  }

  // --- Autolyse / Bassinage ---
  const autolyse = input.autolyse.enabled ? calcAutolyse(mainWater, input.autolyse) : null

  // --- Enrichments ---
  const enrichments = calcEnrichments(input.enrichments, totalFlour, input.fermentation.enabled, warnings)

  // --- Inclusions ---
  const inclusions = calcInclusions(input.inclusions, totalFlour)
  const hydrationHintWithInclusions = weightedHydrationHint + inclusions.hydrationHintAdjustment

  const finalWeight = totalFlour + totalWater + totalSalt
    + enrichments.honeyGrams + enrichments.maltGrams
    + inclusions.totalGrams
    + levainResult.yeastGrams

  // --- Dough Split ---
  // Validate custom weight sum against final dough weight (done here after weight is known)
  if (input.doughSplit.enabled && input.doughSplit.mode === 'custom' && errors.length === 0) {
    const weightsSum = input.doughSplit.customWeights
      .slice(0, input.doughSplit.numPieces)
      .reduce((s, w) => s + w, 0)
    if (weightsSum > finalWeight) {
      errors.push(`Summe der Teigstück-Gewichte (${weightsSum.toFixed(0)} g) überschreitet Teiggewicht (${finalWeight.toFixed(0)} g).`)
    }
    if (errors.length > 0) return { ...empty, errors }
  }

  const doughSplit = input.doughSplit.enabled ? calcDoughSplit(input.doughSplit, finalWeight) : null
  const pieceWeightForProof = doughSplit?.pieceWeightForProof ?? null

  // Effective levain % for fermentation model: total levain mass as % of total flour
  const effectiveLevainPct = levainResult.levainTotal > 0
    ? (levainResult.levainTotal / totalFlour) * 100
    : 20  // fallback for yeast-only modes (model already warns these aren't calibrated)

  // Fermentation (Stockgare + optional Stückgare)
  const fermentation = input.fermentation.enabled
    ? calcFermentation(input.fermentation, effectiveLevainPct, pieceWeightForProof)
    : null

  // Warn if Stückgare piece weight scaling is requested but no dough split is configured
  if (input.fermentation.enabled && input.fermentation.stuckgare.enabled && !input.doughSplit.enabled) {
    warnings.push('Stückgare-Zeitschätzung ohne Teigaufteilung: Stückgewicht-Skalierung nicht möglich.')
  }

  // Warn when fermentation model is used with yeast modes
  if (input.fermentation.enabled) {
    const leavenMode = input.levain.mode
    if (leavenMode === 'fresh-yeast' || leavenMode === 'dry-yeast' || leavenMode === 'hybrid-yeast-primary') {
      warnings.push('Der Gärzeit-Rechner ist auf Sauerteig kalibriert — für Hefe-Teige sind die Schätzungen nicht geeignet.')
    } else if (leavenMode === 'hybrid-sourdough-primary') {
      warnings.push('Hybrid-Modus: Hefe-Beitrag ist nicht modelliert — tatsächliche Gärzeit ist kürzer als geschätzt.')
    }
  }

  return {
    targetWeight: finalWeight,
    totalFlour,
    totalWater,
    totalSalt,
    mainFlour,
    mainWater,
    weightedHydrationHint: hydrationHintWithInclusions,
    perFlour,
    levain: levainResult,
    autolyse,
    fermentation,
    enrichments,
    inclusions: inclusions.totalGrams > 0 || input.inclusions.enabled ? inclusions : null,
    doughSplit,
    kochstueck,
    quellstueck,
    valid: true,
    errors: [],
    warnings,
  }
}
