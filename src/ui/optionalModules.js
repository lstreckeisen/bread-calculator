import { getState, setState, subscribe } from '../state';
// StuckgareConfig used in buildStuckgare return type
function initCollapsible(section, toggleId, panelId) {
    const toggle = section.querySelector(`#${toggleId}`);
    const panel = section.querySelector(`#${panelId}`);
    function syncVisibility() {
        panel.style.display = toggle.checked ? 'grid' : 'none';
    }
    toggle.addEventListener('change', syncVisibility);
    syncVisibility();
    return panel;
}
export function initOptionalModules(section) {
    const state = getState();
    // --- Autolyse / Bassinage ---
    const autolyseToggle = section.querySelector('#autolyse-toggle');
    autolyseToggle.checked = state.autolyse.enabled;
    const autolysePanel = initCollapsible(section, 'autolyse-toggle', 'autolyse-panel');
    const autolyseWaterInput = autolysePanel.querySelector('#autolyse-water-pct');
    const bassinageWaterInput = autolysePanel.querySelector('#bassinage-water-pct');
    autolyseWaterInput.value = String(state.autolyse.autolyseWaterPct);
    bassinageWaterInput.value = String(state.autolyse.bassinageWaterPct);
    function updateAutolyse() {
        const cfg = {
            enabled: autolyseToggle.checked,
            autolyseWaterPct: parseFloat(autolyseWaterInput.value) || 0,
            bassinageWaterPct: parseFloat(bassinageWaterInput.value) || 0,
        };
        setState({ autolyse: cfg });
    }
    autolyseToggle.addEventListener('change', updateAutolyse);
    autolyseWaterInput.addEventListener('input', updateAutolyse);
    bassinageWaterInput.addEventListener('input', updateAutolyse);
    // --- Fermentation ---
    const fermentToggle = section.querySelector('#ferment-toggle');
    fermentToggle.checked = state.fermentation.enabled;
    const fermentPanel = initCollapsible(section, 'ferment-toggle', 'ferment-panel');
    const temperatureInput = fermentPanel.querySelector('#ferm-temperature');
    const refTempInput = fermentPanel.querySelector('#ferm-ref-temp');
    const refLevainInput = fermentPanel.querySelector('#ferm-ref-levain');
    const refTimeInput = fermentPanel.querySelector('#ferm-ref-time');
    const levainTargetToggle = fermentPanel.querySelector('#ferm-levain-target-toggle');
    const levainTargetPanel = fermentPanel.querySelector('#ferm-levain-target-panel');
    const targetHoursInput = fermentPanel.querySelector('#ferm-target-hours');
    const f = state.fermentation;
    temperatureInput.value = String(f.temperature);
    refTempInput.value = String(f.referenceTemp);
    refLevainInput.value = String(f.referenceLevainPct);
    refTimeInput.value = String(f.referenceTimeHours);
    levainTargetToggle.checked = f.levainTarget.enabled;
    levainTargetPanel.style.display = f.levainTarget.enabled ? 'contents' : 'none';
    targetHoursInput.value = String(f.levainTarget.targetHours);
    levainTargetToggle.addEventListener('change', () => {
        levainTargetPanel.style.display = levainTargetToggle.checked ? 'contents' : 'none';
        updateFermentation();
    });
    function updateFermentation() {
        const cfg = {
            enabled: fermentToggle.checked,
            temperature: parseFloat(temperatureInput.value) || 20,
            referenceTemp: parseFloat(refTempInput.value) || 20,
            referenceLevainPct: parseFloat(refLevainInput.value) || 20,
            referenceTimeHours: parseFloat(refTimeInput.value) || 4,
            levainTarget: {
                enabled: levainTargetToggle.checked,
                targetHours: parseFloat(targetHoursInput.value) || 4,
            },
            stuckgare: getState().fermentation.stuckgare,
        };
        setState({ fermentation: cfg });
    }
    fermentToggle.addEventListener('change', () => {
        updateFermentation();
        stuckgareSubmoduleEl.style.display = fermentToggle.checked ? 'block' : 'none';
    });
    temperatureInput.addEventListener('input', updateFermentation);
    refTempInput.addEventListener('input', updateFermentation);
    refLevainInput.addEventListener('input', updateFermentation);
    refTimeInput.addEventListener('input', updateFermentation);
    targetHoursInput.addEventListener('input', updateFermentation);
    // --- Stückgare ---
    const stuckgareSubmoduleEl = section.querySelector('#stuckgare-submodule');
    stuckgareSubmoduleEl.style.display = f.enabled ? 'block' : 'none';
    const stuckgareToggle = section.querySelector('#stuckgare-toggle');
    const stuckgarePanel = section.querySelector('#stuckgare-panel');
    const stuckTemperature = section.querySelector('#stuck-temperature');
    const stuckRefTemp = section.querySelector('#stuck-ref-temp');
    const stuckRefLevain = section.querySelector('#stuck-ref-levain');
    const stuckRefTime = section.querySelector('#stuck-ref-time');
    const stuckLevainTargetToggle = section.querySelector('#stuck-levain-target-toggle');
    const stuckLevainTargetPanel = section.querySelector('#stuck-levain-target-panel');
    const stuckTargetHours = section.querySelector('#stuck-target-hours');
    const stuckUsePieceWeight = section.querySelector('#stuck-use-piece-weight');
    const stuckRefPieceWeight = section.querySelector('#stuck-ref-piece-weight');
    const sg = f.stuckgare;
    stuckgareToggle.checked = sg.enabled;
    stuckgarePanel.style.display = sg.enabled ? 'grid' : 'none';
    stuckTemperature.value = String(sg.temperature);
    stuckRefTemp.value = String(sg.referenceTemp);
    stuckRefLevain.value = String(sg.referenceLevainPct);
    stuckRefTime.value = String(sg.referenceTimeHours);
    stuckLevainTargetToggle.checked = sg.levainTarget.enabled;
    stuckLevainTargetPanel.style.display = sg.levainTarget.enabled ? 'contents' : 'none';
    stuckTargetHours.value = String(sg.levainTarget.targetHours);
    stuckUsePieceWeight.checked = sg.usePieceWeight;
    stuckRefPieceWeight.value = String(sg.referencePieceWeightG);
    stuckLevainTargetToggle.addEventListener('change', () => {
        stuckLevainTargetPanel.style.display = stuckLevainTargetToggle.checked ? 'contents' : 'none';
        updateStuckgare();
    });
    function buildStuckgare() {
        return {
            enabled: stuckgareToggle.checked,
            temperature: parseFloat(stuckTemperature.value) || 20,
            referenceTemp: parseFloat(stuckRefTemp.value) || 20,
            referenceLevainPct: parseFloat(stuckRefLevain.value) || 20,
            referenceTimeHours: parseFloat(stuckRefTime.value) || 1.5,
            levainTarget: {
                enabled: stuckLevainTargetToggle.checked,
                targetHours: parseFloat(stuckTargetHours.value) || 2,
            },
            usePieceWeight: stuckUsePieceWeight.checked,
            referencePieceWeightG: parseFloat(stuckRefPieceWeight.value) || 800,
        };
    }
    function updateStuckgare() {
        const currentFerm = getState().fermentation;
        setState({ fermentation: { ...currentFerm, stuckgare: buildStuckgare() } });
    }
    stuckgareToggle.addEventListener('change', () => {
        stuckgarePanel.style.display = stuckgareToggle.checked ? 'grid' : 'none';
        updateStuckgare();
    });
    stuckTemperature.addEventListener('input', updateStuckgare);
    stuckRefTemp.addEventListener('input', updateStuckgare);
    stuckRefLevain.addEventListener('input', updateStuckgare);
    stuckRefTime.addEventListener('input', updateStuckgare);
    stuckTargetHours.addEventListener('input', updateStuckgare);
    stuckUsePieceWeight.addEventListener('change', updateStuckgare);
    stuckRefPieceWeight.addEventListener('input', updateStuckgare);
    // --- Honig ---
    const honeyToggle = section.querySelector('#honey-toggle');
    honeyToggle.checked = state.enrichments.honey.enabled;
    const honeyPanel = initCollapsible(section, 'honey-toggle', 'honey-panel');
    const honeyAmountInput = honeyPanel.querySelector('#honey-amount');
    const honeyUnitToggle = honeyPanel.querySelector('#honey-unit-toggle');
    let honeyUnitIsPct = false;
    honeyAmountInput.value = String(state.enrichments.honey.amountG);
    function getHoneyGrams() {
        const val = parseFloat(honeyAmountInput.value) || 0;
        if (honeyUnitIsPct) {
            const totalFlour = section.closest('.app')
                ? document.querySelectorAll('[id^="flour-grams-"]')
                : null;
            // Use the result's totalFlour via a subscribe approach — read from state proxy
            // For unit conversion we use a data attribute set by the results subscriber
            const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0;
            return totalFlourG > 0 ? (val / 100) * totalFlourG : 0;
        }
        return val;
    }
    honeyUnitToggle.addEventListener('click', () => {
        const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0;
        const currentGrams = getHoneyGrams();
        honeyUnitIsPct = !honeyUnitIsPct;
        honeyUnitToggle.textContent = honeyUnitIsPct ? '% Mehl' : 'g';
        if (totalFlourG > 0) {
            honeyAmountInput.value = honeyUnitIsPct
                ? String(Math.round(currentGrams / totalFlourG * 1000) / 10)
                : String(Math.round(currentGrams));
        }
    });
    function updateHoney() {
        const cfg = {
            ...getState().enrichments,
            honey: { enabled: honeyToggle.checked, amountG: getHoneyGrams() },
        };
        setState({ enrichments: cfg });
    }
    honeyToggle.addEventListener('change', updateHoney);
    honeyAmountInput.addEventListener('input', updateHoney);
    // --- Backmalz ---
    const maltToggle = section.querySelector('#malt-toggle');
    maltToggle.checked = state.enrichments.malt.enabled;
    const maltPanel = initCollapsible(section, 'malt-toggle', 'malt-panel');
    const maltAmountInput = maltPanel.querySelector('#malt-amount');
    const maltUnitToggle = maltPanel.querySelector('#malt-unit-toggle');
    const maltTypeInaktiv = maltPanel.querySelector('#malt-type-inaktiv');
    const maltTypeAktiv = maltPanel.querySelector('#malt-type-aktiv');
    const maltHintEl = maltPanel.querySelector('#malt-hint');
    let maltUnitIsPct = false;
    maltAmountInput.value = String(state.enrichments.malt.amountG);
    if (state.enrichments.malt.maltType === 'aktiv') {
        maltTypeAktiv.checked = true;
    }
    else {
        maltTypeInaktiv.checked = true;
    }
    function getMaltGrams() {
        const val = parseFloat(maltAmountInput.value) || 0;
        if (maltUnitIsPct) {
            const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0;
            return totalFlourG > 0 ? (val / 100) * totalFlourG : 0;
        }
        return val;
    }
    maltUnitToggle.addEventListener('click', () => {
        const totalFlourG = parseFloat(document.body.dataset['totalFlour'] ?? '0') || 0;
        const currentGrams = getMaltGrams();
        maltUnitIsPct = !maltUnitIsPct;
        maltUnitToggle.textContent = maltUnitIsPct ? '% Mehl' : 'g';
        if (totalFlourG > 0) {
            maltAmountInput.value = maltUnitIsPct
                ? String(Math.round(currentGrams / totalFlourG * 1000) / 10)
                : String(Math.round(currentGrams));
        }
    });
    function updateMalt() {
        const maltType = maltTypeAktiv.checked ? 'aktiv' : 'inaktiv';
        const cfg = {
            ...getState().enrichments,
            malt: { enabled: maltToggle.checked, amountG: getMaltGrams(), maltType },
        };
        setState({ enrichments: cfg });
    }
    maltToggle.addEventListener('change', updateMalt);
    maltAmountInput.addEventListener('input', updateMalt);
    maltTypeInaktiv.addEventListener('change', updateMalt);
    maltTypeAktiv.addEventListener('change', updateMalt);
    // Show/hide the active malt hint based on result
    subscribe((result) => {
        const show = result.enrichments?.activeMaltHint ?? false;
        maltHintEl.style.display = show ? 'block' : 'none';
    });
    // Expose totalFlour on body for unit toggle conversions
    subscribe((result) => {
        document.body.dataset['totalFlour'] = String(result.totalFlour);
    });
}
