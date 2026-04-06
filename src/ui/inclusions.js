import { getState, setState } from '../state';
import { PRESET_INCLUSIONS } from '../data/inclusions';
function renderRow(entry, container) {
    const row = document.createElement('div');
    row.className = 'inclusion-row';
    // Name: free text input with datalist for presets
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input-text inclusion-name';
    nameInput.placeholder = 'Zutat';
    nameInput.value = entry.name;
    nameInput.setAttribute('list', 'inclusion-presets');
    nameInput.setAttribute('aria-label', 'Zutat');
    // Amount (grams)
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'input-number inclusion-amount';
    amountInput.min = '0';
    amountInput.max = '9999';
    amountInput.placeholder = 'g';
    amountInput.value = String(entry.amountG);
    amountInput.setAttribute('aria-label', 'Menge in Gramm');
    const gramsLabel = document.createElement('span');
    gramsLabel.className = 'unit-label';
    gramsLabel.textContent = 'g';
    // Absorption compensation checkbox
    const absLabel = document.createElement('label');
    absLabel.className = 'inclusion-abs-label';
    absLabel.title = 'Wasseraufnahme kompensieren';
    const absCheckbox = document.createElement('input');
    absCheckbox.type = 'checkbox';
    absCheckbox.className = 'inclusion-abs-check';
    absCheckbox.checked = entry.absorptionCompensation;
    absLabel.appendChild(absCheckbox);
    absLabel.append(' Wasseraufnahme');
    // Absorption percent input (shown only when checkbox is checked)
    const absPctInput = document.createElement('input');
    absPctInput.type = 'number';
    absPctInput.className = 'input-number inclusion-abs-pct';
    absPctInput.min = '0';
    absPctInput.max = '100';
    absPctInput.step = '5';
    absPctInput.value = String(entry.absorptionPct);
    absPctInput.setAttribute('aria-label', 'Wasseraufnahme %');
    absPctInput.style.display = entry.absorptionCompensation ? '' : 'none';
    const absPctLabel = document.createElement('span');
    absPctLabel.className = 'unit-label inclusion-abs-pct-label';
    absPctLabel.textContent = '%';
    absPctLabel.style.display = entry.absorptionCompensation ? '' : 'none';
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-icon remove-inclusion';
    removeBtn.setAttribute('aria-label', 'Zutat entfernen');
    removeBtn.textContent = '×';
    row.appendChild(nameInput);
    row.appendChild(amountInput);
    row.appendChild(gramsLabel);
    row.appendChild(absLabel);
    row.appendChild(absPctInput);
    row.appendChild(absPctLabel);
    row.appendChild(removeBtn);
    absCheckbox.addEventListener('change', () => {
        const show = absCheckbox.checked;
        absPctInput.style.display = show ? '' : 'none';
        absPctLabel.style.display = show ? '' : 'none';
        updateInclusions(container);
    });
    nameInput.addEventListener('input', () => updateInclusions(container));
    amountInput.addEventListener('input', () => updateInclusions(container));
    absPctInput.addEventListener('input', () => updateInclusions(container));
    removeBtn.addEventListener('click', () => {
        row.remove();
        updateInclusions(container);
    });
    return row;
}
function readInclusions(container) {
    return Array.from(container.querySelectorAll('.inclusion-row')).map(row => ({
        name: row.querySelector('.inclusion-name').value.trim(),
        amountG: parseFloat(row.querySelector('.inclusion-amount').value) || 0,
        absorptionCompensation: row.querySelector('.inclusion-abs-check').checked,
        absorptionPct: parseFloat(row.querySelector('.inclusion-abs-pct').value) || 30,
    }));
}
function updateInclusions(container) {
    const toggle = document.getElementById('inclusions-toggle');
    const cfg = {
        enabled: toggle?.checked ?? getState().inclusions.enabled,
        entries: readInclusions(container),
    };
    setState({ inclusions: cfg });
}
export function initInclusions(section) {
    const toggle = section.querySelector('#inclusions-toggle');
    const panel = section.querySelector('#inclusions-panel');
    const container = section.querySelector('#inclusions-rows');
    const addBtn = section.querySelector('#add-inclusion-btn');
    // Build preset datalist once
    if (!document.getElementById('inclusion-presets')) {
        const dl = document.createElement('datalist');
        dl.id = 'inclusion-presets';
        PRESET_INCLUSIONS.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            dl.appendChild(opt);
        });
        document.body.appendChild(dl);
    }
    const state = getState();
    toggle.checked = state.inclusions.enabled;
    panel.style.display = toggle.checked ? 'block' : 'none';
    state.inclusions.entries.forEach(entry => container.appendChild(renderRow(entry, container)));
    toggle.addEventListener('change', () => {
        panel.style.display = toggle.checked ? 'block' : 'none';
        updateInclusions(container);
    });
    addBtn.addEventListener('click', () => {
        const newEntry = {
            name: '',
            amountG: 0,
            absorptionCompensation: false,
            absorptionPct: 30,
        };
        container.appendChild(renderRow(newEntry, container));
        updateInclusions(container);
    });
}
