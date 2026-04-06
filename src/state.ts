import type { RecipeInput, RecipeResult } from './types'
import { calculate } from './calc/recipe'

const DEFAULT_STATE: RecipeInput = {
  hydration: 72,
  saltPct: 2,
  flourBlend: [
    { grain: 'Weizen', type: 'Ruchmehl', grams: 500 },
  ],
  levain: {
    mode: 'sourdough-direct',
    starterHydration: 50,
    levainPct: 20,
    flourGrain: 'Weizen',
    flourType: 'Weissmehl',
  },
  autolyse: {
    enabled: false,
    autolyseWaterPct: 80,
    bassinageWaterPct: 10,
  },
  fermentation: {
    enabled: false,
    temperature: 22,
    referenceTemp: 20,
    referenceLevainPct: 20,
    referenceTimeHours: 4,
    levainTarget: { enabled: false, targetHours: 4 },
    stuckgare: {
      enabled: false,
      temperature: 22,
      referenceTemp: 20,
      referenceLevainPct: 20,
      referenceTimeHours: 1.5,
      levainTarget: { enabled: false, targetHours: 2 },
      usePieceWeight: false,
      referencePieceWeightG: 800,
    },
  },
  enrichments: {
    honey: { enabled: false, amountG: 0 },
    malt:  { enabled: false, amountG: 0, maltType: 'inaktiv' },
  },
  inclusions: {
    enabled: false,
    entries: [],
  },
  doughSplit: {
    enabled: false,
    numPieces: 2,
    mode: 'equal',
    customWeights: [],
  },
  preparations: {
    kochstueck: {
      enabled: false,
      flourGrain: 'Weizen',
      flourType: 'Weissmehl',
      flourGrams: 50,
      waterGrams: 200,
    },
    quellstueck: {
      enabled: false,
      entries: [],
      soakingWaterGrams: 0,
    },
  },
}

function loadInitialState(): RecipeInput {
  const imported = sessionStorage.getItem('bread-import')
  if (imported) {
    sessionStorage.removeItem('bread-import')
    try {
      return JSON.parse(imported) as RecipeInput
    } catch {
      // fall through to default
    }
  }
  return structuredClone(DEFAULT_STATE)
}

let state: RecipeInput = loadInitialState()
let result: RecipeResult = calculate(state)

type Subscriber = (result: RecipeResult, input: RecipeInput) => void
const subscribers: Subscriber[] = []

export function getState(): RecipeInput {
  return state
}

export function getResult(): RecipeResult {
  return result
}

export function setState(patch: Partial<RecipeInput>): void {
  state = { ...state, ...patch }
  result = calculate(state)
  subscribers.forEach(fn => fn(result, state))
}

export function subscribe(fn: Subscriber): void {
  subscribers.push(fn)
}

/** Trigger all subscribers with current state (used on initial render). */
export function notify(): void {
  subscribers.forEach(fn => fn(result, state))
}
