import { getState } from '../state';
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9\-_äöüÄÖÜ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
export function initExportImport(section) {
    const exportBtn = section.querySelector('#export-btn');
    const importInput = section.querySelector('#import-input');
    const importError = section.querySelector('#import-error');
    exportBtn.addEventListener('click', () => {
        const state = getState();
        const payload = { version: 8, input: state };
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const name = state.recipeName.trim();
        a.download = name ? sanitizeFilename(name) + '.bread.json' : 'brot-rezept.bread.json';
        a.click();
        URL.revokeObjectURL(url);
    });
    importInput.addEventListener('change', () => {
        const file = importInput.files?.[0];
        if (!file)
            return;
        importError.style.display = 'none';
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (!isRecipeExport(parsed)) {
                    throw new Error('Ungültiges Format.');
                }
                const migrated = migrateInput(parsed.input, parsed.version);
                sessionStorage.setItem('bread-import', JSON.stringify(migrated));
                window.location.reload();
            }
            catch (err) {
                importError.textContent = `Import fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`;
                importError.style.display = 'block';
            }
            finally {
                importInput.value = '';
            }
        };
        reader.readAsText(file);
    });
}
function isRecipeExport(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const v = value;
    return (v['version'] === 7 || v['version'] === 8) && typeof v['input'] === 'object' && v['input'] !== null;
}
function migrateInput(input, version) {
    if (version === 7) {
        // Add new fields with defaults
        input['recipeName'] ?? (input['recipeName'] = '');
        input['steps'] ?? (input['steps'] = []);
        // Remove obsolete fermentation reference fields
        const ferm = input['fermentation'];
        if (ferm) {
            delete ferm['referenceTemp'];
            delete ferm['referenceLevainPct'];
            delete ferm['referenceTimeHours'];
            const stuck = ferm['stuckgare'];
            if (stuck) {
                delete stuck['referenceTemp'];
                delete stuck['referenceLevainPct'];
                delete stuck['referenceTimeHours'];
                delete stuck['usePieceWeight'];
                delete stuck['referencePieceWeightG'];
            }
        }
        // Remove absorptionPct from Quellstück entries
        const preps = input['preparations'];
        const qs = preps?.['quellstueck'];
        const entries = qs?.['entries'];
        if (entries) {
            entries.forEach(e => delete e['absorptionPct']);
        }
    }
    return input;
}
