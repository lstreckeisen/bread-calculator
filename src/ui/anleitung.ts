import { getState, setState } from '../state'

function readSteps(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLTextAreaElement>('.step-text')).map(t => t.value)
}

function renderStepRow(text: string, container: HTMLElement): HTMLLIElement {
  const li = document.createElement('li')
  li.className = 'step-row'

  const textarea = document.createElement('textarea')
  textarea.className = 'step-text'
  textarea.rows = 2
  textarea.value = text
  textarea.placeholder = 'Schritt beschreiben…'

  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className = 'btn-icon remove-step'
  removeBtn.textContent = '×'
  removeBtn.setAttribute('aria-label', 'Schritt entfernen')

  const upBtn = document.createElement('button')
  upBtn.type = 'button'
  upBtn.className = 'btn-icon move-step-up'
  upBtn.textContent = '↑'
  upBtn.setAttribute('aria-label', 'Schritt nach oben')

  const downBtn = document.createElement('button')
  downBtn.type = 'button'
  downBtn.className = 'btn-icon move-step-down'
  downBtn.textContent = '↓'
  downBtn.setAttribute('aria-label', 'Schritt nach unten')

  li.appendChild(textarea)
  li.appendChild(upBtn)
  li.appendChild(downBtn)
  li.appendChild(removeBtn)

  const update = () => setState({ steps: readSteps(container) })

  textarea.addEventListener('input', update)

  removeBtn.addEventListener('click', () => {
    li.remove()
    update()
  })

  upBtn.addEventListener('click', () => {
    const prev = li.previousElementSibling
    if (prev) {
      container.insertBefore(li, prev)
      update()
    }
  })

  downBtn.addEventListener('click', () => {
    const next = li.nextElementSibling
    if (next) {
      container.insertBefore(next, li)
      update()
    }
  })

  return li
}

export function initAnleitung(section: HTMLElement): void {
  const stepsContainer = section.querySelector<HTMLElement>('#anleitung-steps')!
  const addBtn = section.querySelector<HTMLButtonElement>('#add-step-btn')!

  // Render existing steps from state
  getState().steps.forEach(text => {
    stepsContainer.appendChild(renderStepRow(text, stepsContainer))
  })

  addBtn.addEventListener('click', () => {
    stepsContainer.appendChild(renderStepRow('', stepsContainer))
    const lastTextarea = stepsContainer.querySelector<HTMLTextAreaElement>('.step-row:last-child .step-text')
    lastTextarea?.focus()
  })
}
