export function calcLevainModeA(cfg, totalFlour) {
    const levainTotal = totalFlour * cfg.levainPct / 100;
    const flourInLevain = levainTotal / (1 + cfg.starterHydration / 100);
    const waterInLevain = levainTotal - flourInLevain;
    return { levainTotal, flourInLevain, waterInLevain };
}
export function calcLevainModeB(cfg) {
    const starterFlour = cfg.anstellgutGrams / (1 + cfg.starterHydration / 100);
    const starterWater = cfg.anstellgutGrams - starterFlour;
    const levainWaterGrams = cfg.levainFlourGrams * cfg.levainHydration / 100;
    const levainTotal = cfg.anstellgutGrams + cfg.levainFlourGrams + levainWaterGrams;
    const flourInLevain = starterFlour + cfg.levainFlourGrams;
    const waterInLevain = starterWater + levainWaterGrams;
    return {
        levainTotal,
        flourInLevain,
        waterInLevain,
        anstellgutGrams: cfg.anstellgutGrams,
        levainFlourGrams: cfg.levainFlourGrams,
        levainWaterGrams,
    };
}
