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


### G. Experiment 001 — observed drop-and-settle (executing build `1fd2f116`)

**Evidence:** User-provided Entropy inspector JSON from the executing browser. Identity `1fd2f11638df7b55ee4f0966247d1af03dc97a81`, FPS ~89.90, `locomotion trial.visible=true`, `execution='autonomous looping visual replay'`, `lastReport.status='completed'`. This is actual reported runtime evidence, not inferred deployment success. No independent visual judgment about the sphere's appearance was supplied.

**Implementation used to obtain the evidence:**
- `shell/arcana/locomotion/drop-trial.js` (commit `a8e4e0b7`): deterministic, headless simulation of a radius-0.18 mass dropped 1.4 units above a sampled terrain height; gravity 9.8, mass 1, semi-implicit Euler at fixed `dt=1/120`, 3-second duration, one exported sample per 4 steps (91 samples). At each step apply gravity, integrate velocity/position, and clamp the center to `terrainY+radius` upon contact, zeroing vertical velocity (inelastic unilateral floor). Emit impact and settled events; track maximum *pre-correction* penetration.
- `shell/codex/entropy/world.js` (commit `44d250af`): wires `runDropTrial` to the Entropy terrain-surface query and exposes `world.runLocomotionTrial(options)`, `globalThis.entropyLocomotionJSON()`, and inspector report. Initial implementation was headless/on-demand and therefore produced no visible experiment; user inspector confirmed `lastReport=null` at build `04c1b6fa`.
- `shell/codex/entropy/world.js` (commit `b01f2f87`): fixes that usability gap by automatically running the simulation at startup and looping a visible gold sphere through the precomputed sampled trajectory, independently of the live Wanderer. The display interpolates between exported samples; the underlying simulation is **precomputed**, not live integrated each render frame. `lastReport` contains the chronological data. The original Wanderer, IK visual follower, and Genesis remain untouched.
- `shell/LOCOMOTION.md` previously updated at `1fd2f116` to record the autonomous replay change.

**Observed parameters and results (from the user's JSON):**
- Terrain height `1.1500488281250023`; initial center `[1.3, 2.7300488281250024, 0]`; contact center height `1.3300488`.
- 360 simulation steps, 91 samples, seed 741 (recorded metadata; this scenario does not use randomness).
- Impact and settled at `t=0.5333333` s, impact speed `5.2266667` units/s.
- Maximum pre-correction penetration `0.0155556` units; final velocity `[0,0,0]`, `resting=true`.
- Initial potential energy `13.72`; kinetic energy rises during the fall and is zero after the inelastic impact. No persistent post-correction penetration or oscillation is reported.
- Ideal continuous free-fall time `sqrt(2*1.4/9.8)≈0.5345` s; measured fixed-step time is consistent with discrete integration. Reported FPS ~89.90 is an observation, not a benchmark or guarantee.

**Conclusion / scope:** Experiment 001 passes its *narrow* drop-and-settle criteria: finite trajectory, coherent impact transition, stable resting contact, no persistent penetration. It does **not** establish a general collision/contact solver, friction, locomotion, sloped support, or physical IK. The current constraint is a terrain-height floor with an inelastic vertical correction.

**Next experiment:** horizontal velocity and momentum interacting with contact: accelerate, slide, frictionally settle, encounter slope/support loss, and fall with continuous velocity. Keep fixed-step deterministic runs, event-rich telemetry, and automated visible playback. Compact exported reports by retaining event-adjacent samples and useful periodic samples rather than long identical rest tails; preserve full underlying history or reproducibility. Do not return to reactive gait threshold tuning.


### H. Experiment 002 — momentum and support (committed; browser evidence pending)

Commits: `03b71cae` scaffold, `3f6da2bf` physics/telemetry, `7250f456` Entropy integration.

`arcana/locomotion/momentum-trial.js` adds an independent, deterministic fixed-step trial with initial horizontal impulse, Coulomb-style speed decay while supported, gravity, terrain-height support tests, and chronological telemetry. Defaults: x=-2.2, z=0, horizontal speed 2.2, friction coefficient 0.65, gravity 9.8, radius 0.18, 120 Hz, four simulated seconds, samples every eight steps. Events report impulse, support loss, and contact regain; summary reports airborne duration, contact transitions, pre-correction penetration, and final state. It is **not** a complete friction/contact model: the current normal is always vertical, slope tangential acceleration is absent, and terrain heights are sampled at the center rather than a full sphere contact manifold.

Entropy precomputes both trials at startup and alternates the same gold sphere's visible replay in five-second slots; the inspector includes `momentumReport` beside the previous `lastReport`. `globalThis.entropyMomentumJSON()` exports the second report. This preserves the original Wanderer's movement authority. The new trial is committed but **not yet browser-verified**. Inspect the next executing build's `momentumReport.status`, chronological x/velocity, events, and actual visible playback. If the flat terrain never causes support loss, record that honestly; do not infer an edge event. Then progress to deliberate terrain discontinuity, slope normals, and continuous velocity through flight/contact transitions.

Note: this experiment is a **separate provisional integrator**, not yet the shared force/contact engine. Consolidate proven physics primitives before adding articulation.


### I. Experiment 002 observed; architecture reset decision (2026-10-16)

**Browser evidence:** executing SHA `7250f4568f78e7f46d38e6dddee3ff6aa58b40f9`, FPS ~60.33; momentum report completed with 480 steps, 61 samples, x -2.2 → -1.8292062 (travel 0.3707938), vx 2.2 → 0, zero airborne time and zero contact transitions, final resting=true, max pre-correction penetration 0.0006806. This validates only flat-ground frictional deceleration. No support loss or slope behavior was exercised.

**User-visible failure:** the sphere teleported. Source inspection confirms alternating two precomputed trajectories every five seconds (drop at x=1.3, momentum at x=-2.2); this is a replay-switch artifact, not simulated transport. Worse, the replay sample index uses drop trial's sample interval even while playing the momentum report (1/30 s vs 1/15 s), so momentum animation timing is incorrect. This must not be accepted as a trustworthy visual physics witness.

**Architectural finding:** drop and momentum were separate integrators, each precomputed independently. A timer animated recorded states, not a physical body. The inspector was burdened with long resting sample tails. This conflated experiment runner, physical authority, visualization, and observation. Do not patch the alternating replay.

**Reset:** retain this ledger and historical Arcana experiment files as reproducible evidence, but remove their runtime imports, global exports, replay timer, and playback controller from Entropy. Build one minimal reusable Arcana physical body with a single authoritative position/velocity state advanced by fixed timesteps inside `world.update`. The render mesh reads that state only. Terrain supplies support; gravity always acts; an impulse changes velocity rather than choosing a prerecorded trajectory. Instrument transitions and compact summaries without driving the body. Do not alter Wanderer navigation, its IK follower, Genesis, or unrelated world systems. No artificial scenario switching or teleportation. Browser verification required before declaring success.


### J. First continuous-state acceptance run (source commit `f3b7fec9`; runtime unverified)

Entropy now applies **one** horizontal velocity impulse (+2.2 x) immediately after its single live kinetic body first contacts terrain. The body begins 1.4 units above support, falls under gravity, contacts, receives the impulse once, then decelerates under contact friction. No precomputed samples, replay clocks, alternating scenarios, or position resets. Inspector `kinetic body` exposes live time, steps, position, velocity, contact, impacts, correction and bounded events. Original Wanderer remains independent.

**Acceptance from next user browser inspector:** executing SHA at least `f3b7fec9`; `kinetic body.mode='live fixed-step'`; chronological events show first contact then impulse; final x greater than 1.3, vx approaching zero, contact true, impact count 1, no position jump. A single snapshot cannot establish smoothness; source confirms continuous state, but actual visual judgment remains pending. No further scaffolding until this proof.


### K. Browser-observed continuous-state proof (executing build `0eea4bca0e45b6b6eb6b44712cdbb9c3855af237`)

User-provided inspector: 74.834 FPS; `kinetic body.mode='live fixed-step'`, `step=1/120`, `steps=316`, `time=2.6333`; contact at t=0.5333 x=1.3, impulse +2.2 x at t=0.5333, final position [1.67079,1.33005,0], velocity [0,0,0], contact true, impacts=1, max pre-correction penetration=0.015556. Displacement 0.37079, consistent with earlier isolated momentum trial (0.3707938). This confirms the reset is running in the browser, with live state, contact, impulse and frictional rest; it does **not** independently verify visual smoothness, support loss, slope behavior or articulated physical locomotion. The current body is a simple vertical heightfield contact model, not a general rigid-body solver. Preserve this result as baseline before extending physics.


### L. Live flight/contact transition trial — source commit `c4b29268`, browser unverified

After the browser-verified drop and frictional slide, Entropy applies one upward velocity impulse of +3 once the body is supported, stopped horizontally, and simulation time exceeds 1.2 s. The existing kinetic body then handles gravity, loss of support, ballistic motion and landing. No second integrator, replay, timer-driven positions, or terrain modification. Expected chronological events: first contact, horizontal impulse, vertical impulse, support-lost, second contact. Note that this tests vertical launch and reacquisition of support, **not** running off an edge. Confirm executing SHA, events, impact count=2, positive airborne interval (observable via event times), and settled final velocity from browser inspector. Source commit alone is not runtime proof.


### M. Browser-observed flight and landing (executing build `c4b29268465ce8b26ccacfd86059df9722679b36`)

User-supplied inspector: 80.866 FPS; `kinetic body.mode='live fixed-step'`, dt=1/120, time=3.5583, steps=427. Chronological events: first contact at 0.5333 s (x=1.3), horizontal impulse +2.2 at 0.5417 s, upward impulse +3 at 1.2083 s, support lost at 1.2167 s, contact regained at 1.8167 s. Measured event-to-event airborne interval 0.6000 s (ideal flat-ground ballistic flight ~0.6122 s). Final position [1.67079,1.33005,0], velocity [0,0,0], supported=true, impacts=2, max pre-correction penetration 0.015556. No reset or prerecorded replay; the same body carries state through both events. This passes the narrow support-loss and landing test. It does not establish edge departure, slopes, three-dimensional collision, or physical limb support. No visual smoothness assessment was supplied.


### N. Gravity ownership refactor (source `44b07836`; runtime verification pending)

Gravity is now a world-owned, injectable acceleration field in `shell/arcana/physics/gravity.js`. `createGravitySystem` composes named components additively, supports registration/removal, validates finite vector contributions, and exposes component inventory. `uniformGravity` supplies the baseline downward surface field; `radialGravity` supplies a softened position-dependent attractor. The kinetic body requires a gravity system and samples it each fixed step, integrating all three velocity axes. Contact friction uses the local downward acceleration magnitude as a provisional flat-support normal load; this is **not** yet a general arbitrary-gravity contact solver. Entropy owns `world.gravity` and injects the baseline surface component. Other bodies and underworld regions can later consume the same field without duplicating gravity constants.

**Acceptance:** next browser inspector should show a `gravity` system with `surface` uniform component and the same kinetic contact/impulse/support-loss/contact sequence as the previous verified run. The current source changes have not yet been browser-verified. Complex field routing, region masks, nonvertical contact normals, and underworld gravity are future work; do not claim they are already implemented.


### O. Browser-verified gravity ownership regression (executing build `34dddc9b226a68647726fb5ef0265329d431167e`)

User inspector reports FPS 76.7055; `gravity` system present, `mode='additive acceleration field'`, registered component `{id:'surface',kind:'uniform'}`. The live kinetic body runs at 1/120 s, time 3.3833, steps 406, position [1.67079,1.33005,0], zero velocity, supported, impacts=2, max pre-correction penetration=0.015556. Contact 0.5333, horizontal impulse 0.5333, vertical impulse 1.2083, support loss 1.2167, landing 1.8167. All physical outcomes match the pre-refactor browser baseline. This verifies world-owned gravity injection preserves the surface experiment. It does not yet verify radial components, underworld routing, or nonvertical contacts.


### P. Terrain contact authority (source `ed221815`; browser test pending)

Extracted contact response into `shell/arcana/physics/terrain-contact.js`. The kinetic body no longer accepts or invents a friction coefficient and no longer clamps vertical contact velocity itself. Contact system samples the signed-field top-surface query, obtains terrain material identity via `terrain.materialAt(x,height,z)`, and reads existing terrain-owned `contactProperties`. Entropy explicitly selects the pre-existing **dissipative** profile (restitution 0.24, friction 0.86), since the existing standard profile has restitution 0.38 but **no friction coefficient**. We did not fabricate a missing standard coefficient. Contact resolution applies restitution to incoming vertical velocity and friction to tangential velocity while supported. The threshold for numerical resting contact is one gravity step, not an authored material coefficient. This intentionally changes the prior zero-restitution experiment: expect bounces, more contact events, different sliding distance and potentially later scripted launch; do **not** compare event times as an unchanged regression. The trial remains heightfield-top-only with vertical contact normals, no slope normals, underworld or general collision response. Material IDs are observed but do not yet select a per-material profile. Existing Wanderer and articulated follower untouched.

**Browser acceptance:** gravity, terrain contact and kinetic body all appear in inspector; terrain contact reports dissipative and {restitution:0.24,friction:0.86}; sphere bounces on first landing then settles, slides, launches, loses support and lands again; no exception or nonfinite state. Inspect and record actual behavior before declaring success.


### Q. Browser-verified terrain contact ownership (executing build `2265f1d94b431036084f1071bd512e4b2fc6af3f`)

User inspector: 86.1654 FPS, terrain contact reports `mode='top-surface heightfield'`, `profile='dissipative'`, `source='terrain.contactProperties'`, restitution .24 and friction .86. Gravity remains surface uniform. Kinetic body at 4.3333 s (520 steps, 1/120 s): position [1.59637,1.33005,0], velocity zero, supported true, impacts 8, max pre-correction penetration .015556. Initial bounce sequence settles to support at 0.85 s; horizontal impulse +2.2 at 0.85 s; vertical impulse +3 at 1.2083 s; support lost 1.2167 s. Second landing at 1.8167 s rebounds vy .7108, subsequent contacts at 1.9583 s (vy .16261), 1.9833 s (vy .01977), and settles at 1.9917 s. Horizontal displacement .29637 versus .37079 under old body-owned friction .65. Narrow acceptance passes: terrain-owned friction/restitution demonstrably affect live body. The 8 impacts include repeated bounces. Still top-only heightfield contact; not yet terrain-normal geometry, per-material mapping, or arbitrary gravity contact.


### R. Volumetric terrain contact: cliffs, boreholes, underworld (browser test pending)

**Design decision:** heightfield lookup cannot describe the signed volume's vertical borehole walls, rim, underside, or lower surfaces. Contact geometry must come from the existing extracted terrain triangles and signed field; no replacement terrain. At the rim, a sphere remains in contact while its volume overlaps solid even if its center is over empty space; walls provide horizontal normals, friction resists sliding, and support is not inferred from wall contact. One kinetic state continues through holes into the underworld; gravity remains injected and restitution/friction remain terrain-owned.

Implementation commits: `e04672c8` adds `terrain.sphereContact(center,radius)` with closest triangle point, signed-volume inside/outside, outward normal, penetration and material identity; `fc43c472` resolves normal collision impulse, tangential friction and support classification in terrain contact; `3fbf008c` wires Entropy to the volumetric API. Existing Wanderer/IK untouched. **Unverified:** this is a discrete sphere-vs-triangle contact, not continuous swept collision, so high-speed tunneling remains possible. Only one nearest contact is resolved per step; complex multi-contact corners may need iteration. Profile remains explicitly dissipative; per-material coefficients not yet mapped. Entropy's current atlas terrain does not automatically provide a borehole test trajectory. Do not claim rim/wall/underworld behavior browser-proven until tested with a genuine opening. Browser acceptance first: no startup errors, bounce and support remain coherent, frame rate acceptable, signed-volume contact reported. Next fixture: controlled rim crossing, wall strike and passage to underside.


### T. Bounded contact and borehole trial — awaiting browser verification

Source commits: `dbd93a94` and `80eb77d8`. Sphere contact now initializes nearest-triangle squared distance to `radius²` for centers outside the solid signed volume, so bounding-box rejection excludes candidates beyond the actual sphere envelope. **If the center is already inside solid**, the search remains unbounded to recover the nearest exit surface. All 81 chunk bounding boxes are still visited; triangle candidates are locally bounded. No speculative motion margin is added: the discrete solver checks only the post-step sphere, and high-speed tunneling remains possible.

Entropy alone now supplies a deliberate `testBorehole={x:3,z:0,radius:1.1}` to its existing atlas terrain. The terrain's existing `through-hole` signed-field operation cuts a full-depth shaft without replacing the terrain. The same kinetic sphere starts at x=1.3, falls and settles, then receives one horizontal velocity impulse +6 along X toward the rim. Previous automatic upward impulse is disabled **for this fixture**. Inspector identifies the borehole trial and its intended behavior. No new physics authority, scripted trajectory, teleport or change to Wanderer/IK.

**Acceptance to check in live browser:** build identity matches; terrain operations show one through-hole at (3,0) radius 1.1; contact queries and triangle tests continue; sphere reaches rim, support changes naturally, wall contacts yield lateral normals and eventually enters the shaft if trajectory permits; body remains finite; performance at least 60 FPS. A single shot may strike the far wall or rebound instead of traversing the hole; report what actually occurs, not intended outcome. Current contact inspector does not yet record normals or contact points per event; those must be added if needed to distinguish rim/wall contacts reliably. This is a temporary Entropy trial fixture, not a permanent terrain feature.


### U. Browser borehole observation (executing build `3b138c47f8a396d72520ec9d03a940105abb4206`)

User inspector reports 72.3277 FPS, 784 sphere queries, 326 triangle tests, 63354 chunk rejects, with one atlas through-hole at (3,0), radius 1.1. Kinetic body at t=6.5333, 784 steps, final position [-1.7901,-152.54303,10.20976], velocity [-1.11608,-54.87653,1.95732], unsupported, 7 impacts. Horizontal impulse +6 at t=.85, support lost at t=.95 near x=1.8614; subsequent contacts at t=1.3417 x=3.9057, t=1.3833 x=3.8923, t=1.5083 x=3.8182. Reported bounce vy values -3.9982, -4.40653, -5.63153: these are vertical components, not necessarily invalid rebounds from sloped/vertical walls. The body subsequently exits the terrain region and falls indefinitely under world gravity; do not claim it followed a clean shaft trajectory. Bounded triangle work is 326/784 ~0.42 triangle tests per step, versus prior ~231; FPS snapshots not controlled. Next: record contact point, outward normal and pre/post normal velocity per collision; evaluate wall response and whether the body escapes through an opening. No artificial capture, floor, or trajectory steering.


### V. Wall collision instrumentation — awaiting browser verification

Commits `8756dffa` and `3e42327d`: contact solver returns observed closest point, outward normal, material ID, inside/outside, penetration, incoming normal velocity, post-normal-impulse rebound speed, load, and support classification. Kinetic inspector retains `lastContact`, counts `wallContacts` (normal |y| < .5), and adds observation to contact and bounce events. `wallContacts` counts fixed-step observations, not unique impacts; `lastContact` is the most recent collision even after separation. A negative world-space vy in a bounce event is not by itself a collision failure: compare signed normal velocity before and after impulse. No change to dynamics, terrain, launch, or Wanderer. Browser test: look for wall contacts and normal velocities that change from negative to positive; assess if the body is ejected or traverses the shaft. Do not claim wall correctness before observing runtime.


### W. Browser-verified borehole wall collision (executing `a3b01ff2bc07737e4ba74e76ed0ef2b09ce97fdb`)

User runtime: 79.1177 FPS; 670 fixed steps and collision queries; 326 triangle tests, 54120 chunk rejects; 3 wall-contact observations. Borehole through-hole at (3,0), r=1.1. Support lost t=.95 near x=1.8614. Three horizontal-normal wall collisions: t=1.3417 incoming normal speed -4.8298031, rebound +1.1591527; t=1.3833 -0.2293242 to +0.0550378; t=1.5083 -0.4821959 to +0.1157270. All satisfy restitution 0.24, normals have y=0, normal load=0, supported=false. Negative world vy during bounce events is correct for vertical shaft walls and does not contradict positive rebound normal speed. Body t=5.5833 at [-0.72983,-104.79378,8.3503] continues falling after leaving modeled terrain. Conclusion: observed rim departure, three correctly directed horizontal wall responses, and downward passage; not evidence of bounded underworld or continuous collision. No physics modification warranted on this evidence. The 79 FPS sample is above 60 FPS floor but not a controlled benchmark.


### X. Contact-driven propulsion experiment — awaiting runtime acceptance

Borehole at (3,0), radius 1.1 remains in atlas terrain. The live Entropy kinetic sphere no longer receives the automatic +6 impulse. New reusable `shell/arcana/physics/contact-drive.js` requests horizontal force **toward negative X**, away from the hole, only while supported. Force is capped by terrain's dissipative friction coefficient times gravity normal load and actuator mass. Kinetic body samples this actuator before its single fixed-step integration; it retains the previous supported contact, and its inspector remains authoritative. Drive phases: accelerate until t=2.5 s, coast until t=2.75 s, brake thereafter. The drive inspector reports phase, requested force, applied steps and peak speed. The current solver skips passive tangential drag on powered-contact steps to avoid counting friction twice against drive traction; this is a simplified friction-budget policy, not a complete static/dynamic friction or wheel/foot traction model. Coast uses terrain passive friction. No velocity assignment, automatic launch, teleport or second integrator. Original Wanderer and articulated follower untouched. Acceptance: build and startup, body initially settles, supported propulsion accelerates along -X, coasting loses speed under terrain friction, braking applies opposing force before stop, no unsupported thrust, 60+ FPS. **Not yet browser verified.**


### Y. First physical foot — single planted stance (browser acceptance pending)

The prior contact-drive runner was browser observed at build `3e458494`: 72.09 FPS, x=1.3 to -6.50253, final velocity zero, 305 powered steps, peak speed 5.875; coast-versus-brake attribution not independently instrumented. Replaced the active actuator in Entropy with reusable `shell/arcana/locomotion/planted-foot.js`. A single foot is planted at the kinetic sphere's world-space X/Z on first support and remains fixed; visible teal sphere marks that anchor. While supported, and only until body displacement from the anchor reaches 0.9 units, the foot requests -X force capped by friction * normal load * mass. The existing kinetic body's 120 Hz integrator and terrain contact solver remain sole motion authority. Beyond stroke reach the actuator requests zero force and passive terrain friction stops the body. Inspector exposes anchor, stroke reach, extension, plant count, powered steps, and phase. This is an initial fixed-anchor *stance actuator*, not yet a constrained articulated leg or a full reciprocal stepping gait: no leg-length projection, load transfer, swing, or replant. Borehole remains at (3,0), radius 1.1. Original Wanderer and its visual IK follower untouched. Acceptance: foot marker remains fixed in world coordinates, body advances in -X only while planted and supported, actuator cuts out at 0.9 stroke, then body coasts/stops under friction; no unsupported propulsion, 60+ FPS. Await executing build snapshot.


### Z. Browser finding — planted foot left behind (executing build `1a95ecfb7e418d5f718d5697c8313d825c3bf770`)

User runtime at t=5.05 s: 72.316 FPS, 606 fixed steps, body position [-3.2004,1.33,0], velocity [0,0,0], supported=true. Foot anchor [-0.98741278,1.14999998,0], prescribed reach=0.9, inspector `extension`=2.21299056, plantCount=8, poweredSteps=154, phase=release, forceX=0, slip=0. Borehole retained at (3,0), radius 1.1. **FAIL for constrained-leg acceptance:** anchor/body X separation ~2.213 > 0.9. The current foot only stops applying propulsion at the stroke limit; it imposes no body-to-foot distance constraint, so momentum carries the body past the planted anchor. `extension` is a historical maximum rather than instantaneous measurement; `slip=0` reports an unmoving anchor, not valid leg reach. Repeated tiny vertical support-loss/recontact events caused 8 plantings on essentially flat terrain, not 8 deliberate steps. Physics foundation still works, but this is an anchored force marker, not yet a physical leg. Next: introduce a real maximum-distance unilateral leg constraint with contact-consistent reaction/impulse and measurable violation, and stabilize resting support to avoid spurious replants. Do not hide overextension by moving the anchor, clamp the body position without physical accounting, or change original Wanderer. No implementation of this fix is claimed yet.


### AA. Gait cycle prototype (browser verification pending)

Build `eba77bd1`: first stance / release / swing / replant loop in `planted-foot.js`. At 72% of the 0.9 horizontal reach, the anchored foot releases. While swinging it commands no ground force and the tether is inactive. A target is selected ahead in negative X, swing advances at a prescribed rate, and a new anchor is accepted only when the terrain surface query returns finite elevation AND the kinetic body's contact resolver reports support. Stance resumes through the original friction-bounded actuator. `kinetic-body.js` passes current support into the constraint hook; Entropy supplies the terrain query and displays the current target when unplanted. Inspector now reports swing target/progress, releases, replants and failed plants. The original Wanderer and borehole are unchanged. Limitations: the swing is prescribed, not a simulated inertial foot; target display jumps to the destination rather than animating a lifted foot; terrain height query is not a separate foot collision solver; support jitter may still affect gait. The earlier horizontal tether constraint remains in stance. Await browser verification of actual cycles, reach, contact gating and FPS before claiming walking.


### AB. Browser acceptance: first repeated gait (build `00a12923`)

User inspector at 9.3333 s / 1120 steps: body x=−6.86501 from x=1.3 (8.16501 units), vx=−1.26667; 8 plants, 7 releases, 7 completed swings, zero failed plants, poweredSteps=596, reach=0.9, current extension=0.0921083, maximum pre-correction violation=0, correctionTotal=0, radialImpulseTotal=0. No wall contacts. **Repeated replant and sustained travel accepted.** FPS 59.93048; user explicitly says ignore FPS unless below 55. Outstanding: 43 impacts and 141 unsupported steps with tiny rebound/support jitter; swing remains prescribed and foot marker jumps to target. Preserve borehole and original Wanderer. Next: quiet resting-contact micro-bounces and make swing foot visibly interpolate without changing physical body authority.
