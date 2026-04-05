// ---------------------------------------------------------------------------
// Flour
// ---------------------------------------------------------------------------

export type FlourGrain = 'Weizen' | '(Ur-)Dinkel' | 'Roggen'

export type FlourTypeName =
  | 'Weissmehl'
  | 'Halbweissmehl'
  | 'Ruchmehl'
  | 'Vollkornmehl'
  | 'Hell'
  | 'Dunkel'

export interface FlourDefinition {
  grain: FlourGrain
  type: FlourTypeName
  absorptionMidpoint: number // percent, e.g. 67 means 67%
}

export interface FlourBlendEntry {
  grain: FlourGrain
  type: FlourTypeName
  grams: number // absolute flour amount in grams
}

// ---------------------------------------------------------------------------
// Levain
// ---------------------------------------------------------------------------

export type LevainMode = 'A' | 'B'

export interface LevainConfigA {
  mode: 'A'
  starterHydration: number // percent, e.g. 50
  levainPct: number        // levain as % of total flour
  flourGrain: FlourGrain
  flourType: FlourTypeName
}

export interface LevainConfigB {
  mode: 'B'
  starterHydration: number // percent
  anstellgutGrams: number
  levainFlourGrams: number
  levainHydration: number  // percent
  flourGrain: FlourGrain
  flourType: FlourTypeName
}

export type LevainConfig = LevainConfigA | LevainConfigB

// ---------------------------------------------------------------------------
// Optional modules
// ---------------------------------------------------------------------------

export interface AutolyseConfig {
  enabled: boolean
  autolyseWaterPct: number   // percent of main dough water
  bassinageWaterPct: number  // percent of main dough water
}

export interface FermentationConfig {
  enabled: boolean
  direction: 'timeFromLevain' | 'levainFromTime'
  // inputs
  levainPct: number          // used when direction = timeFromLevain
  targetHours: number        // used when direction = levainFromTime
  temperature: number        // °C
  // reference point
  referenceTemp: number      // °C, default 20
  referenceLevainPct: number // default 20
  referenceTimeHours: number // default 4
}

// ---------------------------------------------------------------------------
// Full app input state
// ---------------------------------------------------------------------------

export interface RecipeInput {
  hydration: number          // percent
  saltPct: number            // percent of total flour, default 2
  flourBlend: FlourBlendEntry[]
  levain: LevainConfig
  autolyse: AutolyseConfig
  fermentation: FermentationConfig
}

// ---------------------------------------------------------------------------
// Calculation results
// ---------------------------------------------------------------------------

export interface LevainResult {
  levainTotal: number
  flourInLevain: number
  waterInLevain: number
  // Mode B only
  anstellgutGrams?: number
  levainFlourGrams?: number
  levainWaterGrams?: number
}

export interface PerFlourEntry {
  grain: FlourGrain
  type: FlourTypeName
  flourGrams: number     // total grams from blend input
  mainFlourGrams: number // grams going into main dough (levain flour subtracted from its type)
}

export interface AutolyseResult {
  autolysisWater: number
  bassinageWater: number
  initialWater: number
}

export interface FermentationResult {
  estimatedHours: number | null
  estimatedLevainPct: number | null
}

export interface RecipeResult {
  targetWeight: number       // derived: totalFlour + totalWater + totalSalt
  totalFlour: number
  totalWater: number
  totalSalt: number
  mainFlour: number
  mainWater: number
  weightedHydrationHint: number
  perFlour: PerFlourEntry[]
  levain: LevainResult
  autolyse: AutolyseResult | null
  fermentation: FermentationResult | null
  valid: boolean
  errors: string[]
}

// ---------------------------------------------------------------------------
// Export / Import JSON schema
// ---------------------------------------------------------------------------

export interface RecipeExport {
  version: 1
  input: RecipeInput
}
