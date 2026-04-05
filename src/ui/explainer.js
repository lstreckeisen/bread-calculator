export function initExplainer(section) {
    const toggleBtn = section.querySelector('#explainer-toggle');
    const content = section.querySelector('#explainer-content');
    content.style.display = 'none';
    toggleBtn.addEventListener('click', () => {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        toggleBtn.textContent = isOpen ? 'Berechnungen anzeigen ▾' : 'Berechnungen ausblenden ▴';
    });
}
