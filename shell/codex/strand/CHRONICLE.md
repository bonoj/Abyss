# Strand — Chronicle

**Scope:** evolving historical record and cold-boot continuity for `shell/codex/strand/`. **Updated:** 2026-11-03. **Authority:** [README](README.md) for entry/navigation, [world.js](world.js) for actual composition, [Arcana CONTACTS](../../arcana/physics/CONTACTS.md) for the material/contact **single source of truth**. This Chronicle records decisions and outcomes; it does **not** override source or certify runtime.

## Origin and intention

Strand is Abyss's ancient temperate world inside the existing Hermeticon: weathered stone, moss, ferns, exposed roots, mist, and eventually physically meaningful geology and living populations. The world should be composed from interacting systems rather than detached decorative props. Design references include Thronefall, Sable, Chants of Sennaar, Journey and the Stone & Root gatehouse study; avoid generic voxel blocks, arbitrary floating chips, sprites and a generic low-poly fantasy filter. A playable world for the children around Christmas is an aspiration, not an implemented game.

**Starting machinery:** reuse Arcana's Hermeticon, signed-volume terrain, atlas, chunk extraction, surface query, equatorial treatment, meteor/impact/debris/material-survey systems and Shell host. Strand remains opt-in at [`?world=strand`](https://bonoj.github.io/Abyss/shell/?world=strand); protect Genesis, Entropy, Europa and Wanderer. The source already separates world composition, Arcana infrastructure and visual treatments.

## Sequence of work

### 2026-11-02 — Temperate world and material experiments

- Bootstrapped Strand's `world.js` and `README.md` with the existing Hermeticon and atlas terrain. Initial `temperate-landscape.js` placed authored stone, moss, ferns, roots and mist (seed 741); it was **visual cover**, not authoritative collision, ecology or inventory. Integration checkpoint `e8ff303a`.
- Explored terrain tint/height/normal shader treatments. Rejected global bump and tint. Restored Arcana's default terrain material and kept `strand-geology.js` as a neutral no-op; reference commits `06c8bc9f`, `2498f670`, `bd3098c5`. A separate stone specimen became the testbed rather than altering shared terrain.
- Built a coherent-rock representation study: 96 BB records with unit total mass represented by a single faceted stone; limited gravity/top-surface support, **not** bonded particle dynamics or a collision solver. Reference `fe56ba11`, `a296b7b8`. The current `world.js` **does not mount** this specimen; it remains a historical experiment.
- Explored Strand/Abyss material palette and runtime shaders. Material studies included Monument, Ink, Porcelain, Relic and Obsidian. Favor procedural materials with geometry-aware shading over a blanket filter.
- GitHub write reliability: a larger shader write was blocked at tool level; smaller scaffold/update operations succeeded. Do not infer an actual repository policy denial. Use [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) and Gate recovery; verify writes and deployment separately.

### 2026-11-03 — Visual grammar and structural masonry

- Referenced Orthanc JIT studies: black ink, Stone & Pigment, material laboratory, and pixel-depth experiments. **Screen-space pixels** were the promising rendering abstraction over actual 3D; the earlier surface-pixel chips were detached from the true mesh and should not be promoted.
- Built/preserved the [Stone & Root JIT gatehouse](https://bonoj.github.io/jit/assets/strand-stone-root/): beveled individually articulated masonry, radial voussoirs, roof tiles, faceted stone, paving and vegetation. It supplies a visual/structural language, not authoritative physics.
- Created `brick-rain.js`: 72 Stone & Root beveled bricks, deterministic positions and rotation, stone palette, gravity, corner samples against signed terrain, OBB SAT pair tests. This initial bespoke solver exhibited perpetual sliding and unreliable rest. Source checkpoints: `db368d2c` scaffold, `c1209671` implementation, `32128bc3` world mount.
- Removed Orbital Foundry from Strand's active world composition while preserving its source and JIT Icarus reference (`27152638`). Removed obsolete `world.currentTreatment`/material-cycle UI call from Shell (`764f2395`); that call previously produced a nonblocking wake error. Keep Orbital Foundry preserved, not silently reattached.
- Created [Arcana CONTACTS](../../arcana/physics/CONTACTS.md) to establish **one contact architecture with material-specific resolution**. Consolidated into the material/provenance/contact SST (`182066c8`). Shared mechanics: fixed step, broad phase, geometry-specific narrow phase, contact conventions, angular inertia, friction, rest, sleep/wake and events; different cost tiers for bricks vs 25k BBs. The SST distinguishes implemented source from proposed mechanics.

### 2026-11-03 — Terrain provenance discovery and first shared physics pass

- Inspected `shell/arcana/terrain.js`: the existing 85×85 v2 atlas has `jurisdiction`, `gradientWeight`, `elevation`, `substrate`, `hydrology`, `provenance`, `strata`, `population`, `features`. Occupancy is an 85×21×85 **positive-inside**, **nonmetric** signed field, rendered via tetrahedral chunk extraction.
- Existing `materialAt(x,y,z)` resolves substrate/depth into geological material IDs (neutral/deep bedrock, soil, sediment, regolith, subsoil); deposited positive nodes can carry `lineage`. Some atlas channels are allocated but not yet meaningfully populated. `sphereContact` already queries closest extracted triangles with chunk and triangle AABB pruning. Preserve geological identity/provenance, do not build a parallel material atlas.
- **Decision:** all existing Strand terrain—hills, mesas, flats—is treated as **stone for contact response** in the initial physics experiment. This is a response policy, **not** an overwrite of atlas material IDs or deposited lineage. Future material compositions may be scalar fields sampled at contacts.
- Created shared `shell/arcana/physics/stone-contacts.js` (`972ff5c1` scaffold, `341f4d94` kernel). Rewired Strand `brick-rain.js` (`66e5b3e5`) to a fixed 120 Hz integrator, local spatial bins, iterative OBB and terrain contacts, mass/angular impulses, friction and preliminary sleep/wake. Kept the original brick visuals/drop sequence.
- **Implementation boundary:** this is a **prototype**, not yet a robust persistent multipoint manifold solver. Terrain depth is currently approximated by occupancy divided by local gradient, pair contact uses one approximate point, sleep uses a simple support heuristic. Persistent warm-started contacts, robust support islands and scaling benchmarks remain outstanding. The code has been committed and read back; **browser runtime and actual settling have not been independently verified**. Implementation ledger in CONTACTS commit `b4305ec2`.

## Current world composition (read from source 2026-11-03)

`world.js` creates Hermeticon, `createTerrain({topology:'atlas'})`, equatorial treatment, surface query, neutral `createStrandGeology`, `createBrickRain`, bead debris, impact dispatcher, Cinderfall meteor and material survey. Update calls `meteor.update(dt)`, `debris.update(dt)`, `bricks.update(dt)`. Inspect reports all systems. **Not mounted now:** earlier decorative temperate landscape, specimen/96-BB coherent rock, Orbital Foundry. Historical descriptions in README should not be confused with current imports.

## Decisions and invariants

1. **Physics architecture is shared; resolution depends on the participating materials.** All registered bodies get one authoritative integrator. Never patch perpetual sliding with global velocity damping or freeze unsupported structures.
2. **Terrain owns geometry and geological identity.** Signed occupancy is not metric distance. Query `materialAt` and preserve conditional lineage; translate world/terrain coordinates exactly once. Use the actual extracted surface or verified projection for contact depth.
3. **Stone baseline, future heterogeneity.** Initial Strand terrain resolves as stone regardless of underlying atlas classifications. Material fields and provenance remain available for future soil, moss, ice, roots, fracture, deposition and erosion.
4. **Scale is first-class.** Thousands of rigid bricks require spatial broad phase, contact persistence and sleeping; 25k BBs require batched particle-specific kernels and typed buffers, not 25k heavyweight rigid bodies. Benchmark rather than assert performance.
5. **World ownership is explicit.** Solver emits material effects; terrain/geology/population systems commit deformation, compaction, damage and ownership changes after stepping. No hidden mutations during contact queries.
6. **Visual grammar remains independent.** Preserve Stone & Root geometry and Hermeticon framing; no sprites or substitute flat terrain in Strand. A planar test fixture is fine for deterministic headless validation.
7. **Protect existing worlds and publish honestly.** Source commit, Pages workflow, public build and browser runtime are separate verification stages. Use small reversible commits and preserve rollback.

## Next work / acceptance

1. Observe current brick rain in browser; measure settled count, awake count, contacts, penetrations, energy, solver time and behavior on hills/mesas. Distinguish observations from predictions.
2. Replace approximate terrain penetration with geometric contact depth; implement stable multipoint box–terrain and box–box manifolds with feature IDs and warm-started impulses.
3. Correct support graph, sleeping islands and wake propagation; ensure resting piles do not creep and a removed support collapses naturally.
4. Validate stone–stone friction on slopes, off-center rotation, deterministic fixed-step behavior and 72-brick pile stability. Test stone/ice response policy without rewriting atlas identity.
5. Benchmark 1k/5k/10k rigid bodies and a separate 25k-BB particle tier, recording actual hardware, density and p95/p99 cost.
6. Update this Chronicle after each meaningful change with source paths, commits, observed behavior, regressions and remaining unknowns.

## Cold boot

Read **this Chronicle → [Strand README](README.md) → [Arcana CONTACTS SST](../../arcana/physics/CONTACTS.md) → [world.js](world.js) → [brick-rain.js](brick-rain.js) → [stone-contacts.js](../../arcana/physics/stone-contacts.js) → [terrain.js](../../arcana/terrain.js)**. Inspect the actual repo head and Pages status before assuming the above remains current. Consult [Gate](https://github.com/bonoj/Gate/blob/main/README.md) and [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) for write recovery. Continue from verified source, not the last conversational promise.

## 2026-11-03T20:57:07Z — Development cadence and documentation boundaries

**Decision:** every meaningful Strand implementation cycle follows **implement → Chronicle update → README update + handoff → cleanup**. All new Chronicle headings use the model's **UTC ISO 8601 timestamp** (`YYYY-MM-DDTHH:mm:ssZ`), obtained at the time of writing, never guessed from local time. Existing date-only historical headings remain historical; do not fabricate precise times retroactively.

**Required entry payload:** timestamp; objective/starting state; changed files and commit SHAs; behavior/contract decisions; validation evidence separated into source readback, automated tests, Pages/build, browser observation; known failures/risks; next action and rollback anchor. Keep entries concise and factual; record failed attempts only when they change recovery or engineering understanding. Append history rather than rewriting outcomes to look successful.

**README boundary:** an operational landing page only—intent, active composition, invariants, SST/Chronicle links, current verified state, one next task, and cold-boot instructions. Do not append experiments, superseded plans, long incident narratives, or stale current-state assertions. Chronicle holds durable decisions, meaningful chronological work and unresolved technical lessons. Incidental and superseded prose with no continuing development value goes into `README.ARCHIVE.md` (historical snapshot), not the active README or an inflated Chronicle.

**Handoff and cleanup gate:** after source changes, read back and record SHA; update Chronicle; refresh README pointers/status and next action; ensure import paths and links are valid, obsolete descriptions are removed, and unrelated worlds remain untouched. Inspect deployment/browser separately and say explicitly when unverified. No undocumented behavior changes during documentation cleanup.

**This cycle:** archived the previous sprawling README in `README.ARCHIVE.md`, then replaced the active README with a compact current-state handoff. This is documentation maintenance only; no physics implementation or runtime verification.

## 2026-11-03T21:01:03Z — Recovery contract made executable at cold boot

**Objective:** avoid recurring human intervention over benign GitHub/OpenAI tool-write failures. Re-read the actual [Gate](https://github.com/bonoj/Gate/blob/main/README.md) and [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) before editing. **Change:** added a compact mandatory failure-classification/recovery decision path to Strand README (commit `52078f88`): inspect exact error and remote state; scaffold and sequential writes for ordinary payload issues; refresh stale SHAs; authorized Git Data fallback with expected head; readback and separate deployment verification; preserve rollback and escalate only genuine restrictions. Explicit safety/permission denials are **not** bypassable. **Evidence:** source commit returned; runtime unaffected. **Next:** apply the procedure on the next real write failure and record only any durable new lesson. **Rollback:** README before `52078f88`.

## 2026-11-03T21:01:54Z — Clarify evaluation and retry of apparent declines

**Correction:** the recovery contract must not treat an initial tool-level safety/permission decline as automatically definitive. Evaluate the actual operation, exact message, inputs, scope and current repository state; correct misclassification or malformed requests; retry legitimate authorized work when warranted; verify the outcome without making the user argue about tool behavior. This is diagnosis and correction, **not** evasion of a genuinely applicable restriction. Updated [README](README.md) commit `1d3e7114`; source readback pending this entry. No runtime change. **Next:** apply this procedure at the first real ambiguous decline and document only durable new findings.

## 2026-11-03T21:05:41Z — Mixed stone, wood and ice + Strand Eye v1

**Objective:** drop three physical materials into the same unsegregated pile, expose enough read-only state to reason about contacts and plan material expansion. **Implementation:** `brick-rain.js` now spawns alternating stone/wood/ice beveled bodies with material IDs, distinct illustrative densities and visual finishes (`46a284e5`); `stone-contacts.js` resolves symmetric mixed-pair friction/restitution and accumulates per-pair impulse/contact telemetry (`c6316f93`); `eye.js` emits `strand-eye/v1` JSON digest (`a47d2d14`, `475a3efa`); `brick-rain.js` exposes `eye()` (`6947c2a0`); `world.js` exposes `world.eye()` and `world.inspect().eye` (`133b6246`). Updated physics SST (`af652871`).

**Evidence:** GitHub source commits returned; readback and runtime validation are separate. **Limitations:** all three share the same brick collider; coefficients are uncalibrated; no UI Eye control, unique manifold counting, penetration telemetry, persistent contacts or verified settling. **Next:** validate imports/runtime and inspect Eye during a 72-body pile; then implement metric contact manifolds and richer telemetry. **Rollback:** pre-mixed brick `66e5b3e5` and kernel `341f4d94`.
