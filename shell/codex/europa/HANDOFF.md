# EUROPA-01 — cold-boot handoff 🧊

Operational handoff for opt-in Europa in Abyss Shell. Read this before editing. Detailed expedition record: https://github.com/bonoj/Ledger/blob/main/notes/EUROPA_01.md

## Entry, scope, and source of truth

Cold boot: read [Abyss README](../../../README.md), [Shell HANDOFF](../../HANDOFF.md), this document, and the [EUROPA-01 Ledger](https://github.com/bonoj/Ledger/blob/main/notes/EUROPA_01.md). Read [Gate](https://github.com/bonoj/Gate/blob/main/README.md) for GitHub recovery and [Sanctum contract](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) for operational conduct. The relative links above are relative to this file in `shell/codex/europa/`; verify them rather than assuming. The Ledger is the expedition chronology and experimental evidence; this handoff is the actionable implementation map. Source and runtime observations outrank stale prose.

Repository `bonoj/Abyss`, branch `main`. Canonical browser entry: https://bonoj.github.io/Abyss/shell/?world=europa . The query selects Europa; without it, `shell/main.js` mounts **Entropy**, which must remain stable and independent. Do not modify Entropy to advance Europa. Source under `shell/codex/europa/`; reusable capabilities under `shell/arcana/`; host under `shell/athanor/`. No independent Europa runtime, no cloned Athanor, no Hermeticon source edits.

## Implementation map (inspected 2026-10-16)

- `world.js`: `createEuropa()`, Hermeticon vessel and atlas terrain, initial lattice inventory and material ledger, synthetic stratigraphy adapter, map/section/profile/site APIs, excavation, paired interrogation, compact inspector.
- `stratigraphy.js`: deterministic hypothetical geological history, four units, composition/provenance proxies, cross-section and map; default seed 741. `sample(x,y,z)` derives depth from terrain elevation. The lens is a synthetic ellipsoid centered near x=-3.1, z=2.2, depth=.75, with radii 2.4, 3.4, .34.
- `material-ledger.js`: independent conservation accounting for generic material IDs across `inPlace`, `recovered`, `dispersed`, `lost`, `introduced`. `inspect().residual` must be zero for every ID.
- `../../arcana/terrain.js`: `createTerrain({topology:'atlas'})`, `inventoryNodes()`, `extractNodes()`, `sample()`, local terrain chunk rebuild and `inspect()`.
- `../../main.js`: query selector, diagnostic globals, and opt-in mobile stratigraphy panel. No excavation at boot.
- `../../HANDOFF.md`: generic Shell deployment and isolation. Its older Europa paragraphs predate successful paired-core verification; **this document and Ledger supersede those stale claims**.

## Runtime and controls

Open `?world=europa`. The `▤` button opens the synthetic stratigraphy panel. `MAP / SECTION` switches views; tap the map to select x/z; `COMPARE SITES` compares hypothetical profiles without removing material. `EXTRACT TWO CORES` performs the one-shot paired destructive trial on a fresh world. The button is disabled after a successful run; the API also rejects a paired trial after any earlier extraction. To repeat, mount a fresh Europa scene.

Diagnostic globals on the Europa page:
```js
europaSectionJSON({x:0,columns:81,rows:42})
europaMapJSON({columns:81,rows:42,depth:.15})
europaProfileJSON(-3.1,2.2)
europaSiteJSON(-3.1,2.2)
europaCompareJSON([{x:-3.1,z:2.2},{x:5,z:-3}])
europaExtractJSON({x:0,z:0,radius:.8,yTop:3.6,yBottom:-3.6},.8)
europaInterrogateJSON() // fresh, unexcavated scene only
```
The mounted world's `inspect()` reports `experiment.terrain`, `materialAccounting`, `lastExtraction`, `pairedTrial`, and `stratigraphy`. Inspect via existing Athanor observation tooling; do not invent another inspector. `lastExtraction` is intentionally compact, while the explicit `extractTestCore` result includes parcels. Do not dump full parcel arrays into the recurring inspector.

## Material and scientific semantics

The terrain is a signed field. **Occupied positive lattice nodes** are the authoritative accounting unit. Counts are not calibrated kilograms, liters, drilled core length, or actual Europa composition. Generic render material IDs are not Europan chemical species. The four named units are hypothetical: `radiolytic-skin`, `reworked-ice`, `inherited-ice`, `transported-lens`. `soluteProxy`, `waterIce`, `endogenicProxy`, `exogenicProxy`, `alterationIndex`, `fracture`, and `transportedLens` are generated illustrative labels/proxies, not measurements. The test currently knows the synthetic hidden truth; a positive result is **not** independent scientific inference.

`extractTestCore` removes actual occupied nodes, tags each removed node with synthetic history, splits generic material counts by `Math.floor(count*recoveryFraction)`, and transfers those counts from in-place to recovered/dispersed. It returns all removed parcels, but **does not yet assign recovered/dispersed status to each individual parcel**. Paired `interrogateEuropa()` currently filters parcels with `i%5!==0` to create a *deterministic recovered-parcel proxy*; that proxy is explicitly **not** guaranteed to match the ledger's per-material recovered allocation. Preserve this distinction until repaired.

## Browser-confirmed checkpoint — 2026-10-16

User-provided browser inspector executed build `6f3cf58ffbf5e23fdb983a36286363f766cf4c73`, active visible Europa, no world error, FPS 67.14 at one observation (not a benchmark). The paired trial reported `discriminated=true` and `balanced=true`.

| Core | x,z | Removed | Unit breakdown | Recovered proxy lens | Mean solute proxy |
| --- | --- | ---: | --- | ---: | ---: |
| Transported-lens | -3.1, 2.2 | 35 | inherited 20; transported 10; radiolytic 5 | 8 | 0.0592357143 |
| Reference | 5, -3 | 49 | inherited 35; reworked 7; radiolytic 7; transported 0 | 0 | 0.0509865385 |

Both cores reported `ledgerBalanced=true`, `provenanceAccountingMatches=true`, and `inventoryMatchesTerrain=true`. Initial occupied nodes 52,833; removed 84; recovered 66; dispersed 18; remaining 52,749; residual zero. Terrain `solidCount=52749`, `voidCount=98976`, `localRebuilds=2`, last local rebuild ~6.4 ms. `edgeDetection.frames=0` in that observation: edge rendering was **not** independently verified. Map visibility/selection was also not independently confirmed by that inspector. Browser proof pertains to the executing SHA above; later commits need their own verification.

Relevant source commits: `61806f27` terrain counter correction; `9f88416c` surface-map extents; `6f3cf58f` compact paired trial in inspector. The canonical Ledger now includes the browser checkpoint (Ledger commit `0e68801716c95bd41a159adddb21bbef84ed5bdc`).

## Next frontier, in dependency order

1. **Exact parcel recovery allocation.** Deterministically assign each removed parcel `disposition: recovered|dispersed` by generic material ID, matching ledger `recovered` and `dispersed` totals *exactly*. Keep all removed parcels traceable. Compute recovered-only unit provenance, solute proxies, and ordered intervals from the actual recovered set, not a modulo-index filter. Preserve backwards compatibility for UI consumers or version the report schema.
2. **Depth ordering.** Sort by local depth below terrain surface, retain x/y/z and material ID, group into interpretable intervals, and report empty/partial intervals honestly. `world.europaProfile` currently samples fixed absolute y values `1.5-i*.125` and `europaSite.surface` uses y=1.15; make both surface-relative using the existing elevation adapter rather than a magic global top.
3. **Independent measurement layer.** Separate hidden synthetic truth from observable instrument channels. Introduce deterministic seeded noise, missing recovery, and contamination, with explicit uncertainty. Inference must not inspect `unit` or `provenance.transportedLens` as a shortcut. Validate blinded classification, false positives and negatives, and uncertainty.
4. **Survey geometry and UI.** Center section on selected site as appropriate, confirm map occupancy and click coordinates, preserve legible mobile controls. Existing section is fixed x with zStart/zEnd defaults, not an arbitrary centered 2D slice.
5. **Regression and performance.** Run tests against exact committed source; test conservation by material, terrain-vs-ledger inventory, per-parcel allocation, repeatability, non-overlapping cores, invalid fractions, no extraction at boot, and Entropy isolation. Measure mobile performance without inventing population caps.

## Delivery, rollback, and honesty

Follow Abyss README and `.github/workflows/pages.yml`. `shell/**` commits trigger Pages. Publisher bundles first-party Shell modules into immutable `assets/main.<SHA>.js`; `/Abyss/build.json` and `/Abyss/pages.json` identify the deployment commit. Distinguish: source written → committed → Actions completed → public bytes verified → executing browser SHA and behavior verified. The SHA in the runtime inspector must match the deployed build; a workflow success or cache-busting query alone is not browser proof. Read the actual workflow before asserting a publication status.

Keep edits scoped to Europa and genuinely reusable Arcana. Preserve Entropy as default and untouched. On breakage, restore the last verified working state first, investigate second. For GitHub failures, use Gate's classified, authorized small-write/Git Data recovery; never invent success or route around genuine authorization restrictions. The browser-confirmed `6f3cf58f` build is an experimental checkpoint, **not** necessarily the current head after this documentation commit.

## Cold-boot instruction

When told **“Go to Abyss Europa”**: read Abyss README → Shell HANDOFF → this document → Ledger EUROPA_01 → inspect actual current `world.js`, `stratigraphy.js`, `material-ledger.js`, `main.js`, relevant Arcana terrain, and publisher. Verify current main SHA and the public build identity. Resume the next uncompleted frontier without rebuilding the world or asking John to fetch files. Keep the scientific distinction between simulated ground truth and observation. Record material progress in Ledger and update this handoff when architecture, verified evidence, or frontier changes. Protect the play. 🧊


## Implementation continuation — 2026-10-16 (source committed, runtime pending)

Source commits: `76a09ad4` added pure `parcel-recovery.js`; `6e959e23` integrated it with `world.js`; `521a79d3` added pure allocation/interval regression tests. `extractTestCore` now assigns every removed parcel a deterministic `recovered|dispersed` disposition per generic material ID using exactly the ledger's `floor(n*recoveryFraction)` allocation. It records local synthetic depth and exposes `recoveredCore.ordered` and depth intervals. Paired interrogation now derives recovered-unit counts and mean solute proxy from these actually allocated parcels; report schema advances to `europa-paired-core-trial/v1`. `europaProfile` and `europaSite` now use the atlas elevation adapter rather than hard-coded absolute heights. The inspector includes compact recovered intervals, not full parcel arrays.

**Verification boundary:** GitHub commits are confirmed; exact-source test execution, Pages completion, and executing browser SHA are **not yet verified**. The older browser-confirmed `6f3cf58f` checkpoint remains the last observed baseline. Verify the new allocation test, ledger/stratigraphy tests, paired browser trial, Entropy isolation, and mobile performance before calling this live. Recovered parcels are selected deterministically by material and extraction order, not by a physical recovery model; depth intervals describe recovered nodes and do not imply continuous or calibrated cores.

**Next:** add rigorous end-to-end accounting checks and blinded observable measurement adapter; then validate map/section and mobile cards. Visual contract: pale faceted ice, colored BB inclusions, brass apparatus; all in-scene labels/data on summoned gold-rimmed navy Hermeticon cards. No slogans. See the latest `Ledger/notes/EUROPA_01.md` cold-boot entry for scientific limits and the complete plan.


### Browser witness — 2026-10-16, build `3b69d4de1469de5f255c5eb301644171724732d1`

User-supplied Athanor inspector confirms executing Europa world, active and visible, error null, 60.16 FPS at one observation (not a benchmark). Paired trial `europa-paired-core-trial/v1`: 35 target nodes and 49 reference nodes removed; 66 recovered, 18 dispersed, remaining 52,749; residual zero for all generic material IDs, `balanced=true`, provenance and terrain-inventory agreement true. Target recovered 28 (4 radiolytic, 8 transported-lens, 16 inherited); reference recovered 38 (5 radiolytic, 5 reworked, 28 inherited). `discriminated=true`. Depth-ordered recovered intervals appear in both trial reports; empty depth bands are not silently filled. Last extraction includes recovered intervals. Browser output verifies new code executed but not an independent audit of every individual parcel, exact-source automated tests, or scientific calibration. `edgeDetection.frames=0`, so edge rendering remains unverified. Next: separate investigator-visible observations from synthetic privileged provenance and test blinded nulls.


## Continuity checkpoint (2026-10-16)

The Ledger is EUROPA-01's working notebook. New Ledger observable-core instrument: `experiments/europa-01/observable-core.mjs` (`59c73514`); test source (`bc216be0`); notebook checkpoint (`40c23ad1`). Source was read back; test execution and Abyss integration remain pending. Next: run tests, blinded paired-core analysis with independent-noise and no-information controls, then integrate and verify the executing browser build.

Repeated regression: GitHub write attempts sometimes returned safety-check errors. Twice the assistant wrongly treated individual failures as proof that legitimate recovery was impossible, despite earlier ordinary retries succeeding. Successful recovery commits: `e2c9433e`, `bc216be0`, `40c23ad1`. The connector's underlying cause is not established. Diagnose and use permitted recovery without bypassing confirmed restrictions; read back successful writes. This failure consumed multiple user turns and violated the duty to protect the play. Governing documents: [Sanctum contract](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md), [Conjoiner Frontier](https://github.com/bonoj/Hermeticon/blob/main/codex/sieve/CONJOINER_FRONTIER.md), and [Gate](https://github.com/bonoj/Gate/blob/main/README.md).


## EUROPA-01 closing experiment — observable-core integration (2026-10-16)

Committed source: `shell/codex/europa/observable-core.js` is copied from Ledger's instrument; `world.js` invokes it after paired recovery and exposes `world.blindTrial()` and compact `experiment.blindTrial`. The mobile `EXTRACT TWO CORES` panel now displays the blind descriptive comparison rather than presenting privileged synthetic lens detection as scientific inference. The older `pairedTrial` remains for post-hoc synthetic truth scoring and conservation, **not** the measurement decision. Entropy remains the default world and is not edited.

**Local Node experiment:** Ledger observable-core test suite passed, including 100 independent-noise nulls (100 abstentions). A separate local 100-seed study reconstructed the browser-witnessed recovered generic material counts: target IDs 1:4,4:8,5:16; reference IDs 1:5,4:11,5:22. At `noiseSigma=.02`, `missingFraction=.1`, `contaminationFraction=.05`, threshold .05, the instrument abstained in all 100 contrast runs and all 100 independent-noise null runs. **Interpretation:** the arbitrary generic-material channel does not resolve this synthetic geological difference at the current threshold. This is a negative/indeterminate result, not evidence the histories are identical. The reconstruction uses observed aggregate material counts and synthetic parcel coordinates, not the actual browser parcel positions. It is not a browser witness or a calibrated geological experiment.

**Verification boundary:** source commits are confirmed; integration exact-source runtime tests, Pages completion, and executing browser SHA are not yet independently verified. The latest user browser witness before integration was `9158d472ced5376f565b439f501578eda0bc1381`. Preserve that as last browser-observed baseline. See Ledger `notes/EUROPA_01.md` for the working notebook and closing criteria. Do not claim EUROPA-01 browser-closed until the executing build and blind trial are observed.


## EUROPA-01 — final witnessed pause state (2026-10-16)

**STATUS: PAUSED / EXPEDITION COMPLETE.** Do not resume by default or reopen the instrument study merely to seek a positive result. Canonical browser entry: https://bonoj.github.io/Abyss/shell/?world=europa . Entropy remains the default when `?world=europa` is absent.

**Last browser-executing SHA (user-supplied Athanor inspector):** `d9bfea855467fd5fb7efcf15f0c4062d56a9c79e`, FPS snapshot `59.533322678599966`, Europa active/visible, `error:null`, 14 children. This is an actual executing-browser witness, not just a source commit. No subsequent Abyss runtime changes are recorded in this closing step.

**Paired physical-in-simulation extraction:** target at `(-3.1,2.2)` removed 35 nodes, recovered 28; reference at `(5,-3)` removed 49, recovered 38. Overall: 84 removed, 66 recovered, 18 dispersed, 52,749 still in terrain; every generic material-ID ledger residual zero; `balanced:true`, `inventoryMatchesTerrain:true`, `provenanceAccountingMatches:true`. Terrain grid `85×21×85`, 2 local rebuilds. Instantaneous FPS is not a benchmark.

**Truth-aware scoring, separate from inference:** synthetic target contains 8 recovered transported-lens nodes, reference contains none; the legacy `pairedTrial.discriminated:true` derives from privileged synthetic unit/provenance and MUST NOT be described as blind detection.

**Actual blind instrument result:** `experiment.blindTrial.schema=europa-blind-observation/v1`, `truthUsedForInference:false`, channel `GENERIC_MATERIAL_CONTRAST`, synthetic and uncalibrated. Target: 28 attempted, 26 observed, mean `0.4143712227648629` (seed 741). Reference: 38 attempted, 32 observed, mean `0.4376644556372652` (seed 742). Settings both: `noiseSigma=.02`, `missingFraction=.1`, `contaminationFraction=.05`; measured difference `-0.023293232872402314`; abstain threshold `0.05`; **decision: ABSTAIN**. The simulated geological histories differ, but this observable instrument cannot resolve the difference at its predefined threshold. No calibrated chemistry, no geological equivalence claim, no forced detection.

**Source and tests:** observable instrument in `shell/codex/europa/observable-core.js` matches Ledger `experiments/europa-01/observable-core.mjs`; integrated by `world.js` after recovered-parcel allocation; `main.js` displays the blind result. Ledger instrument tests passed locally; 100 independent-noise null comparisons all abstained. Browser confirms integrated blind report executes. Edge treatment remains outside this experiment: `edgeDetection.frames=0` in witness. Entropy isolation is source-scoped, not independently browser-tested by this witness.

**Scientific record:** https://github.com/bonoj/Ledger/blob/main/notes/EUROPA_01.md (closing browser witness committed as `c6c21a15b6abf7894065e38584ef6048436e9a34`). For recovery and working contracts: https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md ; https://github.com/bonoj/Gate/blob/main/README.md ; https://github.com/bonoj/Hermeticon/blob/main/codex/sieve/CONJOINER_FRONTIER.md .

**If returning:** read this handoff and the Ledger final record; verify executing SHA before modifying anything; preserve default Entropy and conservation; distinguish synthetic truth from observables. Start a *new, explicitly scoped* expedition rather than silently extending EUROPA-01. Deferred: actual drilling mechanics, BB sample transport/storage, richer geology, visual treatments. There is no outstanding EUROPA-01 work required to justify the pause.
