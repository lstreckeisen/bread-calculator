import { getState, setState, subscribe } from '../state'
import type { AutolyseConfig, EnrichmentsConfig, FermentationConfig, StuckgareConfig } from '../types'
// StuckgareConfig used in buildStuckgare return type

function initCollapsible(section: HTMLElement, toggleId: string, panelId: string): HTMLElement {
  const toggle = section.querySelector<HTMLInputElement>(`#${toggleId}`)!
  const panel = section.querySelector<HTMLElement>(`#${panelId}`)!

  function syncVisibility() {
    panel.style.display = toggle.checked ? 'grid' : 'none'
  }
  toggle.addEventListener('change', syncVisibility)
  syncVisibility()
  return panel
}

export function initOptionalModules(section: HTMLElement): void {
  const state = getState()

  // --- Autolyse / Bassinage ---
  const autolyseToggle = section.querySelector<HTMLInputElement>('#autolyse-toggle')!
  autolyseToggle.checked = state.autolyse.enabled
  const autolysePanel = initCollapsible(section, 'autolyse-toggle', 'autolyse-panel')

  const autolyseWaterInput = autolysePanel.querySelector<HTMLInputElement>('#autolyse-water-pct')!
  const bassinageWaterInput = autolysePanel.querySelector<HTMLInputElement>('#bassinage-water-pct')!
  autolyseWaterInput.value = String(state.autolyse.autolyseWaterPct)
  bassinageWaterInput.value = String(state.autolyse.bassinageWaterPct)

  function updateAutolyse() {
    const cfg: AutolyseConfig = {
      enabled: autolyseToggle.checked,
      autolyseWaterPct: parseFloat(autolyseWaterInput.value) || 0,
      bassinageWaterPct: parseFloat(bassinageWaterInput.value) || 0,
    }
    setState({ autolyse: cfg })
  }
  autolyseToggle.addEventListener('change', updateAutolyse)
  autolyseWaterInput.addEventListener('input', updateAutolyse)
  bassinageWaterInput.addEventListener('input', updateAutolyse)

  // --- Fermentation ---
  const fermentToggle = section.querySelector<HTMLInputElement>('#ferment-toggle')!
  fermentToggle.checked = state.fermentation.enabled
  const fermentPanel = initCollapsible(section, 'ferment-toggle', 'ferment-panel')

  const temperatureInput    = fermentPanel.querySelector<HTMLInputElement>('#ferm-temperature')!
  const levainTargetToggle  = fermentPanel.querySelector<HTMLInputElement>('#ferm-levain-target-toggle')!
  const levainTargetPanel   = fermentPanel.querySelector<HTMLElement>('#ferm-levain-target-panel')!
  const targetHoursInput    = fermentPanel.querySelector<HTMLInputElement>('#ferm-target-hours')!

  const f = state.fermentation
  temperatureInput.value  = String(f.temperature)
  levainTargetToggle.checked = f.levainTarget.enabled
  levainTargetPanel.style.display = f.levainTarget.enabled ? 'contents' : 'none'
  targetHoursInput.value  = String(f.levainTarget.targetHours)

  levainTargetToggle.addEventListener('change', () => {
    levainTargetPanel.style.display = levainTargetToggle.checked ? 'contents' : 'none'
    updateFermentation()
  })

  function updateFermentation() {
    const cfg: FermentationConfig = {
      enabled: fermentToggle.checked,
      temperature: parseFloat(temperatureInput.value) || 20,
      levainTarget: {
        enabled: levainTargetToggle.checked,
        targetHours: parseFloat(targetHoursInput.value) || 4,
      },
      stuckgare: getState().fermentation.stuckgare,
    }
    setState({ fermentation: cfg })
  }

  fermentToggle.addEventListener('change', () => {
    updateFermentation()
    stuckgareSubmoduleEl.style.display = fermentToggle.checked ? 'block' : 'none'
  })
  temperatureInput.addEventListener('input', updateFermentation)
  targetHoursInput.addEventListener('input', updateFermentation)

  // --- Stückgare ---
  const stuckgareSubmoduleEl = section.querySelector<HTMLElement>('#stuckgare-submodule')!
  stuckgareSubmoduleEl.style.display = f.enabled ? 'block' : 'none'

  const stuckgareToggle         = section.querySelector<HTMLInputElement>('#stuckgare-toggle')!
  const stuckgarePanel          = section.querySelector<HTMLElement>('#stuckgare-panel')!
  const stuckTemperature        = section.querySelector<HTMLInputElement>('#stuck-temperature')!
  const stuckLevainTargetToggle = section.querySelector<HTMLInputElement>('#stuck-levain-target-toggle')!
  const stuckLevainTargetPanel  = section.querySelector<HTMLElement>('#stuck-levain-target-panel')!
  const stuckTargetHours        = section.querySelector<HTMLInputElement>('#stuck-target-hours')!
  const stuckPieceWeightHint    = section.querySelector<HTMLElement>('#stuck-piece-weight-hint')!

  const sg = f.stuckgare
  stuckgareToggle.checked = sg.enabled
  stuckgarePanel.style.display = sg.enabled ? 'grid' : 'none'
  stuckTemperature.value = String(sg.temperature)
  stuckLevainTargetToggle.checked = sg.levainTarget.enabled
  stuckLevainTargetPanel.style.display = sg.levainTarget.enabled ? 'contents' : 'none'
  stuckTargetHours.value = String(sg.levainTarget.targetHours)

  stuckLevainTargetToggle.addEventListener('change', () => {
    stuckLevainTargetPanel.style.display = stuckLevainTargetToggle.checked ? 'contents' : 'none'
    updateStuckgare()
  })

  function buildStuckgare(): StuckgareConfig {
    return {
      enabled: stuckgareToggle.checked,
      temperature: parseFloat(stuckTemperature.value) || 20,
      levainTarget: {
        enabled: stuckLevainTargetToggle.checked,
        targetHours: parseFloat(stuckTargetHours.value) || 2,
      },
    }
  }

  function updateStuckgare() {
    const currentFerm = getState().fermentation
    setState({ fermentation: { ...currentFerm, stuckgare: buildStuckgare() } })
  }

  stuckgareToggle.addEventListener('change', () => {
    stuckgarePanel.style.display = stuckgareToggle.checked ? 'grid' : 'none'
    updateStuckgare()
  })
  stuckTemperature.addEventListener('input', updateStuckgare)
  stuckTargetHours.addEventListener('input', updateStuckgare)

  // Show hint when dough split provides piece weight
  subscribe((result) => {
    const hasPieceWeight = result.doughSplit !== null
    stuckPieceWeightHint.style.display = hasPieceWeight && stuckgareToggle.checked ? 'block' : 'none'
  })

  // --- Honig ---
  const honeyToggle = section.querySelector<HTMLInputElement>('#honey-toggle')!
  honeyToggle.checked = state.enrichments.honey.enabled
  const honeyPanel = initCollapsible(section, 'honey-toggle', 'honey-panel')

  const honeyAmountInput = honeyPanel.querySelector<HTMLInputElement>('#honey-amount')!
  const honeyUnitToggle = honeyPanel.querySelector<HTMLButtonElement>('#honey-unit-toggle')!
  let honeyUnitIsPct = false

  honeyAmountInput.value = String(state.enrichments.honey.amountG)

  function getHoneyGrams(): number {
    const val = parseFloat(honeyAmountInput.value) || 0
    if (honeyUnitIsPct) {
      const totalFlour = section.closest('.app')
        ? document.querySelectorAll<HTMLInputElement>('[id^="flour-grams-"]')
        : null
      // Use the result's totalFlour via a subscribe approach — read from state proxy
      // For unit conversion we use a data attribute set by the results subscriber
      const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0
      return totalFlourG > 0 ? (val / 100) * totalFlourG : 0
    }
    return val
  }

  honeyUnitToggle.addEventListener('click', () => {
    const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0
    const currentGrams = getHoneyGrams()
    honeyUnitIsPct = !honeyUnitIsPct
    honeyUnitToggle.textContent = honeyUnitIsPct ? '% Mehl' : 'g'
    if (totalFlourG > 0) {
      honeyAmountInput.value = honeyUnitIsPct
        ? String(Math.round(currentGrams / totalFlourG * 1000) / 10)
        : String(Math.round(currentGrams))
    }
  })

  function updateHoney() {
    const cfg: EnrichmentsConfig = {
      ...getState().enrichments,
      honey: { enabled: honeyToggle.checked, amountG: getHoneyGrams() },
    }
    setState({ enrichments: cfg })
  }
  honeyToggle.addEventListener('change', updateHoney)
  honeyAmountInput.addEventListener('input', updateHoney)

  // --- Backmalz ---
  const maltToggle = section.querySelector<HTMLInputElement>('#malt-toggle')!
  maltToggle.checked = state.enrichments.malt.enabled
  const maltPanel = initCollapsible(section, 'malt-toggle', 'malt-panel')

  const maltAmountInput = maltPanel.querySelector<HTMLInputElement>('#malt-amount')!
  const maltUnitToggle = maltPanel.querySelector<HTMLButtonElement>('#malt-unit-toggle')!
  const maltTypeInaktiv = maltPanel.querySelector<HTMLInputElement>('#malt-type-inaktiv')!
  const maltTypeAktiv   = maltPanel.querySelector<HTMLInputElement>('#malt-type-aktiv')!
  const maltHintEl      = maltPanel.querySelector<HTMLElement>('#malt-hint')!
  let maltUnitIsPct = false

  maltAmountInput.value = String(state.enrichments.malt.amountG)
  if (state.enrichments.malt.maltType === 'aktiv') {
    maltTypeAktiv.checked = true
  } else {
    maltTypeInaktiv.checked = true
  }

  function getMaltGrams(): number {
    const val = parseFloat(maltAmountInput.value) || 0
    if (maltUnitIsPct) {
      const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0
      return totalFlourG > 0 ? (val / 100) * totalFlourG : 0
    }
    return val
  }

  maltUnitToggle.addEventListener('click', () => {
    const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0
    const currentGrams = getMaltGrams()
    maltUnitIsPct = !maltUnitIsPct
    maltUnitToggle.textContent = maltUnitIsPct ? '% Mehl' : 'g'
    if (totalFlourG > 0) {
      maltAmountInput.value = maltUnitIsPct
        ? String(Math.round(currentGrams / totalFlourG * 1000) / 10)
        : String(Math.round(currentGrams))
    }
  })

  function updateMalt() {
    const maltType = maltTypeAktiv.checked ? 'aktiv' as const : 'inaktiv' as const
    const cfg: EnrichmentsConfig = {
      ...getState().enrichments,
      malt: { enabled: maltToggle.checked, amountG: getMaltGrams(), maltType },
    }
    setState({ enrichments: cfg })
  }
  maltToggle.addEventListener('change', updateMalt)
  maltAmountInput.addEventListener('input', updateMalt)
  maltTypeInaktiv.addEventListener('change', updateMalt)
  maltTypeAktiv.addEventListener('change', updateMalt)

  // Show/hide the active malt hint based on result
  subscribe((result) => {
    const show = result.enrichments?.activeMaltHint ?? false
    maltHintEl.style.display = show ? 'block' : 'none'
  })

  // Expose totalFlour on body for unit toggle conversions
  subscribe((result) => {
    document.body.dataset['totalFlour'] = String(result.totalFlour)
  })
}
