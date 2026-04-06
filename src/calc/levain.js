// ---------------------------------------------------------------------------
// Conversion constants
// ---------------------------------------------------------------------------
/** Approximate ratio: 15% levain weight → equivalent fresh yeast */
export const LEVAIN_TO_FRESH_YEAST_RATIO = 0.15;
/** Fresh yeast to dry yeast: divide by 3 */
export const FRESH_TO_DRY_YEAST_RATIO = 1 / 3;
// ---------------------------------------------------------------------------
// Conversion helpers (used by UI for mode switching)
// ---------------------------------------------------------------------------
export function convertLevainToFreshYeast(levainPct, totalFlour) {
    const levainGrams = totalFlour * levainPct / 100;
    return Math.round(levainGrams * LEVAIN_TO_FRESH_YEAST_RATIO * 10) / 10;
}
export function convertFreshToDryYeast(freshGrams) {
    return Math.round(freshGrams * FRESH_TO_DRY_YEAST_RATIO * 10) / 10;
}
export function convertDryToFreshYeast(dryGrams) {
    return Math.round(dryGrams / FRESH_TO_DRY_YEAST_RATIO * 10) / 10;
}
export function convertFreshYeastToLevainPct(freshGrams, totalFlour) {
    if (totalFlour <= 0)
        return 20;
    const levainGrams = freshGrams / LEVAIN_TO_FRESH_YEAST_RATIO;
    return Math.round(levainGrams / totalFlour * 1000) / 10;
}
// ---------------------------------------------------------------------------
// Calc functions
// ---------------------------------------------------------------------------
export function calcSourdoughDirect(cfg, totalFlour) {
    const levainTotal = totalFlour * cfg.levainPct / 100;
    const flourInLevain = levainTotal / (1 + cfg.starterHydration / 100);
    const waterInLevain = levainTotal - flourInLevain;
    return { levainTotal, flourInLevain, waterInLevain, yeastGrams: 0, yeastType: null, hint: null };
}
export function calcSourdoughBuild(cfg) {
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
        yeastGrams: 0,
        yeastType: null,
        hint: null,
    };
}
export function calcFreshYeast(cfg) {
    return {
        levainTotal: 0,
        flourInLevain: 0,
        waterInLevain: 0,
        yeastGrams: cfg.yeastGrams,
        yeastType: 'fresh',
        hint: null,
    };
}
export function calcDryYeast(cfg) {
    return {
        levainTotal: 0,
        flourInLevain: 0,
        waterInLevain: 0,
        yeastGrams: cfg.yeastGrams,
        yeastType: 'dry',
        hint: null,
    };
}
export function calcHybridYeastPrimary(cfg, totalFlour) {
    const levainResult = cfg.levain.mode === 'sourdough-direct'
        ? calcSourdoughDirect(cfg.levain, totalFlour)
        : calcSourdoughBuild(cfg.levain);
    const yeastResult = cfg.yeast.mode === 'fresh-yeast'
        ? calcFreshYeast(cfg.yeast)
        : calcDryYeast(cfg.yeast);
    return {
        ...levainResult,
        yeastGrams: yeastResult.yeastGrams,
        yeastType: yeastResult.yeastType,
        hint: 'Hefe-primär: Sauerteig-Zusatz dient der Aromaentwicklung — kein Einfluss auf die Gärzeitschätzung.',
    };
}
export function calcHybridSourdoughPrimary(cfg, totalFlour) {
    const levainResult = cfg.levain.mode === 'sourdough-direct'
        ? calcSourdoughDirect(cfg.levain, totalFlour)
        : calcSourdoughBuild(cfg.levain);
    const yeastResult = cfg.yeast.mode === 'fresh-yeast'
        ? calcFreshYeast(cfg.yeast)
        : calcDryYeast(cfg.yeast);
    return {
        ...levainResult,
        yeastGrams: yeastResult.yeastGrams,
        yeastType: yeastResult.yeastType,
        hint: 'Sauerteig-primär: Hefe-Beitrag ist nicht modelliert — tatsächliche Gärzeit ist kürzer als geschätzt.',
    };
}
export function calcLeaven(cfg, totalFlour) {
    switch (cfg.mode) {
        case 'sourdough-direct': return calcSourdoughDirect(cfg, totalFlour);
        case 'sourdough-build': return calcSourdoughBuild(cfg);
        case 'fresh-yeast': return calcFreshYeast(cfg);
        case 'dry-yeast': return calcDryYeast(cfg);
        case 'hybrid-yeast-primary': return calcHybridYeastPrimary(cfg, totalFlour);
        case 'hybrid-sourdough-primary': return calcHybridSourdoughPrimary(cfg, totalFlour);
    }
}
// Legacy exports for backward compatibility
export const calcLevainModeA = calcSourdoughDirect;
export const calcLevainModeB = calcSourdoughBuild;
