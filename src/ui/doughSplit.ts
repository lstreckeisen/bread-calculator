import { getState, setState, subscribe } from '../state'
import type { DoughSplitConfig } from '../types'

function reconcileWeightRows(container: HTMLElement, numPieces: number): void {
  const existing = Array.from(container.querySelectorAll<HTMLElement>('.split-weight-row'))

  // Add rows if needed
  while (existing.length < numPieces) {
    const idx = existing.length
    const row = document.createElement('div')
    row.className = 'split-weight-row'

    const label = document.createElement('label')
    label.textContent = `Stück ${idx + 1}`

    const input = document.createElement('input')
    input.type = 'number'
    input.className = 'input-number split-weight-input'
    input.min = '1'
    input.max = '99999'
    input.placeholder = 'g'
    input.value = '0'
    input.setAttribute('aria-label', `Gewicht Stück ${idx + 1}`)
    input.addEventListener('input', () => {
      const toggle = document.getElementById('split-toggle') as HTMLInputElement
      updateSplit(toggle, container.closest('#split-panel')!)
    })

    const unitLabel = document.createElement('span')
    unitLabel.className = 'unit-label'
    unitLabel.textContent = 'g'

    row.appendChild(label)
    row.appendChild(input)
    row.appendChild(unitLabel)
    container.appendChild(row)
    existing.push(row)
  }

  // Remove excess rows
  while (existing.length > numPieces) {
    existing.pop()!.remove()
  }
}

function readCustomWeights(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>('.split-weight-input'))
    .map(inp => parseFloat(inp.value) || 0)
}

function updateSplit(toggle: HTMLInputElement, panel: Element): void {
  const numPiecesInput = panel.querySelector<HTMLInputElement>('#split-num-pieces')!
  const modeEqual = panel.querySelector<HTMLInputElement>('#split-mode-equal')!
  const weightsContainer = panel.querySelector<HTMLElement>('#split-weight-rows')!

  const numPieces = Math.max(1, parseInt(numPiecesInput.value) || 1)
  const mode = modeEqual.checked ? 'equal' as const : 'custom' as const

  const cfg: DoughSplitConfig = {
    enabled: toggle.checked,
    numPieces,
    mode,
    customWeights: mode === 'custom' ? readCustomWeights(weightsContainer) : [],
  }
  setState({ doughSplit: cfg })
}

export function initDoughSplit(section: HTMLElement): void {
  const toggle = section.querySelector<HTMLInputElement>('#split-toggle')!
  const panel = section.querySelector<HTMLElement>('#split-panel')!
  const numPiecesInput = section.querySelector<HTMLInputElement>('#split-num-pieces')!
  const modeEqual = section.querySelector<HTMLInputElement>('#split-mode-equal')!
  const modeCustom = section.querySelector<HTMLInputElement>('#split-mode-custom')!
  const customWeightsEl = section.querySelector<HTMLElement>('#split-custom-weights')!
  const weightsContainer = section.querySelector<HTMLElement>('#split-weight-rows')!
  const hintEl = section.querySelector<HTMLElement>('#split-hint')!

  const state = getState()
  toggle.checked = state.doughSplit.enabled
  panel.style.display = toggle.checked ? 'block' : 'none'
  numPiecesInput.value = String(state.doughSplit.numPieces)

  if (state.doughSplit.mode === 'custom') {
    modeCustom.checked = true
    customWeightsEl.style.display = 'block'
    reconcileWeightRows(weightsContainer, state.doughSplit.numPieces)
    // Restore saved weights
    const rows = weightsContainer.querySelectorAll<HTMLInputElement>('.split-weight-input')
    state.doughSplit.customWeights.forEach((w, i) => {
      if (rows[i]) rows[i].value = String(w)
    })
  } else {
    modeEqual.checked = true
    customWeightsEl.style.display = 'none'
  }

  function syncMode() {
    const isCustom = modeCustom.checked
    customWeightsEl.style.display = isCustom ? 'block' : 'none'
    if (isCustom) {
      reconcileWeightRows(weightsContainer, parseInt(numPiecesInput.value) || 1)
    }
    updateSplit(toggle, panel)
  }

  toggle.addEventListener('change', () => {
    panel.style.display = toggle.checked ? 'block' : 'none'
    updateSplit(toggle, panel)
  })

  numPiecesInput.addEventListener('input', () => {
    const n = Math.max(1, parseInt(numPiecesInput.value) || 1)
    if (modeCustom.checked) {
      reconcileWeightRows(weightsContainer, n)
    }
    updateSplit(toggle, panel)
  })

  modeEqual.addEventListener('change', syncMode)
  modeCustom.addEventListener('change', syncMode)

  // Show total dough weight hint from result
  subscribe((result) => {
    if (result.valid && toggle.checked) {
      hintEl.textContent = `Gesamtteig: ${result.targetWeight.toFixed(1)} g`
    } else {
      hintEl.textContent = ''
    }
  })
}
