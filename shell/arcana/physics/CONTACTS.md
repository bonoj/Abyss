# Arcana Physics — material, provenance & contact SST

**Status:** authoritative design contract, **not implemented**. **Scope:** all Abyss material/collision consumers. **First migration:** Strand stone bricks ↔ existing atlas terrain. **Invariant:** one contact convention and mechanics; material-pair-specific response; geometry, geological provenance, and rendering are distinct. This document supersedes earlier CONTACTS proposals where they conflict. No runtime consumer is migrated merely by editing this file.

## Existing source of truth (verified 2026-11-03)

| Source | Existing contract / limits |
| --- | --- |
| `shell/arcana/terrain.js` | `createTerrain({topology:'atlas'})`; 85×21×85 signed occupancy grid, positive **inside** solid; 85×85 v2 atlas, 85×85 horizontal extent ±25.2, Y −3.6…3.6; tetrahedral extracted triangle chunks, local re-extraction after impacts/extraction. `sample(x,y,z)` returns interpolated occupancy, **not a guaranteed metric SDF**. |
| `terrain.atlas.fields` | `jurisdiction`, `gradientWeight`, `elevation`, `substrate`, `hydrology`, `provenance`, `strata`, `population`, `features`; typed arrays. Some are allocated but not meaningfully populated: do not claim that `provenance` is already an operative lineage model. Atlas `substrate` and `features` are initialized for mesas/ridges. |
| `terrain.materialAt(x,y,z)` | Returns `{id,depth,sourceSubstrate,material}` for derived strata; for positive occupied deposited nodes, returns `{id,depth:0,sourceSubstrate:null,material,lineage}`. **Lineage is conditional**, not guaranteed for every point. Derived layers use substrate and depth, not a constant stone material ID. |
| `terrain.materials` | IDs 0 neutral bedrock, 1 warm soil, 2 basin sediment, 3 cold regolith, 4 weathered subsoil, 5 deep bedrock. These are existing geological/material identities, not calibrated contact coefficients. Preserve IDs and accounting. |
| `terrain.deposits` | `Map` of deposited material records keyed by 3D lattice index; may include `lineage`. `extractNodes` preserves material accounting per removed positive lattice node; **node counts are not calibrated volume or mass**. |
| `terrain.sphereContact(center,radius)` | Returns closest triangle point, outward normal, penetration, `inside`, `materialId`; uses chunk bounds and precomputed triangle AABBs. Existing sphere adapter is not a box manifold nor a universal contact solver. |
| `terrain.sphereClearance`, `intersectsSphere` | Existing surface proximity/intersection paths; `terrain-surface-query.js` finds top signed-field crossing. Preserve their coordinate/offset semantics. |
| `terrain.impact`, `extractNodes` | Modify occupancy and rebuild affected chunks. Material mutation/lineage must remain owned by geology, not silently applied inside contact queries. |
| `physics/wanderer-contacts.js` | `reflectContact`, signed-field gradient normal, vessel underside handling; **no persistent resting contacts**. |
| `physics/bead-debris.js` | Existing BB collision/capture and ownership changes across terrain, vessel, Abiogenesis and Wanderer. Migration must preserve ownership, coordinate frames and one-way entry behavior. |
| `codex/strand/brick-rain.js` | 72 beveled Stone & Root bricks; per-brick integration, 8-corner terrain tests, OBB SAT pair checks, simplistic impulses. Known perpetual sliding; prototype only. |

**Strand policy:** treat every existing terrain point as **stone for contact response**, including flats, hills and mesas, **without changing** `materialAt`, substrate, stratigraphy, deposited lineage, extraction counts, or atlas values. Implement a **Strand-only physics-material mapping** from existing geological IDs to the stone response. Geological identity ≠ physical response class. Do not globally relabel materials 1–5 as stone.

## Canonical queries and data flow

```text
terrain occupancy sample / extracted triangles ──> shape adapter ──> contact manifold
terrain materialAt(point) + optional fields ────> provenance/material sample ─┐
body collider material identity ──────────────────────────────────────────────┤
world policy: geological ID -> physical response class ───────────────────────┤
                                                                             v
                                           deterministic pair resolver -> shared solver
                                                                           |
                                    impulses / sleep / wake + material events
                                                                           |
                                     owning terrain/population applies effects
```

**Do not create a second terrain material registry as an alternative authority.** A physics registry of response coefficients and pair laws is allowed; it references geological IDs/classes via an explicit adapter. Geometry occupancy, material identity, provenance, and physical response must remain separately queryable.

### Point-sampling contract

- `occupancy(point)`: current terrain `sample`, positive solid; never interpret its numeric magnitude as penetration distance. Find actual contact location/separation via surface projection, bracketing or extracted triangles.
- `materialAt(point)`: existing authoritative lookup; sample at **surface contact points** in terrain coordinates. Preserve `id`, `depth`, `sourceSubstrate`, and optional `lineage`; attach sampled atlas metadata only when meaningful and present. Do not fabricate lineage.
- `responseAt(point,otherMaterial,context)`: **proposed adapter**, not existing API; maps geological identity to physical class using world policy and resolves pair response. For Strand v1 all terrain IDs map to `stone`; future scalar fields may supply composition, density, moisture, cohesion, temperature, etc. Scalar material fractions must define interpolation, normalization, spatial resolution, and mixing rules explicitly.
- Spatial frames: terrain collision triangles and material queries use **terrain coordinates**. Wanderer/render offsets are separate. Adapters must convert exactly once; verify against existing `sphereContact` and `sphereClearance` conventions.
- Material changes are not automatically geometry changes. Excavation/deposition may update occupancy, material records, provenance and chunk revisions together; the terrain owner commits them atomically at a defined step boundary. Invalidate contact caches only for changed spatial regions.

## Shared physics contract (proposed, not public API)

| Layer | Responsibility |
| --- | --- |
| Physics world | Fixed-step scheduling, gravity, stable body IDs, broad phase, deterministic candidate ordering, contact cache, sleeping islands, instrumentation. Registered bodies integrate **once**. |
| Body/collider | Static/dynamic/kinematic body; pose, linear/angular velocity, inverse mass, world inertia; one or more colliders with shape, local pose, material identity, mask and sensor flag. Renderer mirrors physics poses, never drives collision geometry implicitly. |
| Shape adapters | OBB/convex ↔ convex; sphere ↔ sphere; convex/sphere ↔ terrain; future capsules, compound and deformable interfaces. Return geometrically valid contacts without choosing friction. |
| Contact manifold | Stable body/collider/feature IDs; normal convention **A → B**; world contact points, local anchors, metric separation (negative overlap), relative velocity, persistent impulse cache, terrain revision. Multiple support points for face contacts. |
| Shared solver | Normal impulses, angular inertia, restitution threshold, static/kinetic Coulomb friction, friction cone, stabilization without energy injection, warm start, sleep/wake support islands. Stable rest is emergent, not a velocity-freeze hack. |
| Material pair | Symmetric deterministic lookup with explicit override and documented fallback; static/dynamic friction, restitution, rolling resistance, adhesion, compliance, yield, fracture and optional anisotropy. Use measured/declared units; visual palette is irrelevant. |
| Material events | Post-solve records of pair IDs, provenance references, point/normal, impulse/work and proposed compaction, damage, fracture, deposition, excavation, anchoring or uprooting. Owning system validates/applies; no mutation during narrow phase. |

A single solver contract **does not** mean a heavyweight manifold per particle. Specialized kernels may implement equivalent normal/friction laws and events using cheaper representations. Pair properties must not bypass momentum/energy bookkeeping.

## Scale contract

- **Rigid tier:** thousands of bricks/rocks; spatial broad phase (grid/BVH as appropriate), localized static terrain queries, persistent manifolds, sleeping islands, warm starting, stable ordering; **never** global O(N²) pair loops.
- **Particle tier:** 25k+ BBs; structure-of-arrays typed buffers, spatial bins, batched sphere/field kernels, neighbor-only work, allocation-free hot paths, renderer-independent simulation. No Three.js mesh or generic rigid-body manifold per BB.
- **Aggregate tier:** validated sleeping/coarse representations for stable granular populations, with localized refinement/waking. Preserve per-BB ownership/identity and extraction semantics when required.
- **Dense-case caveat:** spatial hashing alone does not make dense clusters cheap; benchmark worst-case occupancy, broad-phase candidate counts, narrow-phase work, cache growth and GC.
- **Budget and telemetry:** awake/sleeping counts, bodies/particles, candidate pairs, manifolds/contact points, penetrations, kinetic energy, stage CPU timings, allocation pressure, p50/p95/p99 frames, cache hit rates, wake propagation. Fixed timestep and bounded catch-up must not silently omit essential collisions.

## Migration & verification gates

1. **Preserve rollback.** Existing Strand world and brick source remain untouched until a headless deterministic fixture proves new mechanics. Other worlds and their collision/capture paths remain unchanged.
2. **Implement shared records and a headless test harness** in `shell/arcana/physics/`. Use a planar stone fixture **only for unit tests**, not as replacement Strand terrain.
3. **Build terrain adapter around existing APIs:** verify sign convention, coordinates, extracted triangle contact points, true metric separation, materialAt sampling, per-chunk revision/cache invalidation. Avoid whole-terrain scans per body.
4. **Prove one brick on flat stone, then existing hills/mesas:** gravity, impact, static friction, rest, no creep, correct rotation under off-center load. Preserve Stone & Root geometry/bevel/palette.
5. **Add brick–brick face manifolds and island sleep:** two bricks, stacked courses, 72 sequential drops, wake on impact, collapse when support removed. Material pair is stone/stone for all current Strand terrain while original geological metadata remains available.
6. **Demonstrate material policy isolation:** test stone/stone vs stone/ice on same geometry via a test-only mapping; do not overwrite atlas substrate/provenance to manufacture ice.
7. **Performance gates:** measure 72, 1k, 5k, 10k rigid bodies and separately 25k BBs in sparse, dense and disturbed states. Record hardware, timestep, actual contacts, awake fraction and frame costs. These are targets, **not achieved benchmarks**.
8. **Migrate selectively:** only after Strand passes, consider BB debris, Wanderer, vessel, roots, creatures and other worlds; preserve ownership, impact accounting and runtime behavior.
9. **Publication truth:** verify committed source, Pages run, public build SHA and browser execution separately; no runtime claim from documentation alone.

## Explicit non-goals / unresolved decisions

- No new global material scalar field now: atlas already has provenance/substrate/strata and `materialAt`. Extend these interfaces when an actual new terrain type needs it.
- No claim that all atlas channels carry meaningful provenance today; `lineage` is optional and currently deposit-specific.
- No calibrated material coefficients, soil constitutive model, fracture model, fluid solver or erosion system yet.
- Decide stable material response IDs, mixed-field interpolation, persistent provenance identifiers, terrain revision API, and deterministic pair mixing **before implementation**; record decisions here rather than scattering competing contracts across worlds.

**Next action:** inspect terrain's existing chunk collision data and materialAt boundary behavior, then implement a headless stone box ↔ terrain adapter with persistent contacts and explicit Strand stone-response mapping. This document is the SST for all future Arcana material/contact decisions.

## Implementation ledger — 2026-11-03

**Prototype committed, runtime unverified.** `physics/stone-contacts.js` is a reusable initial impulse/contact kernel. `codex/strand/brick-rain.js` now uses fixed 120 Hz steps, local spatial bins, iterative terrain/OBB contacts, approximate angular inertia, Coulomb-style friction, and preliminary sleep/wake counters. Preserved original Stone & Root visual geometry and spawn sequence. This **does not yet satisfy** persistent multi-point manifolds, warm starting, robust island sleeping, or measured thousand-body/25k-BB gates. Terrain penetration currently estimates metric depth from occupancy/local gradient; verify against extracted triangle geometry, especially mesas, steep slopes, and low-gradient regions. Pair contacts currently use one approximate support point. Do not claim stable settling until live instrumentation and browser testing confirm it. Rollback: `brick-rain.js` immediately before commit `66e5b3e58e8ec6e8745f0a9be3ea905a21c2a09e`.

## Mixed-material Strand prototype — 2026-11-03T21:05:30Z

**Implemented:** Strand now alternates stone, wood and ice among 72 identical beveled colliders. Each body carries a `material` identity and relative mass density; the initial response table is `stone:{density:1,friction:.82,restitution:.09}`, `wood:{density:.45,friction:.62,restitution:.12}`, `ice:{density:.65,friction:.08,restitution:.06}`. These are **illustrative uncalibrated coefficients**, not empirical properties. Terrain remains stone **for response only**; atlas geological identity is unchanged. Pair friction uses geometric mean and restitution uses maximum; lookup is symmetric and order-independent. The current kernel is still named `createStoneContacts` for compatibility; name is historical, behavior now accepts material pairs.

**Eye v1:** `codex/strand/eye.js` returns a read-only JSON digest via `world.eye()` and `world.inspect().eye`: material populations, awake/sleeping, kinetic energy, velocities, vertical bounds, and cumulative terrain/pair/contact/impulse counts keyed `ice/stone`, `stone/wood`, etc. The digest is **not yet a UI button or downloadable file**; it is a programmatic inspection interface. Counters include repeated solver passes and are not unique manifolds. No actual browser run, stability measurement or benchmark is claimed.

**Extension design:** material identity belongs to each body/collider, not to mesh color; terrain material is resolved from existing `materialAt` through an explicit Strand policy. Replace the local coefficient table with a shared material registry and pair overrides once behavior is validated. Next, collect per-step impulses, metric penetrations, slip/rolling and sleeping transitions; upgrade to feature-stable multi-point manifolds, warm start and support islands before claiming realistic mixed piles. Preserve collision shape abstraction so wood planks, ice blocks and stones can have different geometries without duplicating the solver.
