import { getState, setState } from '../state'
import type { KochstueckConfig, PreparationConfig, QuellstueckConfig, QuellstueckEntry } from '../types'
import { buildFlourSelects } from './util/flourSelect'
import type { FlourGrain, FlourTypeName } from '../types'

// ─── Quellstück dynamic list ─────────────────────────────────────────────────

function renderQuellstueckRow(entry: QuellstueckEntry, container: HTMLElement): HTMLElement {
  const row = document.createElement('div')
  row.className = 'qs-row'

  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.className = 'input-text qs-name'
  nameInput.placeholder = 'Zutat'
  nameInput.value = entry.name

  const amountInput = document.createElement('input')
  amountInput.type = 'number'
  amountInput.className = 'input-number qs-amount'
  amountInput.min = '1'
  amountInput.max = '9999'
  amountInput.placeholder = 'g'
  amountInput.value = String(entry.grams)

  const amtLabel = document.createElement('span')
  amtLabel.className = 'unit-label'
  amtLabel.textContent = 'g'

  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className = 'btn-icon remove-qs'
  removeBtn.textContent = '×'
  removeBtn.setAttribute('aria-label', 'Zutat entfernen')

  row.appendChild(nameInput)
  row.appendChild(amountInput)
  row.appendChild(amtLabel)
  row.appendChild(removeBtn)

  const update = () => updatePreparations(container)
  nameInput.addEventListener('input', update)
  amountInput.addEventListener('input', update)
  removeBtn.addEventListener('click', () => { row.remove(); updatePreparations(container) })

  return row
}

function readQuellstueckRows(container: HTMLElement): QuellstueckEntry[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.qs-row')).map(row => ({
    name: row.querySelector<HTMLInputElement>('.qs-name')!.value.trim(),
    grams: parseFloat(row.querySelector<HTMLInputElement>('.qs-amount')!.value) || 0,
  }))
}

// ─── Main update ─────────────────────────────────────────────────────────────

function updatePreparations(qsRowsContainer: HTMLElement): void {
  const state = getState()
  const ksToggle = document.getElementById('kochstueck-toggle') as HTMLInputElement
  const ksFlourGrain = (document.getElementById('kochstueck-flour-grain') as HTMLSelectElement).value as FlourGrain
  const ksFlourType  = (document.getElementById('kochstueck-flour-type') as HTMLSelectElement).value as FlourTypeName
  const ksFlourGrams = parseFloat((document.getElementById('kochstueck-flour-grams') as HTMLInputElement).value) || 0
  const ksWaterGrams = parseFloat((document.getElementById('kochstueck-water-grams') as HTMLInputElement).value) || 0

  const qsToggle = document.getElementById('quellstueck-toggle') as HTMLInputElement
  const qsWater  = parseFloat((document.getElementById('quellstueck-water') as HTMLInputElement).value) || 0

  const kochstueck: KochstueckConfig = {
    enabled: ksToggle?.checked ?? state.preparations.kochstueck.enabled,
    flourGrain: ksFlourGrain,
    flourType: ksFlourType,
    flourGrams: ksFlourGrams,
    waterGrams: ksWaterGrams,
  }

  const quellstueck: QuellstueckConfig = {
    enabled: qsToggle?.checked ?? state.preparations.quellstueck.enabled,
    entries: readQuellstueckRows(qsRowsContainer),
    soakingWaterGrams: qsWater,
  }

  const cfg: PreparationConfig = { kochstueck, quellstueck }
  setState({ preparations: cfg })
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initPreparations(section: HTMLElement): void {
  const state = getState()

  // --- Kochstück ---
  const ksToggle = section.querySelector<HTMLInputElement>('#kochstueck-toggle')!
  const ksPanel  = section.querySelector<HTMLElement>('#kochstueck-panel')!
  const ksFlourGramsInput = section.querySelector<HTMLInputElement>('#kochstueck-flour-grams')!
  const ksWaterGramsInput = section.querySelector<HTMLInputElement>('#kochstueck-water-grams')!

  const ks = state.preparations.kochstueck
  ksToggle.checked = ks.enabled
  ksPanel.style.display = ks.enabled ? 'block' : 'none'
  ksFlourGramsInput.value = String(ks.flourGrams)
  ksWaterGramsInput.value = String(ks.waterGrams)

  const { grainSel: ksGrainSel } = buildFlourSelects(
    'kochstueck-flour-grain', 'kochstueck-flour-type',
    ks.flourGrain, ks.flourType,
  )

  ksToggle.addEventListener('change', () => {
    ksPanel.style.display = ksToggle.checked ? 'block' : 'none'
    // Auto-fill water = 4× flour on first enable
    if (ksToggle.checked && parseFloat(ksWaterGramsInput.value) === 0) {
      ksWaterGramsInput.value = String((parseFloat(ksFlourGramsInput.value) || 50) * 4)
    }
    updatePreparations(qsRowsContainer)
  })

  const ksUpdate = () => updatePreparations(qsRowsContainer)
  ksFlourGramsInput.addEventListener('input', ksUpdate)
  ksWaterGramsInput.addEventListener('input', ksUpdate)
  ksGrainSel.addEventListener('change', ksUpdate)
  section.querySelector<HTMLSelectElement>('#kochstueck-flour-type')!.addEventListener('change', ksUpdate)

  // --- Quellstück ---
  const qsToggle = section.querySelector<HTMLInputElement>('#quellstueck-toggle')!
  const qsPanel  = section.querySelector<HTMLElement>('#quellstueck-panel')!
  const qsRowsContainer = section.querySelector<HTMLElement>('#quellstueck-rows')!
  const addQsBtn = section.querySelector<HTMLButtonElement>('#add-quellstueck-btn')!
  const qsWaterInput = section.querySelector<HTMLInputElement>('#quellstueck-water')!

  const qs = state.preparations.quellstueck
  qsToggle.checked = qs.enabled
  qsPanel.style.display = qs.enabled ? 'block' : 'none'
  qsWaterInput.value = String(qs.soakingWaterGrams)

  qs.entries.forEach(entry => qsRowsContainer.appendChild(renderQuellstueckRow(entry, qsRowsContainer)))

  qsToggle.addEventListener('change', () => {
    qsPanel.style.display = qsToggle.checked ? 'block' : 'none'
    updatePreparations(qsRowsContainer)
  })
  qsWaterInput.addEventListener('input', () => updatePreparations(qsRowsContainer))

  addQsBtn.addEventListener('click', () => {
    const newEntry: QuellstueckEntry = { name: '', grams: 0 }
    qsRowsContainer.appendChild(renderQuellstueckRow(newEntry, qsRowsContainer))
    updatePreparations(qsRowsContainer)
  })

}
