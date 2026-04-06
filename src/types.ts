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
// Leavening modes
// ---------------------------------------------------------------------------

// --- Sourdough modes (renamed from old Mode A / Mode B) ---
export interface SourdoughDirectConfig {
  mode: 'sourdough-direct'   // was Mode A
  starterHydration: number   // percent, e.g. 50
  levainPct: number          // levain as % of total flour
  flourGrain: FlourGrain
  flourType: FlourTypeName
}

export interface SourdoughBuildConfig {
  mode: 'sourdough-build'    // was Mode B
  starterHydration: number   // percent
  anstellgutGrams: number
  levainFlourGrams: number
  levainHydration: number    // percent
  flourGrain: FlourGrain
  flourType: FlourTypeName
}

// --- Commercial yeast modes ---
export interface FreshYeastConfig {
  mode: 'fresh-yeast'
  yeastGrams: number
}

export interface DryYeastConfig {
  mode: 'dry-yeast'
  yeastGrams: number
}

// --- Hybrid modes ---
export interface HybridYeastPrimaryConfig {
  mode: 'hybrid-yeast-primary'   // yeast drives timing; sourdough for flavour
  yeast: FreshYeastConfig | DryYeastConfig
  levain: SourdoughDirectConfig | SourdoughBuildConfig
}

export interface HybridSourdoughPrimaryConfig {
  mode: 'hybrid-sourdough-primary'  // sourdough drives timing; yeast for reliability
  levain: SourdoughDirectConfig | SourdoughBuildConfig
  yeast: FreshYeastConfig | DryYeastConfig
}

export type LeavenConfig =
  | SourdoughDirectConfig
  | SourdoughBuildConfig
  | FreshYeastConfig
  | DryYeastConfig
  | HybridYeastPrimaryConfig
  | HybridSourdoughPrimaryConfig


// ---------------------------------------------------------------------------
// Optional modules
// ---------------------------------------------------------------------------

export interface AutolyseConfig {
  enabled: boolean
  autolyseWaterPct: number   // percent of main dough water
  bassinageWaterPct: number  // percent of main dough water
}

export interface StuckgareConfig {
  enabled: boolean
  temperature: number
  referenceTemp: number
  referenceLevainPct: number
  referenceTimeHours: number   // default 1.5
  levainTarget: { enabled: boolean; targetHours: number }  // reverse: how much levain for X hours?
  usePieceWeight: boolean      // scale estimate by piece weight (requires dough split)
  referencePieceWeightG: number // reference piece weight for the model (default 800)
}

export interface FermentationConfig {
  enabled: boolean
  temperature: number        // °C
  // reference point
  referenceTemp: number      // °C, default 20
  referenceLevainPct: number // default 20
  referenceTimeHours: number // default 4
  levainTarget: { enabled: boolean; targetHours: number }  // reverse: how much levain for X hours?
  // Stückgare (final proof)
  stuckgare: StuckgareConfig
}

// ---------------------------------------------------------------------------
// Preparations (Kochstück & Quellstück)
// ---------------------------------------------------------------------------

export interface KochstueckConfig {
  enabled: boolean
  flourGrain: FlourGrain
  flourType: FlourTypeName
  flourGrams: number
  waterGrams: number
}

export interface QuellstueckEntry {
  name: string
  grams: number
  absorptionPct: number   // 0–100: how much of soaking water is absorbed into ingredients
}

export interface QuellstueckConfig {
  enabled: boolean
  entries: QuellstueckEntry[]
  soakingWaterGrams: number
}

export interface PreparationConfig {
  kochstueck: KochstueckConfig
  quellstueck: QuellstueckConfig
}

// ---------------------------------------------------------------------------
// Dough Split
// ---------------------------------------------------------------------------

export type SplitMode = 'equal' | 'custom'

export interface DoughSplitConfig {
  enabled: boolean
  numPieces: number
  mode: SplitMode
  customWeights: number[]   // length must match numPieces when mode === 'custom'
}

export interface DoughSplitResult {
  totalDoughWeight: number
  pieces: number[]
  trimLoss: number
  // Heaviest piece used as conservative input for Stückgare proof estimate.
  // If the heaviest piece is fully proofed, lighter pieces are done too.
  pieceWeightForProof: number
}

export interface InclusionEntry {
  name: string
  amountG: number
  absorptionCompensation: boolean
  absorptionPct: number   // percent of inclusion weight that draws water from main dough (default 30)
}

export interface InclusionsConfig {
  enabled: boolean
  entries: InclusionEntry[]
}

export interface EnrichmentsConfig {
  honey: {
    enabled: boolean
    amountG: number
  }
  malt: {
    enabled: boolean
    amountG: number
    maltType: 'aktiv' | 'inaktiv'
  }
}

// ---------------------------------------------------------------------------
// Full app input state
// ---------------------------------------------------------------------------

export interface RecipeInput {
  hydration: number          // percent
  saltPct: number            // percent of total flour, default 2
  flourBlend: FlourBlendEntry[]
  levain: LeavenConfig       // unified leavening config; all 6 modes
  autolyse: AutolyseConfig
  fermentation: FermentationConfig
  enrichments: EnrichmentsConfig
  inclusions: InclusionsConfig
  doughSplit: DoughSplitConfig
  preparations: PreparationConfig
}

// ---------------------------------------------------------------------------
// Calculation results
// ---------------------------------------------------------------------------

export interface LevainResult {
  levainTotal: number
  flourInLevain: number
  waterInLevain: number
  // sourdough-build only
  anstellgutGrams?: number
  levainFlourGrams?: number
  levainWaterGrams?: number
  // yeast and hybrid modes
  yeastGrams: number           // 0 for pure sourdough modes
  yeastType: 'fresh' | 'dry' | null
  hint: string | null          // advisory text for hybrid modes
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

export interface StuckgareResult {
  estimatedHours: number
  estimatedLevainPct: number | null  // set when levainTarget.enabled
  levainTargetHours: number | null   // the target hours used when estimatedLevainPct is set
  pieceWeightUsed: number | null
}

export interface FermentationResult {
  estimatedHours: number
  estimatedLevainPct: number | null  // set when levainTarget.enabled
  levainTargetHours: number | null   // the target hours used when estimatedLevainPct is set
  stuckgare: StuckgareResult | null
}

export interface KochstueckResult {
  flourGrams: number
  waterGrams: number
  flourGrain: FlourGrain
  flourType: FlourTypeName
}

export interface QuellstueckResult {
  entries: Array<{ name: string; grams: number }>
  soakingWaterGrams: number
  absorbedWaterGrams: number
}

export interface InclusionsResult {
  totalGrams: number
  hydrationHintAdjustment: number  // extra % to add to weightedHydrationHint
  entries: Array<{ name: string; amountG: number }>
}

export interface EnrichmentsResult {
  honeyGrams: number
  maltGrams: number
  activeMaltHint: boolean
}

export interface RecipeResult {
  targetWeight: number       // derived: totalFlour + totalWater + totalSalt + enrichments
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
  enrichments: EnrichmentsResult | null
  inclusions: InclusionsResult | null
  doughSplit: DoughSplitResult | null
  kochstueck: KochstueckResult | null
  quellstueck: QuellstueckResult | null
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ---------------------------------------------------------------------------
// Export / Import JSON schema
// ---------------------------------------------------------------------------

export interface RecipeExport {
  version: 7
  input: RecipeInput
}
