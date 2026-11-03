# Arcana — unified contacts

**Status:** architectural contract; not yet implemented or wired. **First consumer:** Strand's Stone & Root bricks and atlas terrain. Keep existing Genesis, Entropy, Europa, Wanderer, BB debris, meteor, vessel, and locomotion behavior unchanged until explicitly migrated and regression-tested.

## Principle

**Everyone shares contact mechanics; each material pairing chooses its physical response.** Shape detection is not material response, and neither should depend on rendering or a named world. An object may be rigid, compliant, deformable, anchored, articulated, or a static boundary. A material can influence contact impulses and also emit persistent world changes.

## Layers and ownership

1. **World / scheduler:** fixed timestep, gravity, body registry, broad phase, contact cache, sleep/wake, deterministic stepping, telemetry. Owns the only authoritative integration of registered bodies. No per-population second gravity pass.
2. **Shape adapters / narrow phase:** generate contacts for box–box, sphere–sphere, sphere–terrain, convex–terrain, later capsules and compounds. Terrain's signed field is an implicit occupancy function, **not guaranteed a signed distance**. Use bracketing/sweeps or surface projection to estimate actual separation; do not equate field value to penetration depth.
3. **Contact manifold:** stable pair IDs, one or more world-space contact points, outward unit normal from A toward B, separation/penetration in length units, local anchors, relative contact velocity, optional feature IDs. Retain and warm-start stable contacts.
4. **Shared mechanics:** impulse at contact points, inverse mass and world-space inertia, angular velocity, nonpenetration, static and kinetic Coulomb friction, restitution threshold, positional stabilization, island sleeping/waking. Friction must oppose tangential relative velocity and support rest under gravity; do not approximate with unconditional velocity multipliers.
5. **Material pair resolver:** material IDs on colliders; symmetric pair lookup with explicit overrides and sane defaults. Return coefficients and optional constitutive laws (adhesion, compliance, rolling resistance, yield/fracture, soil compaction). Contact mechanics stays shared; pair-specific resolution may run before/after impulses without bypassing conservation bookkeeping.
6. **World effects:** return explicit events for terrain deformation, damage, fracture, anchoring, uprooting, BB release, etc. Owning systems commit those changes after the physics step. No implicit mutation inside shape queries.

## Proposed data boundaries (design, not a published API)

- Body: stable id, type (static/dynamic/kinematic), pose, linear/angular velocities, inverse mass, inertia tensor, awake state, colliders.
- Collider: shape adapter, transform relative to body, material ID, collision group/mask, sensor flag.
- Contact: body/collider IDs, point(s), normal, signed separation in meters, stable feature IDs.
- Material: immutable descriptor with density and contact properties. Density determines mass/inertia when a body is built; **mass alone does not create friction**.
- Pair response: staticFriction, dynamicFriction, restitution, restitutionVelocityThreshold, rollingResistance, compliance, adhesion, and optional event rules. Pair mixing must be deterministic and documented.
- Event: IDs, contact location/normal, impulse/work, participating materials, proposed state change. Dispatch after solving.

## Initial material interactions (behavioral targets, not tuned constants)

| Pair | Target |
| --- | --- |
| Stone / stone | Low restitution; high static friction; stable stacked courses; heavy impacts can topple stacks |
| Stone / soil | Static friction and terrain support; compaction/deformation only after an explicit soil model exists |
| Stone / ice | Low friction; sliding remains possible |
| Wood / stone | Directional friction and compliance; fracture only when material model is enabled |
| Root / soil | Adhesion and anchored support; uprooting when forces exceed constraints |

Do not infer physical properties solely from the visual color, shader, or mesh name. Terrain surface material must come from a geology/material query, initially a conservative default.

## Strand migration sequence

1. Preserve the current Strand brick-rain source and existing world baseline as rollback. Build a **headless deterministic contact test harness** before replacing the Strand solver.
2. Implement body/material/contact records and the fixed-step scheduler; keep world-specific rendering as a read-only view of physics poses.
3. Implement OBB–OBB face manifolds and box–terrain contacts with valid separation distances. Add broad-phase culling, sequential impulses with angular inertia, warm starting, positional correction, static/dynamic friction, and stable island sleeping.
4. Migrate only Strand's bricks and atlas terrain to the shared world. Remove Strand's duplicate brick integrator/solver only once parity is proven. Terrain is a static collider, not a dynamic mesh.
5. Add material-pair tests and material events. Verify terrain deformation only after its ownership/coordinate contract is explicit.
6. Instrument contact count, pair count, solver iterations, penetration depth, kinetic energy, sleep/wake transitions, frame cost, and material events.
7. Only then evaluate migration of BB debris, Wanderer, vessel contacts, creatures, roots, and other worlds individually. Never rewrite their behavior merely to enforce architectural uniformity.

## Acceptance gates

- A single brick falls, contacts terrain, loses energy, and comes to rest without perpetual creep or penetration.
- Two bricks and a multi-course pile stack without jitter; contact impulses can wake a sleeping stack when struck.
- On a shallow stone incline, static friction holds the brick. On an ice incline of the same slope, it slides.
- A tipped brick rotates under off-center impact and settles according to its actual support polygon.
- A removed supporting brick can collapse the pile; nothing remains frozen without support.
- Physics results are reproducible under different render frame rates using a fixed step and deterministic ordering.
- No NaNs, unbounded energy injection, or runaway contact counts. Preserve existing Arcana consumers until their migration passes explicit regression tests.
- Read back source, inspect Pages workflow and published build, and distinguish deployment from actual browser verification.

## Existing Arcana machinery to preserve

- `physics/wanderer-contacts.js`: gravity, contact reflection, signed-field normal, vessel catch. Its `reflectContact` is an existing lightweight response, **not** a resting-contact solver.
- `physics/bead-debris.js`: current debris ownership and collision/capture contract. Do not break nested-vessel semantics.
- `terrain.js` and `terrain-surface-query.js`: authoritative implicit terrain and surface query.
- `codex/strand/brick-rain.js`: initial visual and OBB SAT prototype. Its sliding/creep is a known limitation; it is the first migration candidate, not the canonical Arcana solver.

## Next implementation action

Start with an isolated, deterministic, headless **one-box-on-terrain** test and contact data model in `shell/arcana/physics/`. Prove static friction and rest before integrating piles or moving any other world. Avoid new dependencies until the necessary mechanics are understood and measured.

## Scale and performance contract

Performance is a design constraint from the first implementation, not a later optimization. **One contact architecture does not imply one solver cost per object.**

- **Rigid-body tier:** thousands of boxes, rocks, structures, and articulated parts use broad-phase candidate generation, persistent manifolds, warm-started impulses, sleeping islands, and awake-only narrow-phase/solver work. Static terrain participates through localized spatial queries, not all-pairs comparisons.
- **Particle tier:** tens of thousands of BBs or grains use structure-of-arrays/typed-array storage, spatial bins or hashed grids, batched sphere/field queries, and purpose-built neighbor/contact kernels. Do not instantiate one full rigid-body object, Three.js mesh, or generic manifold per BB.
- **Aggregate tier:** inactive granular populations may use a validated coarse representation, occupancy/heightfield, or bonded cluster where the world semantics permit. Wake or refine only where impacts, extraction, or deformation require individual behavior. Never silently discard BB identity or ownership semantics.
- **Broad phase:** scale with occupied spatial cells and plausible neighbors, not O(N²) all-pairs. Measure pathological dense clusters as well as sparse populations; spatial hashing alone does not guarantee cheap dense contacts.
- **Memory and allocation:** preallocate/reuse working buffers and contact records, prefer stable numeric IDs and contiguous storage, and avoid allocations in hot contact loops. Keep renderer state separate from physics state.
- **Scheduling:** fixed physics step with bounded catch-up, budgets for broad phase/narrow phase/solve, stable deterministic ordering where required, and sleep/wake propagation across support islands. Avoid silently dropping essential collision work to meet a frame budget.
- **Collision detail:** per-population shape adapters and solver kernels can be specialized, while contact conventions, material-pair laws, event accounting, and telemetry remain shared.
- **Instrumentation:** measure body/particle counts, awake counts, candidate pairs, actual contacts, solver iterations, CPU time by stage, allocation/GC pressure, and p50/p95/p99 frame cost. Verify correctness and throughput together.

### Performance gates

Benchmark a single body, 72 falling bricks, 1k/5k/10k rigid bodies, and a separate 25k-BB scenario with sparse, clustered, and disturbed distributions. Record actual hardware, timestep, frame budget, density, awake fraction, and contact counts before declaring capacity. These are **test workloads, not claims of achieved performance**. Preserve existing BB ownership and capture behavior during any future migration.

## Terrain decision — Strand stone baseline (2026-11-03)

All existing Strand terrain is **stone**, including flats, hills, mesas, and slopes. Reuse the existing authoritative atlas signed field and surface geometry; do not add a substitute platform to the Strand scene. A separate headless planar fixture remains useful for deterministic unit tests only.

Keep two independent spatial queries: **occupancy** \(\phi(x,y,z)\), already provided by the terrain signed field (positive means solid), and **material** \(M(x,y,z)\), initially a constant stone ID. Future material layers may be scalar fields (density, stone/soil/ice fractions, moisture, cohesion, etc.), sampled at each contact point. Material transitions require deterministic mixing and explicit physical units; do not mistake a field value for geometric distance or infer materials from rendered colors.

The shared contact generator derives geometry, normals, and physically meaningful separation from occupancy. The pair resolver samples material at contact positions and selects the response. For mixed or deformable terrain, owning geology systems handle material state changes after solving. Initial migration target: stone bricks colliding with existing stone terrain, followed by stone–stone piles on actual hills and mesas.
