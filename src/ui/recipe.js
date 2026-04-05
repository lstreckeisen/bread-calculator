import { getState, setState, subscribe } from '../state';
export function initRecipeInputs(section) {
    const hydrationInput = section.querySelector('#hydration');
    const saltInput = section.querySelector('#salt-pct');
    const hydrationHint = section.querySelector('#hydration-hint');
    const state = getState();
    hydrationInput.value = String(state.hydration);
    saltInput.value = String(state.saltPct);
    hydrationInput.addEventListener('input', () => {
        setState({ hydration: parseFloat(hydrationInput.value) || 0 });
    });
    saltInput.addEventListener('input', () => {
        setState({ saltPct: parseFloat(saltInput.value) || 0 });
    });
    subscribe((result) => {
        hydrationHint.textContent = `Empfehlung basierend auf Mehlmischung: ${result.weightedHydrationHint.toFixed(1)}%`;
    });
}
