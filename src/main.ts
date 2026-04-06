import './style.css'
import { notify } from './state'
import { initFlourBlend } from './ui/flourBlend'
import { initRecipeInputs } from './ui/recipe'
import { initLevain } from './ui/levain'
import { initInclusions } from './ui/inclusions'
import { initDoughSplit } from './ui/doughSplit'
import { initPreparations } from './ui/preparations'
import { initOptionalModules } from './ui/optionalModules'
import { initResults } from './ui/results'
import { initExportImport } from './ui/exportImport'
import { initExplainer } from './ui/explainer'

function init() {
  initFlourBlend(document.getElementById('section-flour')!)
  initRecipeInputs(document.getElementById('section-recipe')!)
  initLevain(document.getElementById('section-levain')!)
  initPreparations(document.getElementById('section-preparations')!)
  initDoughSplit(document.getElementById('section-dough-split')!)
  initInclusions(document.getElementById('section-inclusions')!)
  initOptionalModules(document.getElementById('section-optional')!)
  initResults(document.getElementById('results-section')!)
  initExportImport(document.getElementById('section-export')!)
  initExplainer(document.getElementById('section-explainer')!)

  // Fire initial render
  notify()
}

init()
