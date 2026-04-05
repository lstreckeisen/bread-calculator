export function initExplainer(section: HTMLElement): void {
  const toggleBtn = section.querySelector<HTMLButtonElement>('#explainer-toggle')!
  const content = section.querySelector<HTMLElement>('#explainer-content')!

  content.style.display = 'none'

  toggleBtn.addEventListener('click', () => {
    const isOpen = content.style.display !== 'none'
    content.style.display = isOpen ? 'none' : 'block'
    toggleBtn.textContent = isOpen ? 'Berechnungen anzeigen ▾' : 'Berechnungen ausblenden ▴'
  })
}
