import type { FlourDefinition, FlourGrain, FlourTypeName } from '../types'

// Midpoints derived from typical Teigausbeute (TA) ranges per Marcel Paa course materials:
//   Weizen Weissmehl:     TA 165–175  → 65–75%  hydration  (midpoint 70)
//   Weizen Halbweissmehl: TA 168–178  → 68–78%  hydration  (midpoint 73)
//   Weizen Ruchmehl:      TA 173–183  → 73–83%  hydration  (midpoint 78)
//   Weizen Vollkornmehl:  TA 175–185  → 75–85%  hydration  (midpoint 80)
//   Ur-Dinkel Weissmehl:  TA ~170     → ~70%    hydration  (midpoint 70)
//   Ur-Dinkel Ruchmehl:   TA ~172–178 → ~72–78% hydration  (midpoint 75)
//   Ur-Dinkel Vollkornmehl: TA ~178   → ~78%    hydration  (midpoint 80)
//   Roggen Hell:   higher absorption due to pentosans (midpoint 75)
//   Roggen Dunkel: higher absorption (midpoint 85)
//   Roggen Vollkorn: very high absorption, traditional Roggenvollkornbrot uses TA ~190-200 (midpoint 95)
export const FLOUR_DEFINITIONS: FlourDefinition[] = [
  { grain: 'Weizen',      type: 'Weissmehl',     absorptionMidpoint: 70 },
  { grain: 'Weizen',      type: 'Halbweissmehl', absorptionMidpoint: 73 },
  { grain: 'Weizen',      type: 'Ruchmehl',      absorptionMidpoint: 78 },
  { grain: 'Weizen',      type: 'Vollkornmehl',  absorptionMidpoint: 80 },
  { grain: '(Ur-)Dinkel', type: 'Weissmehl',     absorptionMidpoint: 70 },
  { grain: '(Ur-)Dinkel', type: 'Ruchmehl',      absorptionMidpoint: 75 },
  { grain: '(Ur-)Dinkel', type: 'Vollkornmehl',  absorptionMidpoint: 80 },
  { grain: 'Roggen',      type: 'Hell',          absorptionMidpoint: 75 },
  { grain: 'Roggen',      type: 'Dunkel',        absorptionMidpoint: 85 },
  { grain: 'Roggen',      type: 'Vollkornmehl',  absorptionMidpoint: 95 },
]

export const FLOUR_GRAINS: FlourGrain[] = ['Weizen', '(Ur-)Dinkel', 'Roggen']

export const TYPES_BY_GRAIN: Record<FlourGrain, FlourTypeName[]> = {
  'Weizen':      ['Weissmehl', 'Halbweissmehl', 'Ruchmehl', 'Vollkornmehl'],
  '(Ur-)Dinkel': ['Weissmehl', 'Ruchmehl', 'Vollkornmehl'],
  'Roggen':      ['Hell', 'Dunkel', 'Vollkornmehl'],
}

export function getAbsorptionMidpoint(grain: FlourGrain, type: FlourTypeName): number {
  const def = FLOUR_DEFINITIONS.find(f => f.grain === grain && f.type === type)
  return def?.absorptionMidpoint ?? 65
}
