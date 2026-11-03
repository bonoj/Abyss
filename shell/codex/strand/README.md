# Strand — temperate emergence

**Run:** [Strand in Shell](https://bonoj.github.io/Abyss/shell/?world=strand) · **Composition:** [world.js](world.js) · **Chronicle:** [CHRONICLE.md](CHRONICLE.md) · **Physics/material SST:** [Arcana CONTACTS](../../arcana/physics/CONTACTS.md) · **Archived historical notes:** [README.ARCHIVE.md](README.ARCHIVE.md)

**Parent entrypoints:** [Abyss README](../../../README.md) · [Shell HANDOFF](../../HANDOFF.md) · [Gate](https://github.com/bonoj/Gate/blob/main/README.md) / [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md).

## Intent and invariants

Ancient temperate world inside the existing Hermeticon: credible weathered geology, masonry, material, roots, vegetation and atmosphere, composed as interacting systems rather than disconnected decoration.

- Reuse Arcana's vessel, authoritative `createTerrain({topology:'atlas'})`, signed occupancy, geological material/provenance lookup and terrain mutations. Positive occupancy is **not** metric distance.
- All existing Strand terrain responds as **stone** for initial collisions without rewriting geological substrate IDs, strata or deposited lineage. The [CONTACTS SST](../../arcana/physics/CONTACTS.md) owns all shared physics/material rules.
- Preserve existing meteor, debris, impact, survey and equatorial-edge behavior. Protect Genesis, Entropy, Europa and Wanderer; Strand remains opt-in.
- Preserve Stone & Root beveled collider geometry; stone, wood and ice currently share that shape with distinct finishes and illustrative response coefficients. Physics owns body state; rendering is a view. Avoid O(N²) collision scans and heavyweight per-BB solvers.
- Separate source commits, test results, Pages publication, and actual browser verification. Do not claim settling or performance without measurements.

## Current composition (source read 2026-11-03)

`world.js` mounts Hermeticon, atlas terrain, equatorial treatment, neutral `strand-geology.js`, `brick-rain.js`, bead debris, impact dispatcher, Cinderfall and material survey. `world.update(dt)` advances meteor, debris and bricks. Earlier `temperate-landscape.js`, isolated material specimen and Orbital Foundry are historical/unmounted experiments, not current runtime features.

`brick-rain.js` drops **stone, wood and ice together** using [`stone-contacts.js`](../../arcana/physics/stone-contacts.js): fixed 120 Hz steps, local spatial bins, material-pair friction/restitution, iterative terrain/body impulses and preliminary sleep/wake. [Strand Eye](eye.js) exposes a read-only `strand-eye/v1` JSON snapshot through `world.eye()` and `world.inspect().eye` (material counts, motion, energy, cumulative pair impulses). **Human-supplied live inspect on build `0fd58f5a`: 72 bodies, 65 awake after 2,087 steps (~17.4 simulated seconds), 79.1 reported FPS, 1.13M cumulative impulse calls; stable resting piles are not demonstrated.** Second human-supplied live inspect on build `12e78d34` verified interface counters: 393,545 terrain/body vs 93,294 body/body impulse applications at 1,442 steps (63 bodies spawned, 62 awake). Build `c9e36744` verified `eye.lastStep` and timing: at 3,477 steps, 57 awake, energy 0.05339, 1,072 impulse applications/step, 3.3ms last step. Build `f04c0531` verified sleeping-support runtime: at 4,149 steps, 29 sleeping, 43 awake, 722 contact applications/step, last/peak physics 2.3/6.0ms, and zero wakes in that single step. Build `74b7bdb3` verified cumulative impact waking: 41 sleep transitions, 9 impact wakes, 32 sleeping, consistent accounting at 3,469 steps. The targeted meteor source now supports ☄️ arm → terrain/object tap → vertical first-hit descent → queued material-aware rigid blast, while retaining existing local terrain crater behavior; **targeted casting is not yet browser-verified**. The implementation is not yet the persistent multipoint manifold solver described in CONTACTS.

## Targeted meteor — current source state

Strand ☄️ is an armed tool (tap again or Escape to disarm); a valid tap raycasts against bricks and terrain, then resolves the first vertical collision. Explicit Cinderfall targets preserve legacy casts elsewhere. On impact, brick-rain queues a finite-radius softened blast for the next fixed physics step (core .9, radius 3.2); first-hit receives downward impulse, nearby bodies radial impulses, all mass/inertia-aware. Existing `terrain.impact()` remains local and receives provisional material-dependent scalar ground coupling. `eye.blast` exposes event counts/last response. **Source-only, not yet runtime-verified**; moving-target collision recheck, support island propagation and calibrated impulse accounting remain open. No terrain fragments.

## Development cadence (mandatory)

**Implement → Chronicle update → README update + handoff → cleanup.**

1. **Implement:** inspect source/contracts, make a reversible change, read back commits and validate what can actually be tested.
2. **Chronicle:** append a heading with the **actual UTC ISO 8601 timestamp** (`YYYY-MM-DDTHH:mm:ssZ`); record objective, changes/SHAs, evidence, risks, next action and rollback. Never invent timestamps for old entries.
3. **README + handoff:** update only current composition, verified status, links, and the next actionable task. Keep this README compact.
4. **Cleanup:** remove stale current-state assertions and redundant prose; archive incidental/superseded material in [README.ARCHIVE.md](README.ARCHIVE.md), not Chronicle. Verify links, imports and no unintended world changes.

## Mandatory write-failure recovery — read before escalating

**Authority:** [Gate's failure recovery and publication rules](https://github.com/bonoj/Gate/blob/main/README.md) and the [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md). **A tool error is not proof of a GitHub refusal, an OpenAI safety denial, or a failed task.** Do not make the human diagnose routine failures, supply shell commands, reauthorize already authorized work, or restate this procedure.

1. **Classify from actual evidence.** Read the complete error and current remote file/branch state. Distinguish invalid arguments, missing file, stale blob SHA / concurrent edit, large payload / transport, rate limit, transient service failure, repository permission, and **explicit policy/safety restriction**. Treat an apparent decline as a diagnostic signal, not automatically a final classification: inspect its actual scope, requested operation, and whether a corrected authorized attempt is possible. Do not guess the cause from a generic failure message.
2. **Recover ordinary failures autonomously.** Refresh remote SHA and reconcile edits; create a **minimal valid scaffold for new files**, then populate with small **sequential** updates and readback; repair malformed inputs; retry transient failures judiciously. Never hammer the same failing payload.
3. **Use the established authorized fallback.** For Contents API transport/payload/tool failures, Gate permits Git Data **blob → tree → commit → ref with expected head**, when available and authorized. Verify the expected head to avoid overwriting concurrent changes. This is an alternate legitimate GitHub write API, **not** a workaround for an actual safety or authorization denial.
4. **Honor real boundaries.** Evaluate any apparent safety/policy/permission decline against the **actual requested operation** and exact error. Correct misclassified inputs, stale state, or an incorrectly framed call, then retry an authorized operation when warranted—without debating the user or assuming the first decline is definitive. Do not disguise or evade a restriction that remains clearly applicable after evaluation. Only then report the precise restriction if it prevents further authorized work.
5. **Verify and continue.** Read back the committed file and SHA, inspect the deployment workflow and public bytes separately when publishing, then continue at the **first incomplete step**. A commit is not a verified runtime. If permitted recovery routes are exhausted, report exactly what failed and what remains, without declaring the whole project impossible.
6. **Protect the work.** Keep a rollback baseline; on breakage restore first, investigate second. Stay scoped to Strand and preserve other worlds. Record only durable lessons in the UTC Chronicle, not a new procedural bureaucracy.

**Operating rule:** investigate → classify → correct → retry → verify. Do this autonomously and without arguing with the user. An initial decline is evidence to examine, not a verdict to repeat. Escalate only a verified applicable boundary, exhausted authorized recovery, or an essential decision. The machinery protects the play.

## Live excavation witness — 2026-11-03

Human-witnessed Android browser run of Strand build `2a064207`: five visual views document overlapping excavations, a populated thin upper crust, undercuts, hanging terrain columns, and the visible underbelly. Second Eye records **466 meteor blasts**, **455 local terrain rebuilds** (one full rebuild), 72 mixed-material bodies, and 29,479 fixed steps (~245.66 simulated seconds). The human particularly values **wood, ice and stone dropping long after they settled** when excavation removes their support. Large negative Y/speed readings reflect bodies falling without an implemented Hermeticon underbelly capture boundary; they do not alone establish a physics defect. Preserve working excavation and delayed motion. Full screenshots interpretation, measured telemetry, limits and prior 123-blast comparison: [Chronicle](CHRONICLE.md), entry “Strand after 466 meteors”. No code changes in this evidence capture.

## Moss prototype rollback — 2026-11-03

The initial moss attempt was rejected: it created two unrelated static blocks with growing green circular decals and cone shoots, rather than living moss attached to existing physical stone and wood. **All prototype runtime code has been removed**: `world.js` restored to pre-moss blob `3c76d1ea`, `moss.js` deleted, and the temporary `arcana/population-retina.js` shim deleted. The shifted 72-body masonry remains intact. The detailed design spec is retained in [Chronicle](CHRONICLE.md), along with the explicit rejected visual approach. No replacement experiment is currently mounted. Do not reintroduce green discs or spiky cones, or claim that a new universal aperture has been implemented. Browser verification of rollback remains outstanding.

## Material reference — Orthanc laboratory (recovery path)

**Canonical source:** [JIT / assets / orthanc-ink / material-lab.html](https://github.com/bonoj/bonoj.github.io/blob/master/jit/assets/orthanc-ink/material-lab.html) (`bonoj/bonoj.github.io`, branch `master`, path `jit/assets/orthanc-ink/material-lab.html`). **Live study:** [Orthanc — Material Laboratory](https://bonoj.github.io/jit/assets/orthanc-ink/material-lab.html). [JIT assets inventory](https://github.com/bonoj/bonoj.github.io/blob/master/jit/assets/README.md) also indexes it.

This is the **specific reference to recover**, not the Orthanc moss material and not the adjacent `stone-pigment.html` study. The laboratory derives coherent color/albedo, normal and roughness textures from layered procedural fields (fracture, mineral grain, micro-relief), with isolated slab inspection and lighting/material controls. **Human evaluation:** the material laboratory is good, but too repetitive and perhaps unnecessarily noisy; its visual density might suit an entire world's identity, **not** a treatment applied unchanged to isolated materials in a more varied world. The Orthanc moss material is bad and **not** a visual reference to reproduce.

**Strand direction:** study the shared material-field construction, not its exact look or repetition. Moss may be an evolving property of stone rather than an independent population. BBs remain appropriate for destruction debris or genuinely organic populations; they are not required just to color or weather a stone. No moss implementation is currently mounted, and this reference does not authorize rebuilding the rejected green-disc/cone experiment.

## First intact masonry tower — 2026-11-03

**Source:** [masonry-tower.js](masonry-tower.js) · shared bevel geometry [brick-rain.js](brick-rain.js) · [composition](world.js). One coherent, movable `T.Group` of existing beveled stone bricks, with hollow perimeter, front doorway, flat lintel and crenellated top, mounted near X=-2.7, Z=0 away from the offset loose masonry rain. **No bespoke arch pieces, external dependency, or second rigid-body simulation.** The group is intentionally kinematic and intact; bond graphs, compound contacts, fracture, worker manipulation and user-facing placement controls are future work.

The foundation uses `createTerrainSurfaceQuery` to sample perimeter and center, places the level group at the highest sampled ground plus a bevel allowance, and exposes `world.placeTower(x,z)` and `world.inspect().systems` tower placement diagnostics. A level, nonpenetrating pose **does not guarantee full support**: valid sample count, near contacts and maximum gap are explicitly reported. This is an initial placement algorithm, not physically simulated settling or certified stability. No browser witness yet. See [Chronicle](CHRONICLE.md) for implementation commits and limits.


## Tower correction — 2026-11-03

The first tower was visually rejected: no actual running bond, floating above uneven terrain, and invisible to meteor targeting. Corrective source: [masonry-tower.js](masonry-tower.js) now staggers courses, fills ground gaps with kinematic foundation piers, and exposes tower hit/damage and support refresh. [world.js](world.js) now includes tower bricks in meteor picking and sends tower hits to the tower, while preserving terrain excavation and the loose-brick simulation. **Not yet proven in the browser.** These are visual masonry offsets, terrain-fitted piers and per-stone removal, **not** true structural bonds, dynamic support, or falling fracture debris. [Chronicle](CHRONICLE.md) records the failure and limits.

## Next handoff

**Moss program, pass 1 (source committed 2026-11-03):** masonry rain now spawns with world-space offset `stackOrigin={x:4.5,z:0}` in `brick-rain.js`, code commit [`a33b47de`](https://github.com/bonoj/Abyss/commit/a33b47de2ca0d3a7209f8dd4c858f6e4352793d0). Existing 72 bodies, physics, meteor and terrain remain unchanged. Source readback and initial spawn-center bounds were checked; **Pages/browser and the human's visual composition are not yet verified**. No moss or universal retina/population refactor yet. Full design and this pass's evidence are in [Chronicle](CHRONICLE.md). **The human verified the shifted stack. The subsequent moss prototype was rejected and removed; see rollback above.**

**Prior physics handoff:** preserve the human-witnessed working meteor/excavation baseline. If continuing physics, investigate intentional underbelly capture and support-loss behavior as separate, opt-in workstreams; do not treat unbounded freefall as a confirmed contact defect. The browser has verified ☄️ casting and local excavation in Strand, but Genesis and automated deterministic fixtures remain untested. Wake uses contact-point closing speed but does not propagate through support islands. Implement support graph, metric contact separation and persistent multipoint manifolds; do not infer stability from sleeping counts alone. Record measured contact count, penetration, awake bodies, solver cost and browser outcome before declaring success.

**Cold boot order:** this README → [Chronicle](CHRONICLE.md) → [CONTACTS SST](../../arcana/physics/CONTACTS.md) → [world.js](world.js) → [brick-rain.js](brick-rain.js) → [eye.js](eye.js) → [stone-contacts.js](../../arcana/physics/stone-contacts.js) → [terrain.js](../../arcana/terrain.js). Inspect actual branch head and Pages/build metadata; preserve rollback and use [Gate](https://github.com/bonoj/Gate/blob/main/README.md) / [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) on recoverable write failures.
