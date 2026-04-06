import { FLOUR_GRAINS, TYPES_BY_GRAIN } from '../../data/flours';
export function buildFlourSelects(grainId, typeId, defaultGrain, defaultType) {
    const grainSel = document.getElementById(grainId);
    const typeSel = document.getElementById(typeId);
    grainSel.innerHTML = '';
    FLOUR_GRAINS.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        if (g === defaultGrain)
            opt.selected = true;
        grainSel.appendChild(opt);
    });
    function populateTypes(grain, selected) {
        typeSel.innerHTML = '';
        TYPES_BY_GRAIN[grain].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            if (t === selected)
                opt.selected = true;
            typeSel.appendChild(opt);
        });
    }
    populateTypes(defaultGrain, defaultType);
    grainSel.addEventListener('change', () => {
        populateTypes(grainSel.value);
    });
    return { grainSel, typeSel };
}
