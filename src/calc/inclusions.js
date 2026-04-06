export function calcInclusions(cfg, totalFlour) {
    if (!cfg.enabled || cfg.entries.length === 0) {
        return { totalGrams: 0, hydrationHintAdjustment: 0, entries: [] };
    }
    const totalGrams = cfg.entries.reduce((sum, e) => sum + e.amountG, 0);
    // Extra hydration needed to compensate for moisture absorbed by inclusions.
    // For each entry with absorptionCompensation enabled:
    //   absorbed water (g) = amountG × absorptionPct / 100
    // Total adjustment = absorbed water / totalFlour × 100  (in baker's %)
    const absorbedWater = cfg.entries
        .filter(e => e.absorptionCompensation)
        .reduce((sum, e) => sum + e.amountG * e.absorptionPct / 100, 0);
    const hydrationHintAdjustment = totalFlour > 0 ? (absorbedWater / totalFlour) * 100 : 0;
    return {
        totalGrams,
        hydrationHintAdjustment,
        entries: cfg.entries.map(e => ({ name: e.name, amountG: e.amountG })),
    };
}
