import { getState, getResult, setState } from '../state'
import { FLOUR_GRAINS, TYPES_BY_GRAIN } from '../data/flours'
import type { FlourGrain, FlourTypeName, LevainConfigA, LevainConfigB } from '../types'

function buildFlourSelects(
  grainId: string,
  typeId: string,
  defaultGrain: FlourGrain,
  defaultType: FlourTypeName,
): { grainSel: HTMLSelectElement; typeSel: HTMLSelectElement } {
  const grainSel = document.getElementById(grainId) as HTMLSelectElement
  const typeSel  = document.getElementById(typeId)  as HTMLSelectElement

  // Populate grain options
  grainSel.innerHTML = ''
  FLOUR_GRAINS.forEach(g => {
    const opt = document.createElement('option')
    opt.value = g
    opt.textContent = g
    if (g === defaultGrain) opt.selected = true
    grainSel.appendChild(opt)
  })

  // Populate type options for a given grain
  function populateTypes(grain: FlourGrain, selected?: FlourTypeName) {
    typeSel.innerHTML = ''
    TYPES_BY_GRAIN[grain].forEach(t => {
      const opt = document.createElement('option')
      opt.value = t
      opt.textContent = t
      if (t === selected) opt.selected = true
      typeSel.appendChild(opt)
    })
  }
  populateTypes(defaultGrain, defaultType)

  grainSel.addEventListener('change', () => {
    populateTypes(grainSel.value as FlourGrain)
  })

  return { grainSel, typeSel }
}

export function initLevain(section: HTMLElement): void {
  const modeATrigger = section.querySelector<HTMLButtonElement>('#levain-mode-a')!
  const modeBTrigger = section.querySelector<HTMLButtonElement>('#levain-mode-b')!
  const panelA = section.querySelector<HTMLElement>('#levain-panel-a')!
  const panelB = section.querySelector<HTMLElement>('#levain-panel-b')!

  // Mode A inputs
  const starterHydA = section.querySelector<HTMLInputElement>('#starter-hydration-a')!
  const levainPctA  = section.querySelector<HTMLInputElement>('#levain-pct-a')!

  // Mode B inputs
  const starterHydB     = section.querySelector<HTMLInputElement>('#starter-hydration-b')!
  const anstellgut      = section.querySelector<HTMLInputElement>('#anstellgut-grams')!
  const levainFlour     = section.querySelector<HTMLInputElement>('#levain-flour-grams')!
  const levainHydration = section.querySelector<HTMLInputElement>('#levain-hydration')!
  const hydQuick50      = section.querySelector<HTMLButtonElement>('#hyd-quick-50')!
  const hydQuick100     = section.querySelector<HTMLButtonElement>('#hyd-quick-100')!

  // Flour type selectors (shared concept, one per mode)
  const state = getState()
  const initGrain = state.levain.flourGrain
  const initType  = state.levain.flourType

  const { grainSel: grainSelA, typeSel: typeSelA } =
    buildFlourSelects('levain-flour-grain-a', 'levain-flour-type-a', initGrain, initType)
  const { grainSel: grainSelB, typeSel: typeSelB } =
    buildFlourSelects('levain-flour-grain-b', 'levain-flour-type-b', initGrain, initType)

  function setMode(mode: 'A' | 'B') {
    panelA.style.display = mode === 'A' ? 'grid' : 'none'
    panelB.style.display = mode === 'B' ? 'grid' : 'none'
    modeATrigger.classList.toggle('active', mode === 'A')
    modeBTrigger.classList.toggle('active', mode === 'B')
  }

  // Populate numeric inputs from state
  if (state.levain.mode === 'A') {
    starterHydA.value = String(state.levain.starterHydration)
    levainPctA.value  = String(state.levain.levainPct)
    setMode('A')
  } else {
    starterHydB.value     = String(state.levain.starterHydration)
    anstellgut.value      = String(state.levain.anstellgutGrams)
    levainFlour.value     = String(state.levain.levainFlourGrams)
    levainHydration.value = String(state.levain.levainHydration)
    setMode('B')
  }

  // ── Mode toggle ───────────────────────────────────────────────────────────

  modeATrigger.addEventListener('click', () => {
    // Reverse-derive levainPct from current Mode B levain flour
    const result = getResult()
    const currentLevainFlour = parseFloat(levainFlour.value) || 0
    const derivedLevainPct = result.totalFlour > 0
      ? Math.round((currentLevainFlour / result.totalFlour) * 100 * 10) / 10
      : parseFloat(levainPctA.value) || 20

    levainPctA.value  = String(derivedLevainPct)
    starterHydA.value = starterHydB.value
    // Carry flour type from B → A
    grainSelA.value = grainSelB.value
    grainSelA.dispatchEvent(new Event('change'))
    setTimeout(() => { typeSelA.value = typeSelB.value }, 0)

    setState({ levain: buildCfgA() })
    setMode('A')
  })

  modeBTrigger.addEventListener('click', () => {
    const result      = getResult()
    const currentState = getState()
    const starterHyd  = currentState.levain.mode === 'A' ? currentState.levain.starterHydration : 50
    const levainPct   = currentState.levain.mode === 'A' ? currentState.levain.levainPct : 20
    const totalFlour  = result.totalFlour > 0 ? result.totalFlour : 500

    const levainFlourDefault   = Math.round(totalFlour * levainPct / 100)
    const anstellgutDefault    = Math.max(5, Math.round(levainFlourDefault / 10))

    starterHydB.value     = String(starterHyd)
    anstellgut.value      = String(anstellgutDefault)
    levainFlour.value     = String(levainFlourDefault)
    levainHydration.value = '100'
    // Carry flour type from A → B
    grainSelB.value = grainSelA.value
    grainSelB.dispatchEvent(new Event('change'))
    setTimeout(() => { typeSelB.value = typeSelA.value }, 0)

    setState({ levain: buildCfgB() })
    setMode('B')
  })

  // ── Live updates ──────────────────────────────────────────────────────────

  function buildCfgA(): LevainConfigA {
    return {
      mode: 'A',
      starterHydration: parseFloat(starterHydA.value) || 50,
      levainPct: parseFloat(levainPctA.value) || 20,
      flourGrain: grainSelA.value as FlourGrain,
      flourType:  typeSelA.value  as FlourTypeName,
    }
  }

  function buildCfgB(): LevainConfigB {
    return {
      mode: 'B',
      starterHydration: parseFloat(starterHydB.value) || 50,
      anstellgutGrams: parseFloat(anstellgut.value) || 20,
      levainFlourGrams: parseFloat(levainFlour.value) || 100,
      levainHydration: parseFloat(levainHydration.value) || 100,
      flourGrain: grainSelB.value as FlourGrain,
      flourType:  typeSelB.value  as FlourTypeName,
    }
  }

  const updateA = () => setState({ levain: buildCfgA() })
  starterHydA.addEventListener('input', updateA)
  levainPctA.addEventListener('input', updateA)
  grainSelA.addEventListener('change', updateA)
  typeSelA.addEventListener('change', updateA)

  const updateB = () => setState({ levain: buildCfgB() })
  starterHydB.addEventListener('input', updateB)
  anstellgut.addEventListener('input', updateB)
  levainFlour.addEventListener('input', updateB)
  levainHydration.addEventListener('input', updateB)
  grainSelB.addEventListener('change', updateB)
  typeSelB.addEventListener('change', updateB)

  hydQuick50.addEventListener('click',  () => { levainHydration.value = '50';  updateB() })
  hydQuick100.addEventListener('click', () => { levainHydration.value = '100'; updateB() })
}
