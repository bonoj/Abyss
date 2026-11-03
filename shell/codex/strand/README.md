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

## Next handoff

**Next action:** verify ☄️ arming, terrain/brick picking, first-hit impact, local crater rebuilding, material response, Eye blast telemetry and touch gestures in a live build; then run a deterministic impact-on-sleeping-support fixture. Wake uses contact-point closing speed but does not propagate through support islands. Implement support graph, metric contact separation and persistent multipoint manifolds; do not infer stability from sleeping counts alone. Record measured contact count, penetration, awake bodies, solver cost and browser outcome before declaring success.

**Cold boot order:** this README → [Chronicle](CHRONICLE.md) → [CONTACTS SST](../../arcana/physics/CONTACTS.md) → [world.js](world.js) → [brick-rain.js](brick-rain.js) → [eye.js](eye.js) → [stone-contacts.js](../../arcana/physics/stone-contacts.js) → [terrain.js](../../arcana/terrain.js). Inspect actual branch head and Pages/build metadata; preserve rollback and use [Gate](https://github.com/bonoj/Gate/blob/main/README.md) / [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md) on recoverable write failures.
