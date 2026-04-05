import { FLOUR_GRAINS, TYPES_BY_GRAIN } from '../data/flours'
import { getState, setState } from '../state'
import type { FlourBlendEntry, FlourGrain, FlourTypeName } from '../types'

function renderRow(entry: FlourBlendEntry, container: HTMLElement): HTMLElement {
  const row = document.createElement('div')
  row.className = 'flour-row'

  // Grain select
  const grainSel = document.createElement('select')
  grainSel.className = 'input-select grain-select'
  grainSel.setAttribute('aria-label', 'Getreideart')
  FLOUR_GRAINS.forEach(g => {
    const opt = document.createElement('option')
    opt.value = g
    opt.textContent = g
    if (g === entry.grain) opt.selected = true
    grainSel.appendChild(opt)
  })

  // Type select
  const typeSel = document.createElement('select')
  typeSel.className = 'input-select type-select'
  typeSel.setAttribute('aria-label', 'Mehltyp')

  function populateTypes(grain: FlourGrain, selectedType?: FlourTypeName) {
    typeSel.innerHTML = ''
    TYPES_BY_GRAIN[grain].forEach(t => {
      const opt = document.createElement('option')
      opt.value = t
      opt.textContent = t
      if (t === selectedType) opt.selected = true
      typeSel.appendChild(opt)
    })
  }
  populateTypes(entry.grain, entry.type)

  // Gram input — absolute flour amount
  const gramsInput = document.createElement('input')
  gramsInput.type = 'number'
  gramsInput.className = 'input-number grams-input'
  gramsInput.min = '1'
  gramsInput.max = '99999'
  gramsInput.placeholder = 'g'
  gramsInput.value = String(entry.grams)
  gramsInput.setAttribute('aria-label', 'Mehlmenge in Gramm')

  const gramsLabel = document.createElement('span')
  gramsLabel.className = 'unit-label'
  gramsLabel.textContent = 'g'

  // Derived % badge (read-only, shows proportion within blend)
  const pctBadge = document.createElement('span')
  pctBadge.className = 'pct-badge'
  pctBadge.textContent = ''

  // Remove button
  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className = 'btn-icon remove-flour'
  removeBtn.setAttribute('aria-label', 'Mehlsorte entfernen')
  removeBtn.textContent = '×'

  row.appendChild(grainSel)
  row.appendChild(typeSel)
  row.appendChild(gramsInput)
  row.appendChild(gramsLabel)
  row.appendChild(pctBadge)
  row.appendChild(removeBtn)

  grainSel.addEventListener('change', () => {
    const newGrain = grainSel.value as FlourGrain
    populateTypes(newGrain, TYPES_BY_GRAIN[newGrain][0])
    updateBlend(container)
  })
  typeSel.addEventListener('change', () => updateBlend(container))
  gramsInput.addEventListener('input', () => updateBlend(container))
  removeBtn.addEventListener('click', () => {
    row.remove()
    updateBlend(container)
  })

  return row
}

/** Read absolute gram values from DOM rows. */
function readBlend(container: HTMLElement): FlourBlendEntry[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.flour-row')).map(row => ({
    grain: row.querySelector<HTMLSelectElement>('.grain-select')!.value as FlourGrain,
    type: row.querySelector<HTMLSelectElement>('.type-select')!.value as FlourTypeName,
    grams: parseFloat(row.querySelector<HTMLInputElement>('.grams-input')!.value) || 0,
  }))
}

/** Update % badges to reflect each flour's share of the total blend. */
function updateBadges(container: HTMLElement) {
  const rows = Array.from(container.querySelectorAll<HTMLElement>('.flour-row'))
  const total = rows.reduce((sum, row) => {
    return sum + (parseFloat(row.querySelector<HTMLInputElement>('.grams-input')!.value) || 0)
  }, 0)
  rows.forEach(row => {
    const badge = row.querySelector<HTMLElement>('.pct-badge')
    const grams = parseFloat(row.querySelector<HTMLInputElement>('.grams-input')!.value) || 0
    if (badge) badge.textContent = total > 0 ? `${(grams / total * 100).toFixed(1)}%` : ''
  })
}

function updateBlend(container: HTMLElement) {
  updateBadges(container)
  setState({ flourBlend: readBlend(container) })
}

export function initFlourBlend(section: HTMLElement): void {
  const container = section.querySelector<HTMLElement>('#flour-rows')!
  const addBtn = section.querySelector<HTMLButtonElement>('#add-flour-btn')!

  getState().flourBlend.forEach(entry => container.appendChild(renderRow(entry, container)))
  updateBadges(container)

  addBtn.addEventListener('click', () => {
    const newEntry: FlourBlendEntry = { grain: 'Weizen', type: 'Weissmehl', grams: 0 }
    container.appendChild(renderRow(newEntry, container))
    updateBlend(container)
  })
}
