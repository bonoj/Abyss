# Entropy — Composable Locomotion
Working plan and progress ledger · 2026-10-16

**Project:** Abyss → Shell → Entropy  
**Status:** Active exploration  
**Canonical runtime:** https://bonoj.github.io/Abyss/shell/  
**Source of truth for this experiment:** this file. Shell recovery/deployment: [HANDOFF.md](./HANDOFF.md).

## Origin: “Should we do composable IK?”

We were considering a reusable fauna assembly layer. The question “Should we do composable IK?” redirected the work toward **composable articulated bodies**, with IK as one capability rather than a species-specific animation system.

Vocabulary: segments, joints and limits; effectors (feet, hands, wings, manipulators); targets (terrain, objects, world positions); independent solvers; contact and gait controllers. Solvers must not know what species or machine they animate. Quadrupeds, hexapods, tentacles, and walking machines remain future demonstrations, not the immediate scope.

## Decision: “We're building a wanderer”

> We're building a wanderer, then. And we explore all different modes of locomotion. Bound by gravity, dragged down but flying, decoupled entirely.

**One Wanderer. Many ways of inhabiting a world.**

Three regimes:
1. **Bound by gravity:** walk, crawl, climb, leap, hang; contacts and support matter.
2. **Fighting gravity:** glide, flap, hover, thrust, buoyancy, controlled descent.
3. **Decoupled:** inertial flight, zero-g manipulation, orbital or authored force fields.

Gravity is an environmental force, not a locomotion mode. Changes between regimes should preserve position, velocity, body identity, and continuity.

Working title: **The Many Ways of Falling**.

## Architecture and ownership

| Authority | Owns |
| --- | --- |
| Navigation | Desired destination, path, and intent |
| Locomotion | Contact scheduling, support, gait, and applied forces |
| Articulation | Joint solutions for the targets and constraints |

Body topology, environmental sensing, and presentation are independently composable. No walking/flying/zero-g subclasses; no solver coupled to species, gravity, terrain, or rendering. Avoid god objects and premature universal physics frameworks. Preserve Genesis and the existing Wanderer until replacement authority is demonstrated.

## Repository inspection / baseline

- Existing `arcana/wanderer.js` is a **floating Hermeticon**, not an articulated walker. It already handles terrain-aware A* paths, clearance, acceleration/braking, tap navigation, and world-offset following. Preserve these.
- `arcana/locomotion/grounding.js` has gravity and contact behavior for ground-supported actors; useful reference, not a universal force engine.
- Entropy composes Arcana under `codex/entropy/world.js`; Genesis is preserved separately.
- A visual follower is **not** yet physically driven locomotion.

## Progress ledger

### A. Reusable two-bone IK — committed
Commit: `ec778c14`  
File: `shell/arcana/locomotion/two-bone-ik.js`

Arbitrary 3D root and target, positive segment lengths, pole-defined bend, reach handling, and error reporting. No Three.js, terrain, gravity, or species dependencies. Numerical edge-case tests and runtime validation still needed.

### B. Articulated Wanderer visual trial — committed, runtime unverified
Commits:
- `33625f01`: add `arcana/locomotion/articulated-trial.js`.
- `affb3d43`: mount the trial in `codex/entropy/world.js` and expose inspection.
- `e1925431`: adjust terrain-relative body position.

A visible body, two IK-driven legs, terrain-sampled foot targets, alternating visual motion, and per-leg error diagnostics. The original Wanderer retains all navigation and movement authority. Contacts are provisional; feet can skate. **No claim of successful Pages deployment or browser execution** based solely on commits.

## Direction correction — gravity first, instrumented autonomous experiments (2026-10-16)

**Observation:** planted feet remained far behind the independently moving body, even after predictive stepping (`e89a2afa`). This is a structural mismatch, not a request for more gait threshold tuning. The reactive gait prototype is preserved as historical code, **not the active experiment**.

**First principle:** locomotion moves a mass through forces while negotiating contacts. Build in this order: external forces → mass/velocity → contact constraints → locomotion control → articulation/IK. Gravity is an input, not a mode.

**Operating agreement:** The assistant authors deterministic, scripted trials; the user need not manually steer. A single JSON report containing chronological samples, events, scenario parameters, diagnostics, and build identity is returned by the user for analysis. Distinguish measured data from estimates. Preserve manual navigation and Genesis. Avoid background claims or assuming the assistant can read a live browser directly.

**New frontier:** an isolated **drop-and-settle** trial: one mass, terrain height, gravity, collision/support, fixed-step integration, and bounded telemetry. No gait or IK. The runner must not replace the existing Wanderer's movement authority. Prefer explicit self-test/export entrypoints over silent background activity.

**Acceptance:** deterministic replay for the same parameters; no persistent penetration; stable rest; finite velocity/position; coherent contact transition and time sequence. The next scenario after passing is horizontal motion, then one-limb support, then alternating support.

**Telemetry contract (`entropy-locomotion/v1`):** scenario, seed, dt, simulated time, sample count, initial conditions, gravity, mass/radius, chronological `samples` with position/velocity/contact/penetration/energy, `events` for impact and rest, and `summary` with max penetration, settling time, energy behavior. Include explicit source SHA when available; otherwise `null`, not a guessed build identity. Export JSON via an accessible global inspection function and include it in Entropy's inspector.

## Roadmap and acceptance tests

### 1. Real foot planting — IMPLEMENTED IN SOURCE, NEEDS RUNTIME VALIDATION
Implement explicit **stance** and **swing** states. Planted feet remain fixed in terrain/world coordinates while the body advances; swinging feet select new landings and follow controlled trajectories. IK only solves targets; it does not schedule steps.

**Proof:** start, stop, and turn without visible planted-foot skating. Observe contact state, foot drift, target/reach errors, phase duration, and frame cost. Do not yet change body movement authority.

### 2. Body support and gravity
Introduce velocity, gravity, and support constraints; gradually transfer movement authority from the visual terrain follower to physical locomotion.

**Proof:** loss of support causes a continuous fall; restored support permits recovery without snapping.

### 3. Composable gaits
Vary limb count and placement independently of gait/contact scheduling: two, four, six, hopping, asymmetric.

**Proof:** a distinct body plan reuses the solver and locomotion capabilities without a bespoke implementation.

### 4. Three-dimensional contact
Generalize contact points, normals, grips, and reachable constraints beyond horizontal ground.

**Proof:** ground → incline → wall/overhang without switching to a separate character system.

### 5. Falling and aerodynamic movement
Compose gravity, drag, lift, thrust, and buoyancy with the same articulated body.

**Proof:** walk → leap → glide → land with continuous state.

### 6. Decoupled movement
Explore inertial flight, zero-g orientation and manipulation, and authored fields.

**Proof:** zero terrain contacts without losing articulated body continuity.

## Previous immediate next turn (superseded by gravity-first trial)

1. Inspect the current articulated trial, terrain query, and movement contracts.
2. Extract a reusable stance/swing contact controller from the visual rig.
3. Persist planted contacts in terrain coordinates (not viewport-relative coordinates).
4. Generate swing landing targets and trajectories; feed both to existing IK.
5. Instrument contact drift, solver error, and frame cost.
6. Verify source, Pages workflow, public manifest, and actual browser behavior independently.
7. Keep original navigation and movement as the fallback; do not add flight or species yet.

## Portfolio objective and reporting discipline

Genesis demonstrates terrain, materials, impacts, and systemic worlds. **Entropy demonstrates an embodied entity recombining a small vocabulary of capabilities to move through a physically meaningful world.**

For each iteration record: attempt, commits, observed verification, provisional/broken behavior, reusable Arcana changes, and next proof.

**A commit is not a deployed build. A rendered pose is not physical locomotion. A plausible gait is not planted contact.**

**Current frontier:** isolated deterministic gravity/contact trial; see direction correction above.  
**Current implementation:** two-bone IK plus articulated visual follower.  
**Next proof:** fixed-step drop-and-settle JSON with reproducible chronological samples.

### C. Stance/swing controller — committed, browser unverified
Commits: `116cd72d` (new `arcana/locomotion/foot-contacts.js`), `760adb35` (articulated trial integration).

Persistent terrain-coordinate foot targets, explicit stance/swing states, one foot swinging at a time, smooth swing interpolation and lift, contact and step diagnostics. Existing Wanderer retains navigation and movement authority. **Caution:** planted *targets* are fixed, but rendered feet may deviate when IK cannot reach them; no runtime proof of zero skating or gait quality yet. Next inspect reach error and planted-foot position in a real browser, then correct reach/step scheduling as needed.

### E. Gravity-first drop-and-settle runner — source committed; public runtime unverified
Commits: `cbbcb97c` scaffold, `a8e4e0b7` implementation, `44d250af` Entropy integration.

`arcana/locomotion/drop-trial.js` provides deterministic fixed-step semi-implicit Euler gravity and unilateral inelastic ground contact, with sampled chronological body positions/velocities, energy, impact and settle events, and max pre-correction penetration. `world.runLocomotionTrial(options)` runs it on demand, without moving the live Wanderer; `globalThis.entropyLocomotionJSON()` returns a JSON string for the default scenario. The latest report appears in `world.inspect().systems` as `locomotion trial`. This is a **headless trial**, not yet a visible falling sphere or proof of a general contact solver. The runner samples the current terrain height at x,z, defaults to (0,0), and may return `no-surface` if unsupported. No actual browser measurements have been received.

**Next:** verify public execution, obtain first JSON report, evaluate impact/settle/penetration/energy, then build a visible scripted test body and a sequence of scenarios. Do not resume tuning the old reactive gait.

### F. Autonomous visible gravity trial — committed; awaiting browser observation
User supplied inspector from executing build `04c1b6fa`, ~60.14 FPS: `locomotion trial.execution='on-demand'`, `lastReport=null`. No visible experiment was expected; this was an authoring omission. Commit `b01f2f87` now runs the trial at startup and replays its time series on a visible gold sphere, looping without taps. Inspector exposes `lastReport`, visibility and replay clock; `entropyLocomotionJSON()` returns the last report without re-running it. This is a **visual replay of precomputed simulation**, not a real-time integrated body. Confirm the sphere is visible and the report status is completed on the next observed build; do not assume browser publication from the commit alone.
