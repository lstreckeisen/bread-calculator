export function calcAutolyse(mainWater, cfg) {
    const autolysisWater = mainWater * cfg.autolyseWaterPct / 100;
    const bassinageWater = mainWater * cfg.bassinageWaterPct / 100;
    const initialWater = mainWater - autolysisWater - bassinageWater;
    return { autolysisWater, bassinageWater, initialWater };
}
