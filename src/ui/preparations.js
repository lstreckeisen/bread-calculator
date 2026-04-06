import { getState, setState } from '../state';
import { buildFlourSelects } from './util/flourSelect';
// ─── Quellstück dynamic list ─────────────────────────────────────────────────
function renderQuellstueckRow(entry, container) {
    const row = document.createElement('div');
    row.className = 'qs-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input-text qs-name';
    nameInput.placeholder = 'Zutat';
    nameInput.value = entry.name;
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'input-number qs-amount';
    amountInput.min = '1';
    amountInput.max = '9999';
    amountInput.placeholder = 'g';
    amountInput.value = String(entry.grams);
    const amtLabel = document.createElement('span');
    amtLabel.className = 'unit-label';
    amtLabel.textContent = 'g';
    const absLabel = document.createElement('label');
    absLabel.className = 'qs-abs-label';
    const absInput = document.createElement('input');
    absInput.type = 'number';
    absInput.className = 'input-number qs-abs-pct';
    absInput.min = '0';
    absInput.max = '100';
    absInput.step = '10';
    absInput.value = String(entry.absorptionPct);
    const absUnit = document.createElement('span');
    absUnit.className = 'unit-label';
    absUnit.textContent = '% absorbiert';
    absLabel.appendChild(absInput);
    absLabel.appendChild(absUnit);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-icon remove-qs';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', 'Zutat entfernen');
    row.appendChild(nameInput);
    row.appendChild(amountInput);
    row.appendChild(amtLabel);
    row.appendChild(absLabel);
    row.appendChild(removeBtn);
    const update = () => updatePreparations(container);
    nameInput.addEventListener('input', update);
    amountInput.addEventListener('input', update);
    absInput.addEventListener('input', update);
    removeBtn.addEventListener('click', () => { row.remove(); updatePreparations(container); });
    return row;
}
function readQuellstueckRows(container) {
    return Array.from(container.querySelectorAll('.qs-row')).map(row => ({
        name: row.querySelector('.qs-name').value.trim(),
        grams: parseFloat(row.querySelector('.qs-amount').value) || 0,
        absorptionPct: parseFloat(row.querySelector('.qs-abs-pct').value) || 0,
    }));
}
function setAllAbsorption(container, pct) {
    container.querySelectorAll('.qs-abs-pct').forEach(inp => {
        inp.value = String(pct);
    });
}
// ─── Main update ─────────────────────────────────────────────────────────────
function updatePreparations(qsRowsContainer) {
    const state = getState();
    const ksToggle = document.getElementById('kochstueck-toggle');
    const ksFlourGrain = document.getElementById('kochstueck-flour-grain').value;
    const ksFlourType = document.getElementById('kochstueck-flour-type').value;
    const ksFlourGrams = parseFloat(document.getElementById('kochstueck-flour-grams').value) || 0;
    const ksWaterGrams = parseFloat(document.getElementById('kochstueck-water-grams').value) || 0;
    const qsToggle = document.getElementById('quellstueck-toggle');
    const qsWater = parseFloat(document.getElementById('quellstueck-water').value) || 0;
    const kochstueck = {
        enabled: ksToggle?.checked ?? state.preparations.kochstueck.enabled,
        flourGrain: ksFlourGrain,
        flourType: ksFlourType,
        flourGrams: ksFlourGrams,
        waterGrams: ksWaterGrams,
    };
    const quellstueck = {
        enabled: qsToggle?.checked ?? state.preparations.quellstueck.enabled,
        entries: readQuellstueckRows(qsRowsContainer),
        soakingWaterGrams: qsWater,
    };
    const cfg = { kochstueck, quellstueck };
    setState({ preparations: cfg });
}
// ─── Init ─────────────────────────────────────────────────────────────────────
export function initPreparations(section) {
    const state = getState();
    // --- Kochstück ---
    const ksToggle = section.querySelector('#kochstueck-toggle');
    const ksPanel = section.querySelector('#kochstueck-panel');
    const ksFlourGramsInput = section.querySelector('#kochstueck-flour-grams');
    const ksWaterGramsInput = section.querySelector('#kochstueck-water-grams');
    const ks = state.preparations.kochstueck;
    ksToggle.checked = ks.enabled;
    ksPanel.style.display = ks.enabled ? 'block' : 'none';
    ksFlourGramsInput.value = String(ks.flourGrams);
    ksWaterGramsInput.value = String(ks.waterGrams);
    const { grainSel: ksGrainSel } = buildFlourSelects('kochstueck-flour-grain', 'kochstueck-flour-type', ks.flourGrain, ks.flourType);
    ksToggle.addEventListener('change', () => {
        ksPanel.style.display = ksToggle.checked ? 'block' : 'none';
        // Auto-fill water = 4× flour on first enable
        if (ksToggle.checked && parseFloat(ksWaterGramsInput.value) === 0) {
            ksWaterGramsInput.value = String((parseFloat(ksFlourGramsInput.value) || 50) * 4);
        }
        updatePreparations(qsRowsContainer);
    });
    const ksUpdate = () => updatePreparations(qsRowsContainer);
    ksFlourGramsInput.addEventListener('input', ksUpdate);
    ksWaterGramsInput.addEventListener('input', ksUpdate);
    ksGrainSel.addEventListener('change', ksUpdate);
    section.querySelector('#kochstueck-flour-type').addEventListener('change', ksUpdate);
    // --- Quellstück ---
    const qsToggle = section.querySelector('#quellstueck-toggle');
    const qsPanel = section.querySelector('#quellstueck-panel');
    const qsRowsContainer = section.querySelector('#quellstueck-rows');
    const addQsBtn = section.querySelector('#add-quellstueck-btn');
    const qsWaterInput = section.querySelector('#quellstueck-water');
    const absorbAllBtn = section.querySelector('#quellstueck-absorb-all');
    const absorbNoneBtn = section.querySelector('#quellstueck-absorb-none');
    const qs = state.preparations.quellstueck;
    qsToggle.checked = qs.enabled;
    qsPanel.style.display = qs.enabled ? 'block' : 'none';
    qsWaterInput.value = String(qs.soakingWaterGrams);
    qs.entries.forEach(entry => qsRowsContainer.appendChild(renderQuellstueckRow(entry, qsRowsContainer)));
    qsToggle.addEventListener('change', () => {
        qsPanel.style.display = qsToggle.checked ? 'block' : 'none';
        updatePreparations(qsRowsContainer);
    });
    qsWaterInput.addEventListener('input', () => updatePreparations(qsRowsContainer));
    addQsBtn.addEventListener('click', () => {
        const newEntry = { name: '', grams: 0, absorptionPct: 100 };
        qsRowsContainer.appendChild(renderQuellstueckRow(newEntry, qsRowsContainer));
        updatePreparations(qsRowsContainer);
    });
    absorbAllBtn.addEventListener('click', () => {
        setAllAbsorption(qsRowsContainer, 100);
        updatePreparations(qsRowsContainer);
    });
    absorbNoneBtn.addEventListener('click', () => {
        setAllAbsorption(qsRowsContainer, 0);
        updatePreparations(qsRowsContainer);
    });
}
