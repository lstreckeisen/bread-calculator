import { getState, setState } from '../state';
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
    const directionTime = fermentPanel.querySelector('#direction-time');
    const directionLevain = fermentPanel.querySelector('#direction-levain');
    const inputGroupTime = fermentPanel.querySelector('#input-group-time');
    const inputGroupLevain = fermentPanel.querySelector('#input-group-levain');
    const levainPctInput = fermentPanel.querySelector('#ferm-levain-pct');
    const targetHoursInput = fermentPanel.querySelector('#ferm-target-hours');
    const temperatureInput = fermentPanel.querySelector('#ferm-temperature');
    const refTempInput = fermentPanel.querySelector('#ferm-ref-temp');
    const refLevainInput = fermentPanel.querySelector('#ferm-ref-levain');
    const refTimeInput = fermentPanel.querySelector('#ferm-ref-time');
    const f = state.fermentation;
    directionTime.checked = f.direction === 'timeFromLevain';
    directionLevain.checked = f.direction === 'levainFromTime';
    levainPctInput.value = String(f.levainPct);
    targetHoursInput.value = String(f.targetHours);
    temperatureInput.value = String(f.temperature);
    refTempInput.value = String(f.referenceTemp);
    refLevainInput.value = String(f.referenceLevainPct);
    refTimeInput.value = String(f.referenceTimeHours);
    function syncDirectionGroups() {
        if (directionTime.checked) {
            inputGroupTime.style.display = 'contents';
            inputGroupLevain.style.display = 'none';
        }
        else {
            inputGroupTime.style.display = 'none';
            inputGroupLevain.style.display = 'contents';
        }
    }
    syncDirectionGroups();
    directionTime.addEventListener('change', () => { syncDirectionGroups(); updateFermentation(); });
    directionLevain.addEventListener('change', () => { syncDirectionGroups(); updateFermentation(); });
    function updateFermentation() {
        const cfg = {
            enabled: fermentToggle.checked,
            direction: directionTime.checked ? 'timeFromLevain' : 'levainFromTime',
            levainPct: parseFloat(levainPctInput.value) || 20,
            targetHours: parseFloat(targetHoursInput.value) || 4,
            temperature: parseFloat(temperatureInput.value) || 20,
            referenceTemp: parseFloat(refTempInput.value) || 20,
            referenceLevainPct: parseFloat(refLevainInput.value) || 20,
            referenceTimeHours: parseFloat(refTimeInput.value) || 4,
        };
        setState({ fermentation: cfg });
    }
    fermentToggle.addEventListener('change', updateFermentation);
    levainPctInput.addEventListener('input', updateFermentation);
    targetHoursInput.addEventListener('input', updateFermentation);
    temperatureInput.addEventListener('input', updateFermentation);
    refTempInput.addEventListener('input', updateFermentation);
    refLevainInput.addEventListener('input', updateFermentation);
    refTimeInput.addEventListener('input', updateFermentation);
}
