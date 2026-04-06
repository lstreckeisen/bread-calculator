import { FLOUR_GRAINS, TYPES_BY_GRAIN } from '../../data/flours'
import type { FlourGrain, FlourTypeName } from '../../types'

export function buildFlourSelects(
  grainId: string,
  typeId: string,
  defaultGrain: FlourGrain,
  defaultType: FlourTypeName,
): { grainSel: HTMLSelectElement; typeSel: HTMLSelectElement } {
  const grainSel = document.getElementById(grainId) as HTMLSelectElement
  const typeSel  = document.getElementById(typeId)  as HTMLSelectElement

  grainSel.innerHTML = ''
  FLOUR_GRAINS.forEach(g => {
    const opt = document.createElement('option')
    opt.value = g
    opt.textContent = g
    if (g === defaultGrain) opt.selected = true
    grainSel.appendChild(opt)
  })

  function populateTypes(grain: FlourGrain, selected?: FlourTypeName) {
    typeSel.innerHTML = ''
    TYPES_BY_GRAIN[grain].forEach(t => {
      const opt = document.createElement('option')
      opt.value = t
      opt.textContent = t
      if (t === selected) opt.selected = true
      typeSel.appendChild(opt)
    })
  }
  populateTypes(defaultGrain, defaultType)

  grainSel.addEventListener('change', () => {
    populateTypes(grainSel.value as FlourGrain)
  })

  return { grainSel, typeSel }
}
