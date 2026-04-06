export function calcKochstueck(cfg) {
    return {
        flourGrams: cfg.flourGrams,
        waterGrams: cfg.waterGrams,
        flourGrain: cfg.flourGrain,
        flourType: cfg.flourType,
    };
}
export function calcQuellstueck(cfg) {
    // Soaking water is fully deducted from the main dough water
    return {
        entries: cfg.entries.map(e => ({ name: e.name, grams: e.grams })),
        soakingWaterGrams: cfg.soakingWaterGrams,
        absorbedWaterGrams: cfg.soakingWaterGrams,
    };
}
