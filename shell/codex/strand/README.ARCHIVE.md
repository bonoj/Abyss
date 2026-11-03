# Strand README archive — historical notes

Archived verbatim from README at 2026-11-03T20:57:07Z before cold-boot cleanup. Superseded operational claims may be stale; use README + CHRONICLE + source for current state.

---

# Strand — temperate emergence

**Entry:** [Strand in Shell](https://bonoj.github.io/Abyss/shell/?world=strand)  
**Chronicle / cold boot:** [CHRONICLE.md](CHRONICLE.md)  
**Composition:** [world.js](world.js)  
**Geology shader:** [strand-geology.js](strand-geology.js)  
**Host:** [../../main.js](../../main.js)  
**Abyss cold boot:** [../../../README.md](../../../README.md)  
**Shell handoff:** [../../HANDOFF.md](../../HANDOFF.md)  
**Recovery:** [Gate](https://github.com/bonoj/Gate/blob/main/README.md) and the Sanctum CONTRACT.

**Unified physics frontier:** [Arcana CONTACTS contract](../../arcana/physics/CONTACTS.md). Strand masonry is the first migration target. The first shared stone-contact kernel is now wired to Strand bricks, but resting stability and runtime behavior remain unverified; see [Chronicle](CHRONICLE.md) and the contract implementation ledger. The Orbital Foundry is preserved in source and JIT Icarus but no longer mounted in Strand (commit `27152638`).

## Intent

Strand is the quiet, natural-world branch of Abyss: an ancient temperate landscape inside a Hermeticon. Begin with weathered stone, moss, ferns, exposed roots and mist. First establish credible geology, material, scale, organic colonization and atmosphere. Tower defense is a later possibility, not the current brief.

## Invariants

1. **Reuse the vessel.** Import Arcana's `createHermeticon()`, mount `world.content` inside `world.group`, and preserve accepted glass/brass appearance. Do not clone Athanor or the vessel.
2. **Terrain is authoritative.** Use Arcana's signed-field `createTerrain({topology:'atlas'})`, its surface query, collisions, deformation and aperture. Decorative rocks, moss, ferns, roots and mist are currently visual cover, **not** collision geometry or material inventory. Never imply otherwise.
3. **Keep the physics contract.** Preserve `createBeadDebris`, `createImpactDispatcher`, `createCinderfall`, vessel/terrain collision and `createMaterialSurvey`. Material detached above may fall and be retained below. Check actual capture ownership before asserting nested-vessel behavior; Strand has no nested vessel yet.
4. **Independent layers.** Keep geology, materials, vegetation and atmosphere independently composable. New natural features should respond to terrain and environmental context, not merely scatter arbitrary props. Current surface cover is a provisional visual sketch, not validated ecology.
5. **Protect stable worlds.** Entropy is the default; Europa remains opt-in; Genesis is preserved. Strand is opt-in through `?world=strand`. Never modify their behavior to repair Strand.
6. **Prove the result.** Distinguish source written, bundle built, Pages deployed, public entry loaded and browser rendering verified. Do not claim the first landscape is visually successful before inspection.
7. **Recover without burden.** For benign GitHub write failures, consult Sanctum CONTRACT and Gate, use minimal file creation, small updates and authorized Git Data recovery where appropriate; read back each change. Do not bypass explicit policy denials.

## Current composition

`world.js` mounts the Hermeticon, atlas terrain, equatorial treatment, surface query, temperate cover, detached debris, impact dispatcher, meteor system and material survey. `world.update(dt)` advances meteor and debris; `world.attachView()` is currently a no-op.

`temperate-landscape.js` deterministically places a weathered-stone cluster, moss patches, small stylized ferns, surface-following root tubes and low translucent mist planes. Seed 741. This is an **initial authored aesthetic pass**, not a physically integrated biome. It may have occlusion, scale, shading or performance problems not yet observed in the browser.

## Cold boot / next handoff

1. Read this file, Abyss README, Shell HANDOFF, and the current `world.js`, `brick-rain.js`, and Arcana `physics/stone-contacts.js`. Inspect relevant Arcana source before changing signatures or assumptions.
2. Establish the current branch head, latest Pages workflow result, `/Abyss/pages.json` and `/Abyss/build.json`. Check the Strand entry with `?world=strand` and verify the executed SHA and browser behavior where tooling permits.
3. **First task:** read the [Chronicle](CHRONICLE.md), inspect current brick physics and observe the actual landscape. Judge geological silhouette, whether rocks look attached to terrain, whether moss/ferns/roots read as organisms, whether mist works, and whether the Hermeticon frames the composition. Fix the most consequential mismatch, not generic UI polish.
4. Inspect collision/capture behavior separately from visual cover. Test meteor impact and debris retention; report any unverified behavior precisely.
5. Work in small, reversible increments. Read back committed source and verify publication; preserve a rollback commit. Keep this handoff updated with real observations and the latest verified build.

## State at handoff — 2026-11-02

- Strand bootstrap and temperate cover are committed; both source files and their import/export connection were read back after recovery.
- A previous missing-module import was repaired using the Sanctum/Gate small-write pattern before the actual landscape module was added.
- Latest landscape integration commit at time of writing: `e8ff303a8e789b994a3a615885b80a24ff575234` (recheck branch head).
- **No verified browser rendering or visual acceptance yet.** Do not treat source readback as runtime verification.
- Immediate objective: inspect and iterate the first ancient temperate landscape, keeping existing physics intact.

## Strand write reliability experiment

Keep this procedure local to Strand while evaluating it; do not change Gate or shared machinery.

1. Read the current Strand source and its blob SHA. Prepare the intended change and validate syntax and imports before writing.
2. Use the normal GitHub file update with the current SHA. Read back the exact file and compare it with the intended content.
3. Classify failures: GitHub API errors (conflict, permissions, path), tool-level safety blocks, or deployment/runtime failures. Record which stage actually failed. A safety block is not evidence that GitHub rejected the content.
4. For ordinary recoverable GitHub failures, refresh the SHA, resolve conflicts, or use authorized Git Data operations when appropriate. Do not disguise or route around an explicit safety restriction.
5. Commit only coherent changes. Confirm the branch head, then separately check Pages publication and browser execution. Preserve a rollback reference.
6. Keep a concise record here of attempted writes, method, result, and any verified cause. Do not treat a failed attempt as a committed change.

**Initial observation (2026-11-02):** A proposed Strand terrain shader update through the normal file-update operation was blocked by a tool-level safety check. No commit was returned. The exact trigger is unknown; other Sanctum updates succeeded. Next test: a small documentation-only update (this section), followed by a minimal Strand-only source change if accepted.

## Shader experiment — 2026-11-02

- Replaced the decorative-cover import with a Strand-only terrain shader. Existing signed-field triangles, collision, impacts, debris and shared Arcana source remain untouched. The old `temperate-landscape.js` remains in Git history/source but is no longer mounted.
- Runtime palette uses elevation and triangle derivative orientation for slate, ochre, green and mineral tones. No decorative cover meshes are created.
- Small source writes succeeded: composition switch `42406bb7`, scaffold `b4fa6752`, shader `3f037885`, newline fix `541abfed`. These demonstrate smaller writes can succeed; they do not prove why the earlier larger write was blocked.
- **Source committed and read back; browser rendering and Pages deployment not verified.** Inspect GLSL compilation, terrain visibility, palette and aperture clipping before claiming success.

## Isolated material study — 2026-11-02

The uniform bump and global terrain tint were rejected. Strand now leaves Arcana's terrain material untouched; `strand-geology.js` is a neutral no-op. A single independent faceted stone specimen is mounted by `world.js` via [material-specimen.js](material-specimen.js). Its geometry/material are visual only, not authoritative collision or inventory. Keep future texture, normal, and bump experiments confined to this specimen until visually accepted. Source commits: neutral restoration `06c8bc9f`, specimen `2498f670`, composition `bd3098c5`. Browser rendering remains unverified.

## BB-backed coherent rock prototype — 2026-11-02

The isolated specimen now contains a deterministic inventory of 96 unit-total-mass BB records, rendered as one low-poly coherent stone. `material-specimen.js` advances vertical gravity and resamples the terrain's top signed-field crossing each frame; `world.js` calls `specimen.update(dt)`. It starts above the terrain and should settle, then drop if the sampled support falls away. This is a **limited proof of representation**, not bonded particle dynamics: there is no actual bond graph, BB collision, torque, rolling, cave contact, or conversion into free debris. Do not describe it as a physically accurate rock yet. Initial commits: `fe56ba11`, `a296b7b8`. Browser behavior unverified.

## Visual treatment references — Orthanc JIT studies (2026-11-03)

Explore these treatments **inside the existing Hermeticon / Strand**, not by replacing its renderer, vessel, terrain, or physics. The Orthanc experiments live together under [JIT assets / orthanc-ink](https://github.com/bonoj/bonoj.github.io/tree/master/jit/assets/orthanc-ink), indexed by the [JIT assets README](https://github.com/bonoj/bonoj.github.io/blob/master/jit/assets/README.md).

- [Heavy black ink](https://bonoj.github.io/jit/assets/orthanc-ink/black-ink.html): deliberate outlines, silhouette, toon-like shadow masses. Explore as a selective material/edge treatment rather than a blanket comic filter.
- [Stone & Pigment](https://bonoj.github.io/jit/assets/orthanc-ink/stone-pigment.html) and [Material Laboratory](https://bonoj.github.io/jit/assets/orthanc-ink/material-lab.html): coherent procedural color/height/normal/roughness, fractures, grain and light response. Begin with Strand's isolated specimen before applying to geology.
- [Pixel Depth repair prototype](https://bonoj.github.io/jit/assets/orthanc-ink/pixel-depth-repair.html): compare low-resolution **screen-space pixels**, surface-attached pixels and smooth 3D while retaining real perspective, orbit and lighting. **Screen-space pixels were the standout direction**: pixel-art abstraction over genuinely 3D depth and movement.

**Important failure / boundary:** the prototype's “surface pixels” were detached boxes positioned against an approximate tower radius, not attached to actual tapered geometry. Later in-chat attempts to repair this did not produce a verified working Three.js scene. Do not reuse those detached chips or treat the later diagnostic as a completed Orthanc. If pursuing surface pixels, derive UV/object-space quantization from the actual mesh, or generate patches from its triangles/normals. Keep the screen-space treatment independently testable.

**Strand experiment path:** (1) preserve the existing BB-backed specimen and authoritative terrain/physics; (2) try procedural stone and ink on the specimen as independent, reversible treatments; (3) try low-resolution offscreen rendering + nearest-neighbor upscaling at the **camera/output stage**, with a control for native resolution, without altering world geometry; (4) compare screen pixels against geometry-anchored pixels under orbit, sunlight, fog and moving BBs; (5) measure actual mobile frame time and visually inspect before promoting a treatment into shared Athanor/Arcana. The JIT studies are references, **not validated production modules**.

## Christmas visual grammar — Stone & Root JIT prototype (2026-11-03)

**Reference:** [Run the standalone gatehouse](https://bonoj.github.io/jit/assets/strand-stone-root/) · [Source](https://github.com/bonoj/bonoj.github.io/blob/master/jit/assets/strand-stone-root/index.html) · [JIT assets index](https://bonoj.github.io/jit/assets/).

A first in-chat procedural 3D gatehouse was accepted as a **promising visual grammar** for a world the children can play with at Christmas. Its composition and structure need refinement, but the material and geometric language is closer to the target: elevated above Minecraft's block grid without the generic low-poly Warcraft III aesthetic. Preserve the individually articulated, slightly irregular **beveled masonry**, radial doorway voussoirs, layered roof tiles, faceted supporting rock, paving, grass, flowers, and warm/cool lighting. The scene is real orbitable Three.js geometry with Roof, Orbit and Grow controls, not a static illustration. Source was committed to JIT; public runtime and visual parity after publication are **not independently verified**.

**Next iteration:** improve architectural silhouette, physical joins and proportions; make stone courses and window/door openings truly structural rather than layered facades; root the building in the terrain and allow organisms to colonize joints and rubble. Treat stone, wood, tile, soil and vegetation as independently composable populations with material, contact and lifecycle rules. Avoid arbitrary scattering, disconnected floating parts, a blocky voxel grid, and a blanket low-poly art filter. This is an **aesthetic reference**, not an authorization to replace Strand's signed-field terrain, BB specimen, collision, material inventory, or Hermeticon renderer. Develop the geometry/material language alongside those existing systems.


---

## Superseded README snapshot — 2026-11-03T23:47:18Z

This is the complete README before the human-directed lean handoff cleanup. Historical status claims below are retained for provenance only; use current README, Chronicle and source for live state.

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
2. **Chronicle (binding authoring contract):** before writing, read this README and the existing Chronicle; obtain the **actual current UTC time** from a clock, never from a guessed date or local time. Append a new entry headed `## YYYY-MM-DDTHH:mm:ssZ — <event>` using the real UTC ISO 8601 timestamp (seconds and literal `Z`). **In Chronicle narrative, the collaborator is always `the human` and the assistant is always `the model`; never use `user`, `assistant`, or first-person substitutes for these roles.** Preserve this vocabulary in headings, witness descriptions, failures and rollback notes. Record intent/authorization, exact source changes and commit SHAs, what was actually verified (distinguish source, deployment and human browser witness), failures/limitations, rollback and next handoff. Append history rather than quietly rewriting outcomes. Historical date-only headings have unknown times: preserve them as-is; do not fabricate timestamps or retroactively relabel them as precise UTC. After editing, scan the entire Chronicle for role-vocabulary drift and verify every new heading has a real UTC timestamp. Read back the committed Chronicle and README.
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

## Rejected tower experiment removed — 2026-11-03

At the human's explicit direction, the entire decorative tower experiment was deleted. `masonry-tower.js` no longer exists; `world.js` is restored to the original pre-tower composition, and `brick-rain.js` again owns its own original geometry definition. The existing loose physical bricks, their physics, meteor targeting and terrain excavation remain. The rejected approach duplicated bricks as kinematic meshes and added artificial foundation piers and mesh-hiding damage. **Do not resurrect it.** Any future construction must use the actual existing physical bricks and their contact machinery, with relationships/bonds as a separate design question. Historical failure notes remain in Chronicle. No browser witness of the rollback yet.

## Half-size masonry — 2026-11-03

Existing 72 physical bricks halved in geometry, collision, mass and inertia. Meteor energy and radius unchanged. Eye reports peak impact velocity and per-step travel ratio. Browser verification pending. No tower. See Chronicle.

## Hermeticon entity visibility — reused Arcana BB rule

Hermeticon exposes `visibleEntity(x,y,z,radius)`, the established BB dome rule using the vessel inner radius. Strand bricks and BBs use the same predicate independently per entity; physics continues outside visibility. The invented render traversal and aperture setter were removed. Continuous terrain still uses its own shader aperture. See Chronicle. Browser witness pending.

## Next handoff

**Moss program, pass 1 (source committed 2026-11-03):** masonry rain now spawns with world-space offset `stackOrigin={x:4.5,z:0}` in `brick-rain.js`, code commit [`a33b47de`](https://github.com/bonoj/Abyss/commit/a33b47de2ca0d3a7209f8dd4c858f6e4352793d0). Existing 72 bodies, physics, meteor and terrain remain unchanged. Source readback and initial spawn-center bounds were checked; **Pages/browser and the human's visual composition are not yet verified**. No moss or universal retina/population refactor yet. Full design and this pass's evidence are in [Chronicle](CHRONICLE.md). **The human verified the shifted stack. The subsequent moss prototype was rejected and removed; see rollback above.**

**Prior physics handoff:** preserve the human-witnessed working meteor/excavation baseline. If continuing physics, investigate intentional underbelly capture and support-loss behavior as separate, opt-in workstreams; do not treat unbounded freefall as a confirmed contact defect. The browser has verified ☄️ casting and local excavation in Strand, but Genesis and automated deterministic fixtures remain untested. Wake uses contact-point closing speed but does not propagate through support islands. Implement support graph, metric contact separation and persistent multipoint manifolds; do not infer stability from sleeping counts alone. Record measured contact count, penetration, awake bodies, solver cost and browser outcome before declaring success.

**Cold boot order:** this README → [Chronicle](CHRONICLE.md) → [CONTACTS SST](../../arcana/physics/CONTACTS.md) → [world.js](world.js) → [brick-rain.js](brick-rain.js) → [eye.js](eye.js) → [stone-contacts.js](../../arcana/physics/stone-contacts.js) → [terrain.js](../../arcana/terrain.js). Inspect actual branch head and Pages/build metadata; preserve rollback and use [Gate](https://github.com/bonoj/Gate/blob/main/README.md) / [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) on recoverable write failures.
