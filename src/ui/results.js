import { subscribe } from '../state';
function g(value) {
    return `${value.toFixed(1)} g`;
}
function formatHours(hours) {
    const h = Math.floor(hours);
    const min = Math.round((hours - h) * 60 / 15) * 15;
    if (min === 0)
        return `${h} Std.`;
    if (min === 60)
        return `${h + 1} Std.`;
    return `${h} Std. ${min} Min.`;
}
export function initResults(section) {
    const errorsEl = section.querySelector('#result-errors');
    const tableEl = section.querySelector('#result-table');
    subscribe((result, input) => renderResults(result, input, errorsEl, tableEl));
}
function renderResults(result, input, errorsEl, tableEl) {
    if (!result.valid) {
        errorsEl.innerHTML = result.errors.map(e => `<li>${e}</li>`).join('');
        errorsEl.style.display = 'block';
        tableEl.style.display = 'none';
        return;
    }
    errorsEl.style.display = 'none';
    tableEl.style.display = 'block';
    tableEl.innerHTML = `
    ${result.warnings.length > 0 ? warningsBlock(result.warnings) : ''}
    ${result.kochstueck ? kochstueckBlock(result.kochstueck) : ''}
    ${result.quellstueck ? quellstueckBlock(result.quellstueck) : ''}
    ${levainBlock(result)}
    ${mainDoughBlock(result)}
    ${result.doughSplit ? doughSplitBlock(result.doughSplit) : ''}
    ${summaryBar(result)}
    ${input.steps.length > 0 ? stepsBlock(input.steps) : ''}
  `;
}
// ─── Levain block ────────────────────────────────────────────────────────────
function yeastLabel(yeastType) {
    return yeastType === 'dry' ? 'Hefe (Trocken)' : 'Hefe (Frisch)';
}
function sourdoughRows(lv) {
    if (lv.levainFlourGrams !== undefined) {
        // sourdough-build
        return `
      ${row('Anstellgut', g(lv.anstellgutGrams ?? 0))}
      ${row('Mehl', g(lv.levainFlourGrams ?? 0))}
      ${row('Wasser', g(lv.levainWaterGrams ?? 0))}
      ${totalRow('Levain gesamt', g(lv.levainTotal))}
    `;
    }
    // sourdough-direct
    return `
    ${row('Anstellgut', g(lv.levainTotal))}
    ${subRow('davon Mehl', g(lv.flourInLevain))}
    ${subRow('davon Wasser', g(lv.waterInLevain))}
  `;
}
function levainBlock(result) {
    const lv = result.levain;
    const isPureYeast = lv.yeastGrams > 0 && lv.levainTotal === 0;
    const isHybrid = lv.yeastGrams > 0 && lv.levainTotal > 0;
    const hintHtml = lv.hint
        ? `<div class="hint">${lv.hint}</div>`
        : '';
    if (isPureYeast) {
        const rows = `${row(yeastLabel(lv.yeastType), g(lv.yeastGrams))}`;
        return block(yeastLabel(lv.yeastType), rows);
    }
    if (isHybrid) {
        const sdRows = sourdoughRows(lv);
        const yRows = `${row(yeastLabel(lv.yeastType), g(lv.yeastGrams))}`;
        return `
      ${block('Levain', sdRows)}
      ${hintHtml}
      ${block(yeastLabel(lv.yeastType), yRows)}
    `;
    }
    // Pure sourdough (direct or build)
    return block('Levain', sourdoughRows(lv));
}
// ─── Main dough block ─────────────────────────────────────────────────────────
function mainDoughBlock(result) {
    const multiFlour = result.perFlour.length > 1;
    const flourRows = multiFlour
        ? `
        ${row('Mehl gesamt', g(result.mainFlour))}
        ${result.perFlour.map(pf => subRow(`${pf.grain} ${pf.type}`, g(pf.mainFlourGrams))).join('')}
      `
        : row('Mehl', g(result.mainFlour));
    const waterRows = result.autolyse
        ? `
        ${row('Wasser gesamt', g(result.mainWater))}
        ${subRow('Autolyse', g(result.autolyse.autolysisWater))}
        ${result.autolyse.bassinageWater > 0 ? subRow('Bassinage', g(result.autolyse.bassinageWater)) : ''}
        ${subRow('Sofort', g(result.autolyse.initialWater))}
      `
        : row('Wasser', g(result.mainWater));
    const enrichmentRows = result.enrichments
        ? [
            result.enrichments.honeyGrams > 0 ? row('Honig', g(result.enrichments.honeyGrams)) : '',
            result.enrichments.maltGrams > 0 ? row('Backmalz', g(result.enrichments.maltGrams)) : '',
        ].join('')
        : '';
    const inclusionRows = result.inclusions && result.inclusions.entries.length > 0
        ? result.inclusions.entries.map(e => row(e.name || 'Einlage', g(e.amountG))).join('') +
            (result.inclusions.hydrationHintAdjustment > 0
                ? `<tr class="sub"><td class="result-label" colspan="2">⚠ Hydrations-Empfehlung um +${result.inclusions.hydrationHintAdjustment.toFixed(1)}% angepasst (Wasseraufnahme der Einlagen)</td></tr>`
                : '')
        : '';
    const rows = `
    ${flourRows}
    ${waterRows}
    ${row('Salz', g(result.totalSalt))}
    ${result.levain.levainTotal > 0 ? row('Levain', g(result.levain.levainTotal)) : ''}
    ${result.levain.yeastGrams > 0 ? row(yeastLabel(result.levain.yeastType), g(result.levain.yeastGrams)) : ''}
    ${enrichmentRows}
    ${inclusionRows}
    ${totalRow('Teig gesamt', g(result.targetWeight))}
  `;
    return block('Hauptteig', rows);
}
// ─── Summary bar ─────────────────────────────────────────────────────────────
function summaryBar(result) {
    const items = [
        `<span>Teiggewicht <strong>${g(result.targetWeight)}</strong></span>`,
        `<span>Hydration <strong>${(result.totalWater / result.totalFlour * 100).toFixed(1)}%</strong></span>`,
    ];
    if (result.fermentation) {
        const f = result.fermentation;
        let fermLabel = `Stockgare ca. <strong>${formatHours(f.estimatedHours)}</strong>`;
        if (f.stuckgare) {
            const pwLabel = f.stuckgare.pieceWeightUsed !== null
                ? ` <span class="summary-note">(${f.stuckgare.pieceWeightUsed.toFixed(0)} g Stück)</span>`
                : '';
            fermLabel += ` + Stückgare ca. <strong>${formatHours(f.stuckgare.estimatedHours)}</strong>${pwLabel}`;
        }
        items.push(`<span>${fermLabel}</span>`);
        if (f.estimatedLevainPct !== null) {
            items.push(`<span>Für ${formatHours(f.levainTargetHours)}: Levain <strong>${f.estimatedLevainPct.toFixed(1)}%</strong></span>`);
        }
        if (f.stuckgare?.estimatedLevainPct !== null && f.stuckgare?.estimatedLevainPct !== undefined) {
            items.push(`<span>Stückgare ${formatHours(f.stuckgare.levainTargetHours)}: Levain <strong>${f.stuckgare.estimatedLevainPct.toFixed(1)}%</strong></span>`);
        }
    }
    return `<div class="result-summary">${items.join('<span class="summary-sep">·</span>')}</div>`;
}
// ─── Preparation blocks ──────────────────────────────────────────────────────
function kochstueckBlock(ks) {
    const rows = `
    ${row(`Mehl (${ks.flourGrain} ${ks.flourType})`, g(ks.flourGrams))}
    ${row('Wasser', g(ks.waterGrams))}
    ${totalRow('Kochstück gesamt', g(ks.flourGrams + ks.waterGrams))}
  `;
    return block('Kochstück', rows);
}
function quellstueckBlock(qs) {
    const entryRows = qs.entries.map(e => row(e.name || 'Zutat', g(e.grams))).join('');
    const rows = `
    ${entryRows}
    ${row('Quellwasser', g(qs.soakingWaterGrams))}
    ${qs.absorbedWaterGrams > 0 ? subRow('davon absorbiert (Abzug Hauptteig)', g(qs.absorbedWaterGrams)) : ''}
  `;
    return block('Quellstück', rows);
}
// ─── Dough split block ───────────────────────────────────────────────────────
function doughSplitBlock(split) {
    const pieceRows = split.pieces
        .map((w, i) => row(`Stück ${i + 1}`, g(w)))
        .join('');
    const trimRow = split.trimLoss > 0
        ? subRow('Teigverlust (Beschnitt)', g(split.trimLoss))
        : '';
    return block('Teigaufteilung', `${pieceRows}${trimRow}`);
}
// ─── Steps block ─────────────────────────────────────────────────────────────
function stepsBlock(steps) {
    const items = steps
        .filter(s => s.trim().length > 0)
        .map((s, i) => `<div class="result-step"><span class="result-step-num">${i + 1}.</span><span>${s}</span></div>`)
        .join('');
    return `<div class="result-block"><div class="result-block-title">Anleitung</div><div class="result-steps">${items}</div></div>`;
}
// ─── Warnings block ──────────────────────────────────────────────────────────
function warningsBlock(warnings) {
    return `<ul class="result-warnings">${warnings.map(w => `<li>${w}</li>`).join('')}</ul>`;
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function block(title, content) {
    return `
    <div class="result-block">
      <div class="result-block-title">${title}</div>
      <table class="result-table"><tbody>${content}</tbody></table>
    </div>
  `;
}
function row(label, value) {
    return `<tr><td class="result-label">${label}</td><td class="result-value">${value}</td></tr>`;
}
function subRow(label, value) {
    return `<tr class="sub"><td class="result-label">${label}</td><td class="result-value">${value}</td></tr>`;
}
function totalRow(label, value) {
    return `
    <tr class="total-divider"><td colspan="2"></td></tr>
    <tr class="total"><td class="result-label">${label}</td><td class="result-value">${value}</td></tr>
  `;
}
