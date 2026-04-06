import { jsPDF } from 'jspdf'
import { getState, getResult } from '../state'

function formatG(value: number): string {
  return `${value.toFixed(1)} g`
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const min = Math.round((hours - h) * 60 / 15) * 15
  if (min === 0) return `${h} Std.`
  if (min === 60) return `${h + 1} Std.`
  return `${h} Std. ${min} Min.`
}

export function initPdfExport(section: HTMLElement): void {
  const pdfBtn = section.querySelector<HTMLButtonElement>('#pdf-btn')!
  pdfBtn.addEventListener('click', () => exportPdf())
}

function exportPdf(): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const input = getState()
  const result = getResult()

  if (!result.valid) return

  const PAGE_W = 210
  const MARGIN = 15
  const COL_W = PAGE_W - MARGIN * 2
  const LINE_H = 6
  const SUB_INDENT = 8
  let y = MARGIN

  function ensureSpace(needed: number) {
    if (y + needed > 297 - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function sectionTitle(text: string) {
    ensureSpace(10)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(text, MARGIN, y)
    y += 7
    doc.setDrawColor(180)
    doc.line(MARGIN, y, MARGIN + COL_W, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
  }

  function tableRow(label: string, value: string, indent = 0, bold = false) {
    ensureSpace(LINE_H)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(10)
    doc.text(label, MARGIN + indent, y)
    doc.text(value, MARGIN + COL_W, y, { align: 'right' })
    y += LINE_H
    doc.setFont('helvetica', 'normal')
  }

  function divider() {
    ensureSpace(4)
    doc.setDrawColor(200)
    doc.line(MARGIN, y, MARGIN + COL_W, y)
    y += 4
  }

  // ─── Title ───────────────────────────────────────────────────────────────
  const title = input.recipeName.trim() || 'Brot-Rezept'
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, MARGIN, y)
  y += 10

  // ─── Kochstück ───────────────────────────────────────────────────────────
  if (result.kochstueck) {
    sectionTitle('Kochstück')
    tableRow(`Mehl (${result.kochstueck.flourGrain} ${result.kochstueck.flourType})`, formatG(result.kochstueck.flourGrams))
    tableRow('Wasser', formatG(result.kochstueck.waterGrams))
    divider()
    tableRow('Kochstück gesamt', formatG(result.kochstueck.flourGrams + result.kochstueck.waterGrams), 0, true)
    y += 4
  }

  // ─── Quellstück ──────────────────────────────────────────────────────────
  if (result.quellstueck) {
    sectionTitle('Quellstück')
    result.quellstueck.entries.forEach(e => tableRow(e.name || 'Zutat', formatG(e.grams)))
    tableRow('Quellwasser', formatG(result.quellstueck.soakingWaterGrams))
    y += 4
  }

  // ─── Levain ──────────────────────────────────────────────────────────────
  const lv = result.levain
  const isPureYeast = lv.yeastGrams > 0 && lv.levainTotal === 0
  const isHybrid = lv.yeastGrams > 0 && lv.levainTotal > 0
  const yeastLabel = lv.yeastType === 'dry' ? 'Hefe (Trocken)' : 'Hefe (Frisch)'

  if (isPureYeast) {
    sectionTitle(yeastLabel)
    tableRow(yeastLabel, formatG(lv.yeastGrams))
  } else {
    sectionTitle('Levain')
    if (lv.levainFlourGrams !== undefined) {
      tableRow('Anstellgut', formatG(lv.anstellgutGrams ?? 0))
      tableRow('Mehl', formatG(lv.levainFlourGrams))
      tableRow('Wasser', formatG(lv.levainWaterGrams ?? 0))
      divider()
      tableRow('Levain gesamt', formatG(lv.levainTotal), 0, true)
    } else {
      tableRow('Anstellgut', formatG(lv.levainTotal))
      tableRow('davon Mehl', formatG(lv.flourInLevain), SUB_INDENT)
      tableRow('davon Wasser', formatG(lv.waterInLevain), SUB_INDENT)
    }
    if (isHybrid) {
      tableRow(yeastLabel, formatG(lv.yeastGrams))
    }
  }
  y += 4

  // ─── Hauptteig ───────────────────────────────────────────────────────────
  sectionTitle('Hauptteig')

  if (result.perFlour.length > 1) {
    tableRow('Mehl gesamt', formatG(result.mainFlour))
    result.perFlour.forEach(pf => tableRow(`${pf.grain} ${pf.type}`, formatG(pf.mainFlourGrams), SUB_INDENT))
  } else {
    tableRow('Mehl', formatG(result.mainFlour))
  }

  if (result.autolyse) {
    tableRow('Wasser gesamt', formatG(result.mainWater))
    tableRow('Autolyse', formatG(result.autolyse.autolysisWater), SUB_INDENT)
    if (result.autolyse.bassinageWater > 0) tableRow('Bassinage', formatG(result.autolyse.bassinageWater), SUB_INDENT)
    tableRow('Sofort', formatG(result.autolyse.initialWater), SUB_INDENT)
  } else {
    tableRow('Wasser', formatG(result.mainWater))
  }

  tableRow('Salz', formatG(result.totalSalt))
  if (lv.levainTotal > 0) tableRow('Levain', formatG(lv.levainTotal))
  if (lv.yeastGrams > 0) tableRow(yeastLabel, formatG(lv.yeastGrams))
  if (result.enrichments?.honeyGrams) tableRow('Honig', formatG(result.enrichments.honeyGrams))
  if (result.enrichments?.maltGrams) tableRow('Backmalz', formatG(result.enrichments.maltGrams))
  if (result.inclusions) {
    result.inclusions.entries.forEach(e => tableRow(e.name || 'Einlage', formatG(e.amountG)))
  }
  divider()
  tableRow('Teig gesamt', formatG(result.targetWeight), 0, true)
  y += 4

  // ─── Teigaufteilung ──────────────────────────────────────────────────────
  if (result.doughSplit) {
    sectionTitle('Teigaufteilung')
    result.doughSplit.pieces.forEach((w, i) => tableRow(`Stück ${i + 1}`, formatG(w)))
    if (result.doughSplit.trimLoss > 0) tableRow('Teigverlust', formatG(result.doughSplit.trimLoss), SUB_INDENT)
    y += 4
  }

  // ─── Gärzeiten ───────────────────────────────────────────────────────────
  if (result.fermentation) {
    sectionTitle('Gärzeiten')
    tableRow('Stockgare', formatHours(result.fermentation.estimatedHours))
    if (result.fermentation.stuckgare) {
      const pwNote = result.fermentation.stuckgare.pieceWeightUsed !== null
        ? ` (${result.fermentation.stuckgare.pieceWeightUsed.toFixed(0)} g Stück)`
        : ''
      tableRow(`Stückgare${pwNote}`, formatHours(result.fermentation.stuckgare.estimatedHours))
    }
    y += 4
  }

  // ─── Anleitung ───────────────────────────────────────────────────────────
  const steps = input.steps.filter(s => s.trim().length > 0)
  if (steps.length > 0) {
    sectionTitle('Anleitung')
    steps.forEach((step, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${step}`, COL_W)
      ensureSpace(lines.length * LINE_H)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(lines, MARGIN, y)
      y += lines.length * LINE_H + 2
    })
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  const filename = input.recipeName.trim()
    ? input.recipeName.trim().replace(/[^a-zA-Z0-9\-_äöüÄÖÜ]/g, '-').replace(/-+/g, '-') + '.pdf'
    : 'brot-rezept.pdf'
  doc.save(filename)
}
