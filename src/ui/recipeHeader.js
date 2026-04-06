import { getState, setState, subscribe } from '../state';
export function initRecipeHeader(section) {
    const nameInput = section.querySelector('#recipe-name');
    nameInput.value = getState().recipeName;
    nameInput.addEventListener('input', () => {
        setState({ recipeName: nameInput.value });
    });
    subscribe((_result, input) => {
        const name = input.recipeName.trim();
        document.title = name ? `${name} – Brot-Kalkulator` : 'Brot-Kalkulator';
    });
}
