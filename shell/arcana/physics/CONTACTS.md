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
