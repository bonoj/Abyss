# Strand — temperate emergence

**Entry:** [Strand in Shell](https://bonoj.github.io/Abyss/shell/?world=strand)  
**Composition:** [world.js](world.js)  
**Landscape:** [temperate-landscape.js](temperate-landscape.js)  
**Host:** [../../main.js](../../main.js)  
**Abyss cold boot:** [../../../README.md](../../../README.md)  
**Shell handoff:** [../../HANDOFF.md](../../HANDOFF.md)  
**Recovery:** [Gate](https://github.com/bonoj/Gate/blob/main/README.md) and the Sanctum CONTRACT.

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

1. Read this file, Abyss README, Shell HANDOFF, and the current `world.js` and `temperate-landscape.js`. Inspect relevant Arcana source before changing signatures or assumptions.
2. Establish the current branch head, latest Pages workflow result, `/Abyss/pages.json` and `/Abyss/build.json`. Check the Strand entry with `?world=strand` and verify the executed SHA and browser behavior where tooling permits.
3. **First task:** observe the actual landscape. Judge geological silhouette, whether rocks look attached to terrain, whether moss/ferns/roots read as organisms, whether mist works, and whether the Hermeticon frames the composition. Fix the most consequential mismatch, not generic UI polish.
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
