# Shell — Abyss handoff

## Entry and architecture
- Source: https://github.com/bonoj/Abyss/tree/main/shell
- Canonical: https://bonoj.github.io/Abyss/shell/
- Pipeline: https://github.com/bonoj/Abyss/actions/workflows/pages.yml
- Commits: https://github.com/bonoj/Abyss/commits/main/
- Shell `index.html` loads `./main.js`, which loads Athanor and mounts `./codex/entropy/world.js`.
- `codex/genesis/world.js` is the preserved original. `codex/entropy/world.js` is a copied, independently editable world and is the currently mounted world. Shell title remains SHELL.
- `athanor/`: host, render, scheduling, inspection; `arcana/`: reusable capabilities; `codex/<world>/world.js`: authored world; `main.js`: bootstrap and world selection.
- Former `codex/sieve/world.js` was byte-identical to `codex/genesis/world.js`; Genesis is canonical. Former `sieve/compose.js` was a redundant bootstrap and has been replaced by `main.js`.
- Unused outreach data `sieve/connects.js` and `sieve/connect-deck.json` are preserved in `archive/sieve/`, outside the runtime graph. They are not world definitions. Outreach workspace links in HTML still point to the Hermeticon project.

## Isolation
Shell is a self-contained first-party runtime snapshot, with Three.js 0.180.0 from a pinned CDN. No runtime imports from Hermeticon. The original Hermeticon source is untouched. Worlds inside Shell share Athanor and Arcana; use another Abyss top-level folder only for separate runtimes.

## Build and deployment
Changes to `shell/**` trigger the Pages workflow, which preserves source experiments but compiles Shell's local dependency graph into `site/shell/assets/main.<BUILD_SHA>.js` using esbuild 0.25.12. Published `site/shell/main.js` is a tiny loader for that immutable asset; Shell HTML fetches `../build.json` and imports the SHA-qualified loader. No local runtime modules are fetched independently. The publisher writes `/Abyss/build.json` with the deployment commit SHA. `shell/athanor/athanor.js` fetches it using `../../build.json` and displays its first 8 characters. Match this number against the successful workflow commit before calling the running build verified. The workflow checks packaging, JS syntax, public manifest, and HTML reachability, not browser runtime execution.

## Recovery
For GitHub write failures, follow the established shared [Gate protocol](https://github.com/bonoj/Gate/blob/main/README.md): classify the exact failure, use permitted incremental writes or Git Data recovery when appropriate, read back, and verify. Gate governs delivery recovery; Abyss's own Pages workflow remains authoritative for publishing Shell. Do not duplicate Gate, invent a new protocol, or bypass explicit restrictions.

If Shell fails to wake, check the console and the module graph, then workflow logs. Restore a known-good Shell tree from Abyss history if needed. Do not change Hermeticon or other Abyss experiments to fix Shell. Avoid service workers and shared-origin storage collisions.

## Active experiment — composable locomotion
- **Read [LOCOMOTION.md](./LOCOMOTION.md) immediately after this handoff.** It is the authoritative working plan, implementation ledger, acceptance tests, and next frontier for the Entropy Wanderer.
- **Current frontier (2026-10-16):** Entropy's kinetic-body trial now mounts `arcana/locomotion/connected-limbs.js` (N=2): dynamic finite-mass feet joined to the body by bilateral compliant links, with approximate unilateral terrain contact. This is a first connectivity experiment, **not** a rigid articulated joint solver or verified stable gait. The earlier fixed-anchor `contact-limbs.js` fixture and its perturbation failures are retained as historical evidence. Read LOCOMOTION.md sections **BM–BN** for the pivot, precise limitations, and next experiments; inspect current source before continuing. The Wanderer-driven visual IK follower is a separate legacy display, not the kinetic body's locomotion authority.
- Previous fauna assembly plan below is historical/superseded, **not the active next task**.

## Current Entropy state — 2026-10-16
- `shell/main.js` mounts Entropy, not Genesis. Genesis is preserved independently.
- `shell/arcana/terrain.js`: `topology:'atlas'`, deterministic seed 741, 85×85 2D elevation map, 50.4×50.4 world, 85×21×85 SDF samples. Two mesas, a jagged peak complex, broad flats. Atlas topology excludes reference fixture operations. The terrain remains volumetric and deformable by meteor impacts.
- `shell/arcana/wanderer.js`: terrain-offset following begins outside a 4.86-unit horizontal follow radius, offset clamped ±14 on each axis; no camera-frustum-aware viewport following. Navigation uses supported paths and enclosing-glass clearance.
- Entropy uses the existing `createBeadDebris` physics, `createCinderfall`, impact dispatcher, terrain navigation, and inspector. Inspect current source for authoritative wiring.
- **Fauna status: no sheep currently mounted.** One-off `shell/arcana/creatures/bb-sheep.js` was deleted at `19dea60a`; Entropy's import, update, and inspection wiring were removed. It had triggered a freeze on proximity detonation. Strong suspected cause: it passed `color.getHex()` numbers to `debris.emit`, but debris uses `InstancedMesh.setColorAt()` with `THREE.Color` objects. This was not verified by captured browser exception. Do not restore that implementation.
- **Superseded historical direction (do not resume without new approval):** build a reusable Arcana Fauna Assembly composition layer, then sheep as its first recipe. Anatomy = BB volumes, shells, heads, legs, palettes; behavior = terrain support, grazing/herding, proximity; lifecycle = alive/startled/disassembled; material ownership = every anatomical BB transferred exactly once into the shared detached BB engine. Integrate creature systems with meteor impact dispatch and observation. Prove reuse with a second distinct creature. Existing references: `arcana/creatures/first-bestiary.js`, `arcana/creatures/velvet-drifters.js`, `arcana/locomotion/grounding.js`, `arcana/physics/bead-debris.js`, `arcana/physics/impact-dispatcher.js`.
- **Performance:** preserve mobile-first CPU performance; avoid per-bead meshes and unnecessary per-frame full-world terrain queries. Do not invent population or BB caps. Report authored, live, transferred, and detached BB accounting.

## Cold boot command: “Go to Abyss”
1. Open `bonoj/Abyss` README → this handoff. Do not ask the user to fetch files, copy source, or supply paths.
2. Inspect the live repository tree and relevant Arcana/Codex source, plus `.github/workflows/pages.yml`; treat documentation as orientation, not proof of current implementation.
3. Check latest `main` commit and Pages Actions. Distinguish committed, deployed, public entry, and actual browser runtime. Compare inspector's executing SHA against `build.json` and successful workflow SHA. Never claim a build is live without evidence.
4. Read `shell/LOCOMOTION.md` and resume its current approved frontier without rebuilding established systems. Preserve Genesis and other worlds. Do not resume the superseded fauna work.
5. After material changes, update this handoff and root README if entrypoints, active world, deployment, or frontier changes. Keep the entry path short and durable.

## Europa opt-in experiment (2026-10-16)

`main.js` preserves Entropy as default. Add `?world=europa` to the canonical Shell URL to mount `codex/europa/world.js` instead. This early world composes the existing vessel and atlas terrain, with uncalibrated inspector metadata; it has no drilling, sampling, or material ledger. Do not interpret terrain IDs as Europan chemistry. Source commits: Europa module `967f00c0`, selector `1b2f58f`. The new world has **not been browser-runtime verified**. Preserve Entropy's independent locomotion frontier.

## Europa excavation experiment

The opt-in Europa scene now inventories positive signed-field lattice nodes using `terrain.inventoryNodes()`, then removes actual occupied nodes via `terrain.extractNodes({x,z,radius,yTop,yBottom})`, rebuilding local terrain chunks. Its conservation ledger tracks the removed generic material IDs as recovered and dispersed counts. Explicit browser diagnostic: `europaExtractJSON(options,recoveryFraction)`; **no automatic excavation on boot**. This is discrete-node accounting, not calibrated volume/mass, chemical composition, or scientifically valid ice-core recovery. Current generic terrain material IDs remain non-Europa species. Read inspector `world.experiment.materialAccounting` and `lastExtraction` after testing. Exact-source regression and browser execution of this revision are not yet verified. Changes are isolated from Entropy except for adding reusable terrain methods.
