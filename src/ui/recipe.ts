import { getState, setState, subscribe } from '../state'

export function initRecipeInputs(section: HTMLElement): void {
  const hydrationInput = section.querySelector<HTMLInputElement>('#hydration')!
  const saltInput = section.querySelector<HTMLInputElement>('#salt-pct')!
  const hydrationHint = section.querySelector<HTMLElement>('#hydration-hint')!

  const state = getState()
  hydrationInput.value = String(state.hydration)
  saltInput.value = String(state.saltPct)

  hydrationInput.addEventListener('input', () => {
    setState({ hydration: parseFloat(hydrationInput.value) || 0 })
  })
  saltInput.addEventListener('input', () => {
    setState({ saltPct: parseFloat(saltInput.value) || 0 })
  })

  subscribe((result) => {
    hydrationHint.textContent = `Empfehlung basierend auf Mehlmischung: ${result.weightedHydrationHint.toFixed(1)}%`
  })
}
