import { getState } from '../state'
import type { RecipeExport, RecipeInput } from '../types'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_äöüÄÖÜ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function initExportImport(section: HTMLElement): void {
  const exportBtn = section.querySelector<HTMLButtonElement>('#export-btn')!
  const importInput = section.querySelector<HTMLInputElement>('#import-input')!
  const importError = section.querySelector<HTMLElement>('#import-error')!

  exportBtn.addEventListener('click', () => {
    const state = getState()
    const payload: RecipeExport = { version: 1, input: state }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = state.recipeName.trim()
    a.download = name ? sanitizeFilename(name) + '.bread.json' : 'brot-rezept.bread.json'
    a.click()
    URL.revokeObjectURL(url)
  })

  importInput.addEventListener('change', () => {
    const file = importInput.files?.[0]
    if (!file) return
    importError.style.display = 'none'

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(reader.result as string)
        if (!isRecipeExport(parsed)) {
          throw new Error('Ungültiges Format.')
        }
        const migrated = migrateInput(parsed.input as unknown as Record<string, unknown>, (parsed as { version: number }).version)
        sessionStorage.setItem('bread-import', JSON.stringify(migrated))
        window.location.reload()
      } catch (err) {
        importError.textContent = `Import fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
        importError.style.display = 'block'
      } finally {
        importInput.value = ''
      }
    }
    reader.readAsText(file)
  })
}

function isRecipeExport(value: unknown): value is RecipeExport {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return v['version'] === 1 && typeof v['input'] === 'object' && v['input'] !== null
}

function migrateInput(input: Record<string, unknown>, _version: number): RecipeInput {
  // Ensure new fields have defaults if missing (forward-compatibility)
  input['recipeName'] ??= ''
  input['steps'] ??= []
  return input as unknown as RecipeInput
}
