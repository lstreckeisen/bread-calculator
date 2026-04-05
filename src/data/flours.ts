import type { FlourDefinition, FlourGrain, FlourTypeName } from '../types'

export const FLOUR_DEFINITIONS: FlourDefinition[] = [
  { grain: 'Weizen',      type: 'Weissmehl',     absorptionMidpoint: 60 },
  { grain: 'Weizen',      type: 'Halbweissmehl', absorptionMidpoint: 63.5 },
  { grain: 'Weizen',      type: 'Ruchmehl',      absorptionMidpoint: 67.5 },
  { grain: 'Weizen',      type: 'Vollkornmehl',  absorptionMidpoint: 75.5 },
  { grain: '(Ur-)Dinkel', type: 'Weissmehl',     absorptionMidpoint: 66.5 },
  { grain: '(Ur-)Dinkel', type: 'Ruchmehl',      absorptionMidpoint: 70 },
  { grain: '(Ur-)Dinkel', type: 'Vollkornmehl',  absorptionMidpoint: 75.5 },
  { grain: 'Roggen',      type: 'Hell',          absorptionMidpoint: 78.5 },
  { grain: 'Roggen',      type: 'Dunkel',        absorptionMidpoint: 88.5 },
  { grain: 'Roggen',      type: 'Vollkornmehl',  absorptionMidpoint: 97.5 },
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
