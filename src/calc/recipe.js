import { getAbsorptionMidpoint } from '../data/flours';
import { calcLevainModeA, calcLevainModeB } from './levain';
import { calcAutolyse } from './autolyse';
import { calcFermentation } from './fermentation';
export function calcWeightedHydrationHint(input) {
    const total = input.flourBlend.reduce((sum, e) => sum + e.grams, 0);
    if (total === 0)
        return 65;
    return input.flourBlend.reduce((sum, e) => {
        return sum + (e.grams / total) * getAbsorptionMidpoint(e.grain, e.type);
    }, 0);
}
function validate(input) {
    const errors = [];
    const totalFlour = input.flourBlend.reduce((sum, e) => sum + e.grams, 0);
    if (totalFlour <= 0)
        errors.push('Mindestens eine Mehlsorte mit Menge > 0 angeben.');
    if (input.hydration <= 0 || input.hydration >= 200)
        errors.push('Hydration muss zwischen 1% und 199% liegen.');
    if (input.saltPct < 0)
        errors.push('Salzanteil darf nicht negativ sein.');
    if (input.flourBlend.length === 0)
        errors.push('Mindestens eine Mehlsorte angeben.');
    if (input.levain.mode === 'A') {
        if (input.levain.levainPct <= 0)
            errors.push('Levain-Anteil muss grösser als 0 sein.');
        if (input.levain.starterHydration <= 0)
            errors.push('Anstellgut-Hydration muss grösser als 0 sein.');
    }
    else {
        if (input.levain.anstellgutGrams < 0)
            errors.push('Anstellgut-Menge darf nicht negativ sein.');
        if (input.levain.levainFlourGrams <= 0)
            errors.push('Levain-Mehl muss grösser als 0 sein.');
        if (input.levain.levainHydration <= 0)
            errors.push('Levain-Hydration muss grösser als 0 sein.');
    }
    const levainFlourInBlend = input.flourBlend.some(e => e.grain === input.levain.flourGrain && e.type === input.levain.flourType);
    if (!levainFlourInBlend) {
        errors.push(`Levain-Mehl (${input.levain.flourGrain} ${input.levain.flourType}) ist nicht in der Mehlmischung — bitte Mehlsorte hinzufügen oder Levain-Mehl anpassen.`);
    }
    if (input.autolyse.enabled) {
        const combined = input.autolyse.autolyseWaterPct + input.autolyse.bassinageWaterPct;
        if (combined > 100)
            errors.push(`Autolyse (${input.autolyse.autolyseWaterPct}%) + Bassinage (${input.autolyse.bassinageWaterPct}%) überschreiten 100%.`);
    }
    return errors;
}
export function calculate(input) {
    const errors = validate(input);
    const weightedHydrationHint = calcWeightedHydrationHint(input);
    const empty = {
        targetWeight: 0, totalFlour: 0, totalWater: 0, totalSalt: 0,
        mainFlour: 0, mainWater: 0,
        weightedHydrationHint,
        perFlour: [],
        levain: { levainTotal: 0, flourInLevain: 0, waterInLevain: 0 },
        autolyse: null, fermentation: null,
        valid: false, errors,
    };
    if (errors.length > 0)
        return empty;
    // --- Core baker's math ---
    // totalFlour comes directly from the flour blend inputs (absolute grams)
    const totalFlour = input.flourBlend.reduce((sum, e) => sum + e.grams, 0);
    const totalWater = totalFlour * input.hydration / 100;
    const totalSalt = totalFlour * input.saltPct / 100;
    // --- Levain ---
    const levainResult = input.levain.mode === 'A'
        ? calcLevainModeA(input.levain, totalFlour)
        : calcLevainModeB(input.levain);
    const mainFlour = totalFlour - levainResult.flourInLevain;
    const mainWater = totalWater - levainResult.waterInLevain;
    // --- Per-flour breakdown ---
    // Levain flour is subtracted from its specific type only, not spread across all.
    const levainGrain = input.levain.flourGrain;
    const levainType = input.levain.flourType;
    const levainFlourInBlend = levainResult.flourInLevain;
    const perFlour = input.flourBlend.map(entry => {
        const isLevainFlour = entry.grain === levainGrain && entry.type === levainType;
        const mainFlourGrams = isLevainFlour
            ? Math.max(0, entry.grams - levainFlourInBlend)
            : entry.grams;
        return { grain: entry.grain, type: entry.type, flourGrams: entry.grams, mainFlourGrams };
    });
    // --- Autolyse / Bassinage ---
    const autolyse = input.autolyse.enabled ? calcAutolyse(mainWater, input.autolyse) : null;
    // --- Fermentation ---
    const fermentation = input.fermentation.enabled ? calcFermentation(input.fermentation) : null;
    return {
        targetWeight: totalFlour + totalWater + totalSalt,
        totalFlour,
        totalWater,
        totalSalt,
        mainFlour,
        mainWater,
        weightedHydrationHint,
        perFlour,
        levain: levainResult,
        autolyse,
        fermentation,
        valid: true,
        errors: [],
    };
}
