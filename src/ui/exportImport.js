import { getState } from '../state';
export function initExportImport(section) {
    const exportBtn = section.querySelector('#export-btn');
    const importInput = section.querySelector('#import-input');
    const importError = section.querySelector('#import-error');
    exportBtn.addEventListener('click', () => {
        const payload = { version: 7, input: getState() };
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'brot-rezept.json';
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
                // Temporarily persist to sessionStorage so the reload can pick it up
                sessionStorage.setItem('bread-import', JSON.stringify(parsed.input));
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
    return v['version'] === 7 && typeof v['input'] === 'object' && v['input'] !== null;
}
