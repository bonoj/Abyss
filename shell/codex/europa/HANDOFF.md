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
