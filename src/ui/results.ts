import { subscribe } from '../state'
import type { RecipeResult } from '../types'

function g(value: number): string {
  return `${value.toFixed(1)} g`
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const min = Math.round((hours - h) * 60 / 15) * 15
  if (min === 0) return `${h} Std.`
  if (min === 60) return `${h + 1} Std.`
  return `${h} Std. ${min} Min.`
}

export function initResults(section: HTMLElement): void {
  const errorsEl = section.querySelector<HTMLElement>('#result-errors')!
  const tableEl = section.querySelector<HTMLElement>('#result-table')!
  subscribe((result) => renderResults(result, errorsEl, tableEl))
}

function renderResults(result: RecipeResult, errorsEl: HTMLElement, tableEl: HTMLElement): void {
  if (!result.valid) {
    errorsEl.innerHTML = result.errors.map(e => `<li>${e}</li>`).join('')
    errorsEl.style.display = 'block'
    tableEl.style.display = 'none'
    return
  }

  errorsEl.style.display = 'none'
  tableEl.style.display = 'block'
  tableEl.innerHTML = `
    ${levainBlock(result)}
    ${mainDoughBlock(result)}
    ${summaryBar(result)}
  `
}

// ─── Levain block ────────────────────────────────────────────────────────────

function levainBlock(result: RecipeResult): string {
  const lv = result.levain
  const isModeB = lv.levainFlourGrams !== undefined

  const rows = isModeB
    ? `
        ${row('Anstellgut', g(lv.anstellgutGrams ?? 0))}
        ${row('Mehl', g(lv.levainFlourGrams ?? 0))}
        ${row('Wasser', g(lv.levainWaterGrams ?? 0))}
        ${totalRow('Levain gesamt', g(lv.levainTotal))}
      `
    : `
        ${row('Anstellgut', g(lv.levainTotal))}
        ${subRow(`davon Mehl`, g(lv.flourInLevain))}
        ${subRow(`davon Wasser`, g(lv.waterInLevain))}
      `

  return block('Levain', rows)
}

// ─── Main dough block ─────────────────────────────────────────────────────────

function mainDoughBlock(result: RecipeResult): string {
  const multiFlour = result.perFlour.length > 1

  const flourRows = multiFlour
    ? `
        ${row('Mehl gesamt', g(result.mainFlour))}
        ${result.perFlour.map(pf =>
          subRow(`${pf.grain} ${pf.type}`, g(pf.mainFlourGrams))
        ).join('')}
      `
    : row('Mehl', g(result.mainFlour))

  const waterRows = result.autolyse
    ? `
        ${row('Wasser gesamt', g(result.mainWater))}
        ${subRow('Autolyse', g(result.autolyse.autolysisWater))}
        ${result.autolyse.bassinageWater > 0 ? subRow('Bassinage', g(result.autolyse.bassinageWater)) : ''}
        ${subRow('Sofort', g(result.autolyse.initialWater))}
      `
    : row('Wasser', g(result.mainWater))

  const rows = `
    ${flourRows}
    ${waterRows}
    ${row('Salz', g(result.totalSalt))}
    ${row('Levain', g(result.levain.levainTotal))}
    ${totalRow('Teig gesamt', g(result.totalFlour + result.totalWater + result.totalSalt))}
  `

  return block('Hauptteig', rows)
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function summaryBar(result: RecipeResult): string {
  const items: string[] = [
    `<span>Teiggewicht <strong>${g(result.targetWeight)}</strong></span>`,
    `<span>Hydration <strong>${(result.totalWater / result.totalFlour * 100).toFixed(1)}%</strong></span>`,
  ]

  if (result.fermentation) {
    const f = result.fermentation
    if (f.estimatedHours !== null) {
      items.push(`<span>Stockgare ca. <strong>${formatHours(f.estimatedHours)}</strong></span>`)
    } else if (f.estimatedLevainPct !== null) {
      items.push(`<span>Empfohlener Levain-Anteil <strong>${f.estimatedLevainPct.toFixed(1)}%</strong></span>`)
    }
  }

  return `<div class="result-summary">${items.join('<span class="summary-sep">·</span>')}</div>`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function block(title: string, content: string): string {
  return `
    <div class="result-block">
      <div class="result-block-title">${title}</div>
      <table class="result-table"><tbody>${content}</tbody></table>
    </div>
  `
}

function row(label: string, value: string): string {
  return `<tr><td class="result-label">${label}</td><td class="result-value">${value}</td></tr>`
}

function subRow(label: string, value: string): string {
  return `<tr class="sub"><td class="result-label">${label}</td><td class="result-value">${value}</td></tr>`
}

function totalRow(label: string, value: string): string {
  return `
    <tr class="total-divider"><td colspan="2"></td></tr>
    <tr class="total"><td class="result-label">${label}</td><td class="result-value">${value}</td></tr>
  `
}
