export function calcEnrichments(cfg, totalFlour, fermentationEnabled, warnings) {
    const honeyGrams = cfg.honey.enabled ? cfg.honey.amountG : 0;
    const maltGrams = cfg.malt.enabled ? cfg.malt.amountG : 0;
    const activeMaltHint = cfg.malt.enabled && cfg.malt.maltType === 'aktiv' && fermentationEnabled;
    if (cfg.malt.enabled && totalFlour > 0 && maltGrams / totalFlour > 0.03) {
        warnings.push('Backmalz-Anteil über 3% — ungewöhnlich hoch, bitte prüfen.');
    }
    return { honeyGrams, maltGrams, activeMaltHint };
}
