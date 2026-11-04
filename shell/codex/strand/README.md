# Strand — cold boot and handoff

**Run:** [Strand in Shell](https://bonoj.github.io/Abyss/shell/?world=strand) · **History:** [Chronicle](CHRONICLE.md) · **Past README states:** [Archive](README.ARCHIVE.md) · **World:** [world.js](world.js) · **Physics/material SST:** [Arcana CONTACTS](../../arcana/physics/CONTACTS.md)

**Upstream:** [Abyss](../../../README.md) · [Shell HANDOFF](../../HANDOFF.md) · [Gate](https://github.com/bonoj/Gate/blob/main/README.md) · [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md)

## Invariants

- **Reuse before invention.** Inspect the existing Arcana implementation and its contracts before adding machinery. Preserve Hermeticon, terrain, populations, BBs, meteor/impact/debris, material survey and Shell composition; do not introduce parallel physics, rendering or clipping paths. Protect Genesis, Entropy, Europa and Wanderer.
- **Terrain and material provenance are authoritative.** Strand uses `createTerrain({topology:'atlas'})`; positive occupancy is not metric distance. The [CONTACTS SST](../../arcana/physics/CONTACTS.md) governs material/contact behavior. Rendering is a view of simulated state, not an independent simulation.
- **Actual physical masonry.** Existing stone/wood/ice bricks use `brick-rain.js` and shared `stone-contacts.js`. No decorative tower or faux foundations. Preserve meteor excavation and support-loss behavior. Avoid O(N²) contacts and heavyweight per-BB solvers.
- **Visibility follows existing Arcana BB behavior.** Hermeticon exposes `visibleEntity(x,y,z,r)` using its inner radius. Strand bricks and BBs use that per-entity rule while physics continues beyond visibility. This is a shared predicate, **not automatic enforcement for arbitrary future renderers**; terrain still has its continuous shader aperture. Do not revive the rejected scene traversal.
- **Evidence is explicit.** A GitHub commit and source readback are not a deployed build, browser witness, physics stability test or performance measurement. Record exactly what the human observed and what the model verified.

## Mandatory development and Chronicle contract

**Read existing source/contracts → implement and verify → append Chronicle at development time → update this README's handoff → archive stale README material → read back.** Chronicle is the historical record; README is not a running diary. Never replace Chronicle entries with a retrospective summary or silently erase failures.

Every new Chronicle entry MUST:
1. Read this contract and the existing Chronicle first. Obtain the **actual UTC time from a clock**, not a guessed local date. Head the entry `## YYYY-MM-DDTHH:mm:ssZ — event` (seconds and literal `Z`).
2. Refer to the collaborators **only as “the human” and “the model”** in Chronicle narrative. Never substitute generic role names or first-person narration. Scan the **entire Chronicle** for terminology drift before committing.
3. Record the human's objective/authorization, what changed and commit SHAs, source/deployment/browser evidence separately, failures/limits, rollback and next action. Preserve superseded attempts as history. Historical date-only headings have unknown times: **do not fabricate UTC timestamps**.
4. Update **only** current invariants, verified status, unresolved references and next actionable handoff here. Move outdated README passages to [README.ARCHIVE.md](README.ARCHIVE.md), with a timestamp and provenance. Read back both documents and verify links/imports. Do not let README accumulate development milestones.

**Write failure:** follow [Gate](https://github.com/bonoj/Gate/blob/main/README.md) and [Sanctum CONTRACT](https://github.com/bonoj/Sanctum/blob/main/CONTRACT.md): inspect the actual error and remote SHA, distinguish transport/stale-state failures from genuine restrictions, retry corrected authorized writes, use the permitted Git Data fallback where appropriate, and verify readback. Never turn ordinary tooling failures into work for the human.

## Current handoff

**Composition:** `world.js` mounts Hermeticon, atlas terrain, equatorial treatment, neutral geology, 72 mixed-material physical bricks, one experimental autonomous stone gatherer, BB debris, impact dispatcher, Cinderfall and material survey. The rejected tower and moss prototype are not mounted; do not recreate them. The human has witnessed meteor excavation and delayed brick motion after terrain support loss. The half-size brick experiment and the latest reused BB visibility integration have source commits but **no confirmed post-change browser witness**. The existing contact solver remains preliminary; do not claim stable rest from sleep counts alone.

**Next:** verify the first resident's full local claim → approach → physical carry → release loop in the live browser; it requires sleeping stone bodies, can stall on difficult terrain, and has not been runtime-witnessed. Then verify upper-dome brick visibility, BB behavior, meteor targeting, and Eye telemetry for high-speed tunneling/solver cost. If anything fails, inspect the original Arcana mechanism first and preserve the known working baseline. Later contact work (support graph, metric separation, persistent manifolds) requires a separate decision, not automatic scope expansion. Historical measurements, rollback details and commit provenance are in [Chronicle](CHRONICLE.md).

## Open material reference — retain until addressed

**Orthanc material laboratory:** [source](https://github.com/bonoj/bonoj.github.io/blob/master/jit/assets/orthanc-ink/material-lab.html) · [live study](https://bonoj.github.io/jit/assets/orthanc-ink/material-lab.html) · [JIT inventory](https://github.com/bonoj/bonoj.github.io/blob/master/jit/assets/README.md).

This is the **Orthanc Ink material laboratory**, **not** the rejected Orthanc moss material or adjacent stone-pigment study. Its procedural layered color/albedo, normal and roughness fields are worth studying for coherent stone material treatment. The human found it compelling but too repetitive/noisy as an unchanged blanket treatment. Explore its material-field construction without copying its look. Moss might be a property of physical stone rather than an independent decorative population. **Keep this reference in the active README until the human and model address it.**

**Cold boot:** README → [Chronicle](CHRONICLE.md) → [CONTACTS](../../arcana/physics/CONTACTS.md) → [world.js](world.js) → [brick-rain.js](brick-rain.js) → [stone-gatherer.js](stone-gatherer.js) → [eye.js](eye.js) → [stone-contacts.js](../../arcana/physics/stone-contacts.js) → [terrain.js](../../arcana/terrain.js). Confirm repository head and live build independently.
