import './style.css'
import { notify } from './state'
import { initFlourBlend } from './ui/flourBlend'
import { initRecipeInputs } from './ui/recipe'
import { initLevain } from './ui/levain'
import { initOptionalModules } from './ui/optionalModules'
import { initResults } from './ui/results'
import { initExportImport } from './ui/exportImport'
import { initExplainer } from './ui/explainer'

function init() {
  initFlourBlend(document.getElementById('section-flour')!)
  initRecipeInputs(document.getElementById('section-recipe')!)
  initLevain(document.getElementById('section-levain')!)
  initOptionalModules(document.getElementById('section-optional')!)
  initResults(document.getElementById('results-section')!)
  initExportImport(document.getElementById('section-export')!)
  initExplainer(document.getElementById('section-explainer')!)

  // Fire initial render
  notify()
}

init()
