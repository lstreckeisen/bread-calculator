const Q10 = 2.0;
/**
 * Estimate bulk fermentation time (hours) given levain % and temperature.
 * Uses Q10 temperature scaling combined with inverse linear levain % scaling.
 */
export function estimateTime(levainPct, temp, refTemp, refLevainPct, refTimeHours) {
    const tempFactor = Math.pow(Q10, (refTemp - temp) / 10);
    const levainFactor = refLevainPct / levainPct;
    return refTimeHours * tempFactor * levainFactor;
}
/**
 * Estimate levain % needed to achieve a target fermentation duration.
 */
export function estimateLevainPct(targetHours, temp, refTemp, refLevainPct, refTimeHours) {
    const tempFactor = Math.pow(Q10, (refTemp - temp) / 10);
    return refLevainPct * refTimeHours * tempFactor / targetHours;
}
export function calcFermentation(cfg) {
    const { direction, levainPct, targetHours, temperature, referenceTemp, referenceLevainPct, referenceTimeHours } = cfg;
    if (direction === 'timeFromLevain') {
        const hours = estimateTime(levainPct, temperature, referenceTemp, referenceLevainPct, referenceTimeHours);
        return { estimatedHours: hours, estimatedLevainPct: null };
    }
    else {
        const pct = estimateLevainPct(targetHours, temperature, referenceTemp, referenceLevainPct, referenceTimeHours);
        return { estimatedHours: null, estimatedLevainPct: pct };
    }
}
