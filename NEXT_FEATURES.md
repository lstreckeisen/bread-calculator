# Next Features

## 1. Dough Split

Allow the baker to define how the finished dough is divided into individual loaves. The piece weight directly influences the Stückgare duration estimate (see Feature 2).

**Inputs:**
- Number of pieces (default: 1)
- Split mode:
  - **Equal** — all pieces the same size (total dough ÷ n)
  - **Custom** — individual target weights per piece (must sum to ≤ total dough weight; remainder shown as trim loss)

**Outputs:**
- Per-piece dough weight (pre-bake)
- Trim loss if applicable
- Piece weight fed into Stückgare estimation

---

## 2. Stockgare + Stückgare in Gärzeit-Rechner

Extend the fermentation calculator to cover both stages independently, shown sequentially in the UI.

**Stockgare (bulk fermentation)** — existing model unchanged.

**Stückgare (final proof):**
- Same Q10 model as Stockgare
- Separate temperature input (often lower, e.g. cold retard at 4°C)
- Piece weight from Dough Split influences the estimate: smaller pieces proof faster
- Reference point configured independently (defaults: 20°C / 1.5h at room temp, or 4°C / 12h for cold retard)

**UI:** Both stages shown as sequential blocks within the Gärzeit-Rechner, with a combined timeline (e.g. "Stockgare ~4 Std. + Stückgare ~1 Std. 30 Min.").

---

## 3. Kochstück & Quellstück

Optional pre-dough preparations that affect the water and ingredient balance. Both can be active simultaneously.

### Kochstück (scalded flour / tangzhong)
A portion of flour is cooked with water before mixing. Gelatinises starch, improves moisture retention and shelf life.

**Inputs:**
- Flour type (user selects one type from the defined grain/type list; deducted from that flour's entry in the main blend)
- Flour amount (g)
- Water amount (g) — user input; a sensible default is pre-filled (typical ratio ~1:4 to 1:5 flour:water)

**Calculation impact:**
- Kochstück flour is deducted from the selected flour type in the main dough
- Kochstück water is deducted from the main dough water (the cooked paste is added as a unit, so the water within it is already accounted for)
- Displayed as a separate preparation step before the main dough block in results

### Quellstück (soaker)
Seeds, grains, or dried fruit soaked in water before mixing. Prevents inclusions from drawing moisture from the crumb.

**Inputs:**
- Ingredient list: each entry has name (free text or preset) and amount (g)
- Water amount (g) — how much soaking water is used
- Absorption toggle (per entry or global): whether the soaking water is fully absorbed by the ingredients
  - Fully absorbed → water is deducted from main dough water
  - Partially / not absorbed → remaining water added back to main dough water (user specifies absorbed %)

**Calculation impact:**
- Absorbed soaking water is deducted from main dough water
- Results show Quellstück as a separate preparation step

---

## 4. Enrichments: Honig & Backmalz

Optional enrichment ingredients added to the main dough, expressed as g or % of total flour.

### Honig (Honey)
Adds sweetness; influences crust colour and fermentation at higher concentrations. Treated as a liquid ingredient added as-is — no separate water adjustment needed.

**Calculation impact:**
- Adds to total dough weight
- Shown as a line item in the main dough block

### Backmalz (Malt)
Improves fermentation activity (active/diastatic) and crust browning. Used in small quantities (typically 0.5–2% of flour).

**Inputs:**
- Amount (g or % of flour)
- Type: **aktiv** (diastatic, enzyme-active) vs. **inaktiv** (colour/flavour only, e.g. Röstmalz)

**Calculation impact:**
- Adds to total dough weight
- Shown as a line item in the main dough block
- When type is **aktiv** and Gärzeit-Rechner is enabled: a hint is displayed noting that active malt may shorten fermentation — the Q10 model does not account for this; the baker should observe and adjust their reference point accordingly

---

## 5. Seeds & Inclusions in Main Dough

Add seeds or other dry inclusions directly to the main dough (without a Quellstück). These contribute to total dough weight but generally do not affect the water balance unless opted in.

**Inputs:**
- Ingredient list: each entry has name (free text or presets: Sonnenblumenkerne, Leinsamen, Sesam, Kürbiskerne, Haferflocken, Walnüsse, …) and amount (g or % of flour)
- Optional per-entry: water absorption compensation — if enabled, the hydration hint adjusts upward to compensate for moisture absorbed by the inclusions

**Calculation impact:**
- Adds to total dough weight
- Shown as a line item in the main dough block
- Hydration hint adjusts if absorption compensation is active

---

## 6. Triebmittel-Modi: Hefe & Konvertierung

Leavening is extended from the current two sourdough modes (Direktzugabe, Levain-Aufbau) to a full set of modes. Switching between modes converts the existing values and lets the user adjust before confirming.

### Modes

| Mode | Description |
|---|---|
| Direktzugabe (Sauerteig) | Current Mode A — starter added directly |
| Levain-Aufbau (Sauerteig) | Current Mode B — separate levain build |
| Frischhefe | Commercial fresh yeast only |
| Trockenhefe | Commercial dry yeast only |
| Hybrid: Sauerteig + Hefe | Both levain and a small amount of commercial yeast |

### Conversion on mode switch

When the user switches mode, current values are converted to equivalent values in the new mode and pre-filled (editable before the recipe updates):

| From | To | Conversion rule |
|---|---|---|
| Direktzugabe / Levain-Aufbau | Frischhefe | Levain % of flour → g fresh yeast (rule of thumb: 10–15% levain ≈ 1–2% fresh yeast; adjustable) |
| Frischhefe | Trockenhefe | ÷ 3 |
| Trockenhefe | Frischhefe | × 3 |
| Hefe | Sauerteig | Inverse of above; user selects target levain % |

Conversion ratios are shown explicitly and editable so the baker can apply their own experience.

### Hybrid mode (Sauerteig + Hefe)

Both a levain and commercial yeast are active simultaneously. The mode has two orientations with different primary drivers:

**Hefe-primär** (yeast-driven, sourdough for taste):
- Yeast is the primary leavening agent — amount and fermentation time are calculated as in pure yeast mode
- Levain (Mode A or B) is added in a small quantity purely for flavour contribution
- Gärzeit-Rechner is driven by yeast; sourdough amount has no effect on the time estimate
- Hint shown: sourdough addition is for taste only — increase amount for more flavour, keeping in mind it will slightly accelerate fermentation

**Sauerteig-primär** (sourdough-driven, yeast for reliability):
- Levain is the primary leavening agent — Gärzeit-Rechner is driven by levain % as usual
- A small amount of commercial yeast is added to improve timing predictability
- Hint shown: yeast contribution is not modelled — actual fermentation will be faster than estimated; reduce levain % or lower temperature to compensate

In both orientations, all ingredients (levain + yeast) appear in the main dough block and contribute to total dough weight.
