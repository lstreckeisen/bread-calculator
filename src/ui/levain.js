import { getState, getResult, setState } from '../state';
import { buildFlourSelects } from './util/flourSelect';
import { convertDryToFreshYeast, convertFreshToDryYeast, convertFreshYeastToLevainPct, convertLevainToFreshYeast, } from '../calc/levain';
// ─── Panel IDs ───────────────────────────────────────────────────────────────
const MODE_PANELS = {
    'sourdough-direct': 'levain-panel-a',
    'sourdough-build': 'levain-panel-b',
    'fresh-yeast': 'levain-panel-fresh',
    'dry-yeast': 'levain-panel-dry',
    'hybrid-yeast-primary': 'levain-panel-hybrid-yeast',
    'hybrid-sourdough-primary': 'levain-panel-hybrid-sd',
};
// ─── Helpers ─────────────────────────────────────────────────────────────────
function getSourdoughDirectCfg(section, selSuffix) {
    const hydration = section.querySelector(`#starter-hydration-${selSuffix}`);
    const pct = section.querySelector(`#levain-pct-${selSuffix}`);
    const grain = section.querySelector(`#levain-flour-grain-${selSuffix}`);
    const type = section.querySelector(`#levain-flour-type-${selSuffix}`);
    return {
        mode: 'sourdough-direct',
        starterHydration: parseFloat(hydration.value) || 50,
        levainPct: parseFloat(pct.value) || 20,
        flourGrain: grain.value,
        flourType: type.value,
    };
}
function getSourdoughBuildCfg(section, selSuffix) {
    const hydration = section.querySelector(`#starter-hydration-${selSuffix}`);
    const ag = section.querySelector(`#anstellgut-grams-${selSuffix}`);
    const flour = section.querySelector(`#levain-flour-grams-${selSuffix}`);
    const lHyd = section.querySelector(`#levain-hydration-${selSuffix}`);
    const grain = section.querySelector(`#levain-flour-grain-${selSuffix}`);
    const type = section.querySelector(`#levain-flour-type-${selSuffix}`);
    return {
        mode: 'sourdough-build',
        starterHydration: parseFloat(hydration.value) || 50,
        anstellgutGrams: parseFloat(ag.value) || 20,
        levainFlourGrams: parseFloat(flour.value) || 100,
        levainHydration: parseFloat(lHyd.value) || 100,
        flourGrain: grain.value,
        flourType: type.value,
    };
}
function getFreshYeastCfg(inputEl) {
    return { mode: 'fresh-yeast', yeastGrams: parseFloat(inputEl.value) || 0 };
}
function getDryYeastCfg(inputEl) {
    return { mode: 'dry-yeast', yeastGrams: parseFloat(inputEl.value) || 0 };
}
// ─── Main ────────────────────────────────────────────────────────────────────
export function initLevain(section) {
    const state = getState();
    const currentMode = state.levain.mode;
    // Mode buttons
    const modeButtons = {
        'sourdough-direct': section.querySelector('#levain-mode-sd-direct'),
        'sourdough-build': section.querySelector('#levain-mode-sd-build'),
        'fresh-yeast': section.querySelector('#levain-mode-fresh'),
        'dry-yeast': section.querySelector('#levain-mode-dry'),
        'hybrid-yeast-primary': section.querySelector('#levain-mode-hybrid-yeast'),
        'hybrid-sourdough-primary': section.querySelector('#levain-mode-hybrid-sd'),
    };
    // Flour selects for panel A (sourdough-direct)
    const initSdGrain = (currentMode === 'sourdough-direct') ? state.levain.flourGrain : 'Weizen';
    const initSdType = (currentMode === 'sourdough-direct') ? state.levain.flourType : 'Weissmehl';
    buildFlourSelects('levain-flour-grain-a', 'levain-flour-type-a', initSdGrain, initSdType);
    // Flour selects for panel B (sourdough-build)
    const initBGrain = (currentMode === 'sourdough-build') ? state.levain.flourGrain : 'Weizen';
    const initBType = (currentMode === 'sourdough-build') ? state.levain.flourType : 'Weissmehl';
    buildFlourSelects('levain-flour-grain-b', 'levain-flour-type-b', initBGrain, initBType);
    // Flour selects for hybrid panels
    const hybridSdCfg = (currentMode === 'hybrid-yeast-primary' || currentMode === 'hybrid-sourdough-primary')
        ? state.levain.levain
        : null;
    buildFlourSelects('levain-flour-grain-hy', 'levain-flour-type-hy', hybridSdCfg?.flourGrain ?? 'Weizen', hybridSdCfg?.flourType ?? 'Weissmehl');
    buildFlourSelects('levain-flour-grain-hsd', 'levain-flour-type-hsd', hybridSdCfg?.flourGrain ?? 'Weizen', hybridSdCfg?.flourType ?? 'Weissmehl');
    // Populate inputs from state
    if (currentMode === 'sourdough-direct') {
        section.querySelector('#starter-hydration-a').value = String(state.levain.starterHydration);
        section.querySelector('#levain-pct-a').value = String(state.levain.levainPct);
    }
    else if (currentMode === 'sourdough-build') {
        section.querySelector('#starter-hydration-b').value = String(state.levain.starterHydration);
        section.querySelector('#anstellgut-grams-b').value = String(state.levain.anstellgutGrams);
        section.querySelector('#levain-flour-grams-b').value = String(state.levain.levainFlourGrams);
        section.querySelector('#levain-hydration-b').value = String(state.levain.levainHydration);
    }
    else if (currentMode === 'fresh-yeast') {
        section.querySelector('#fresh-yeast-grams').value = String(state.levain.yeastGrams);
    }
    else if (currentMode === 'dry-yeast') {
        section.querySelector('#dry-yeast-grams').value = String(state.levain.yeastGrams);
    }
    function setMode(mode) {
        Object.entries(MODE_PANELS).forEach(([m, panelId]) => {
            const panel = section.querySelector(`#${panelId}`);
            if (panel)
                panel.style.display = m === mode ? 'grid' : 'none';
        });
        Object.entries(modeButtons).forEach(([m, btn]) => {
            btn.classList.toggle('active', m === mode);
        });
    }
    setMode(currentMode);
    // ── Live update helpers ───────────────────────────────────────────────────
    const freshYeastInput = section.querySelector('#fresh-yeast-grams');
    const dryYeastInput = section.querySelector('#dry-yeast-grams');
    const freshYeastHint = section.querySelector('#fresh-yeast-hint');
    const dryYeastHint = section.querySelector('#dry-yeast-hint');
    // Quick access for hyd buttons in panel B
    const hydQuick50B = section.querySelector('#hyd-quick-50');
    const hydQuick100B = section.querySelector('#hyd-quick-100');
    function buildCurrentCfg() {
        const m = Object.entries(modeButtons).find(([, btn]) => btn.classList.contains('active'))?.[0];
        switch (m ?? 'sourdough-direct') {
            case 'sourdough-direct': return getSourdoughDirectCfg(section, 'a');
            case 'sourdough-build': return getSourdoughBuildCfg(section, 'b');
            case 'fresh-yeast': return getFreshYeastCfg(freshYeastInput);
            case 'dry-yeast': return getDryYeastCfg(dryYeastInput);
            case 'hybrid-yeast-primary': {
                const hybridYeastSel = section.querySelector('#hybrid-yeast-type-yp');
                const hybridYeastGrams = section.querySelector('#hybrid-yeast-grams-yp');
                const yeast = hybridYeastSel.value === 'fresh-yeast'
                    ? { mode: 'fresh-yeast', yeastGrams: parseFloat(hybridYeastGrams.value) || 0 }
                    : { mode: 'dry-yeast', yeastGrams: parseFloat(hybridYeastGrams.value) || 0 };
                const sdModeSel = section.querySelector('#hybrid-sd-mode-yp');
                const levain = sdModeSel.value === 'sourdough-direct'
                    ? getSourdoughDirectCfg(section, 'hy')
                    : getSourdoughBuildCfg(section, 'hy');
                const cfg = { mode: 'hybrid-yeast-primary', yeast, levain };
                return cfg;
            }
            case 'hybrid-sourdough-primary': {
                const hybridSdYeastSel = section.querySelector('#hybrid-yeast-type-sdp');
                const hybridSdYeastGrams = section.querySelector('#hybrid-yeast-grams-sdp');
                const yeast = hybridSdYeastSel.value === 'fresh-yeast'
                    ? { mode: 'fresh-yeast', yeastGrams: parseFloat(hybridSdYeastGrams.value) || 0 }
                    : { mode: 'dry-yeast', yeastGrams: parseFloat(hybridSdYeastGrams.value) || 0 };
                const sdModeSelSdp = section.querySelector('#hybrid-sd-mode-sdp');
                const levain = sdModeSelSdp.value === 'sourdough-direct'
                    ? getSourdoughDirectCfg(section, 'hsd')
                    : getSourdoughBuildCfg(section, 'hsd');
                const cfg = { mode: 'hybrid-sourdough-primary', levain, yeast };
                return cfg;
            }
            default: return getSourdoughDirectCfg(section, 'a');
        }
    }
    function update() { setState({ levain: buildCurrentCfg() }); }
    // Attach listeners to all inputs in each panel
    section.querySelectorAll('[data-levain-input]').forEach(inp => {
        inp.addEventListener('input', update);
    });
    section.querySelectorAll('[data-levain-select]').forEach(sel => {
        sel.addEventListener('change', update);
    });
    if (hydQuick50B)
        hydQuick50B.addEventListener('click', () => { section.querySelector('#levain-hydration-b').value = '50'; update(); });
    if (hydQuick100B)
        hydQuick100B.addEventListener('click', () => { section.querySelector('#levain-hydration-b').value = '100'; update(); });
    function updateYeastHints() {
        const result = getResult();
        const totalFlour = result.totalFlour > 0 ? result.totalFlour : 500;
        const freshG = parseFloat(freshYeastInput.value) || 0;
        const dryG = parseFloat(dryYeastInput.value) || 0;
        if (freshYeastHint) {
            const pctEq = convertFreshYeastToLevainPct(freshG, totalFlour);
            freshYeastHint.textContent = freshG > 0 ? `≈ ${pctEq.toFixed(1)}% Levain-Äquivalent` : '';
        }
        if (dryYeastHint) {
            const freshEq = convertDryToFreshYeast(dryG);
            dryYeastHint.textContent = dryG > 0 ? `≈ ${freshEq.toFixed(1)} g Frischhefe` : '';
        }
    }
    freshYeastInput.addEventListener('input', updateYeastHints);
    dryYeastInput.addEventListener('input', updateYeastHints);
    // ── Mode switching with value conversion ──────────────────────────────────
    function switchMode(newMode) {
        const result = getResult();
        const totalFlour = result.totalFlour > 0 ? result.totalFlour : 500;
        const currentCfg = buildCurrentCfg();
        const currentActiveMode = currentCfg.mode;
        // Derive current levainPct for conversions
        let currentLevainPct = 20;
        if (currentActiveMode === 'sourdough-direct')
            currentLevainPct = currentCfg.levainPct;
        else if (currentActiveMode === 'sourdough-build')
            currentLevainPct = Math.round((currentCfg.levainFlourGrams / totalFlour) * 100 * 10) / 10;
        else if (currentActiveMode === 'fresh-yeast')
            currentLevainPct = convertFreshYeastToLevainPct(currentCfg.yeastGrams, totalFlour);
        else if (currentActiveMode === 'dry-yeast')
            currentLevainPct = convertFreshYeastToLevainPct(convertDryToFreshYeast(currentCfg.yeastGrams), totalFlour);
        let currentFreshYeastG = convertLevainToFreshYeast(currentLevainPct, totalFlour);
        if (currentActiveMode === 'fresh-yeast')
            currentFreshYeastG = currentCfg.yeastGrams;
        if (currentActiveMode === 'dry-yeast')
            currentFreshYeastG = convertDryToFreshYeast(currentCfg.yeastGrams);
        // Pre-fill destination panel
        if (newMode === 'sourdough-direct') {
            section.querySelector('#levain-pct-a').value = String(currentLevainPct);
        }
        else if (newMode === 'sourdough-build') {
            const levainFlourDefault = Math.round(totalFlour * currentLevainPct / 100);
            section.querySelector('#anstellgut-grams-b').value = String(Math.max(5, Math.round(levainFlourDefault / 10)));
            section.querySelector('#levain-flour-grams-b').value = String(levainFlourDefault);
        }
        else if (newMode === 'fresh-yeast') {
            freshYeastInput.value = String(currentFreshYeastG);
        }
        else if (newMode === 'dry-yeast') {
            dryYeastInput.value = String(convertFreshToDryYeast(currentFreshYeastG));
        }
        setMode(newMode);
        update();
        updateYeastHints();
    }
    Object.entries(modeButtons).forEach(([mode, btn]) => {
        btn.addEventListener('click', () => switchMode(mode));
    });
}
