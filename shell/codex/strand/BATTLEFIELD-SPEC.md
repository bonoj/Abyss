# STRAND — Emergent Battlefield Tower Defense
**Status:** Design specification, not implemented or validated.  
**Location:** Abyss / Shell / Codex / Strand.  
**Authority:** Captures the human's stated gameplay direction and the design discussion through 2026-11-11. Proposed engineering choices are explicitly marked; they are not implementation commitments.

## 1. Creative direction
Stop agonizing over art, attractive assetless models, shaders, and polished environmental presentation. Build the **wonderful mechanics first**; let playable behavior reveal which systems and visuals are necessary. This is tower defense in a deformable, persistent, material world, not conventional lane-based tower defense with decorative scenery. Start with primitive geometry, flat colors, and observable behavior. Do not restart the rejected Strand tower/moss prototype or undertake another material study as a prerequisite.

**Core thesis:** Lanes are an *illusion* produced by physical geography and traversability. There are no immutable authored lanes or splines. Terrain, forests, mountains, trees, structures, debris, living crowds, and dead bodies determine where enemies can and prefer to move. The battlefield changes as events leave physical consequences.

## 2. World rules — confirmed intent
1. **Forests and mountains are real.** Natural materials and obstructions occupy space and affect movement. Enemies do not path through them if they can reasonably go around.
2. **Terrain is real and mutable.** Excavation, destruction, deformation, support loss and altered geometry can open, close, widen, narrow or reroute passages. Movement must respond to the *current* world.
3. **Trees can fall and clog lanes.** Standing trees are rooted/anchored populations; a falling tree becomes an actual trunk obstacle, not a cosmetic animation. Its fall can be triggered by environmental forces or loss of support (specific thresholds to be discovered in play).
4. **Enemies occupy space.** Enemy–enemy collision matters. They pile up at constrictions, push/congest, spill around blockages, and seek viable alternatives. They must not ghost through each other merely to maintain scripted throughput.
5. **Deaths persist physically.** A dead enemy is not deleted on death. Its body remains a spatial object; battlefield corpses accumulate, obstruct passage, alter crowd flow, and can create new problems for the defender as well as the attacker.
6. **Other debris persists.** Broken masonry, stone, fallen timber and damaged structures are materially consequential. A blocked passage can be reopened or a new passage created through further physical change.
7. **Combat leaves history.** The battlefield at minute ten differs from minute one because its occupants, obstructions and terrain have changed—not because a level script switched phases.
8. **Game rules follow causes.** Player actions should manipulate the world and produce outcomes through interacting systems, rather than trigger hand-authored obstacle/path states.

## 3. Shared material and object grammar
Physical categories include terrain/geology, mountains, forests/trees/roots, masonry/buildings/towers, loose rock, timber/debris, living enemies, and corpses. They need coherent physical interactions rather than separate decorative collision exceptions.

Candidate shared properties (design vocabulary, not a finalized ECS schema):
- Shape, occupied volume and spatial extent: blocking, clearance and contact.
- Mass/inertia: displacement, pushing, accumulation and toppling.
- Contact/friction: sliding, sticking, jamming and pile stability.
- Structural integrity/support/anchoring: damage, collapse, uprooting and support loss.
- Mobility/agency: living enemies locomote; dead bodies lose agency but **retain** physical properties.
- Persistence/lifecycle: physical remains are not automatically culled at death; any eventual decay/removal rule must be explicit and gameplay-motivated.
- Material identity: stone, wood, soil, living tissue, etc. may differ in response, but do not create an independent physics stack for each.

**Invariant:** Death removes self-propulsion and behavior, not volume, mass or collision. Rendering is a view of simulated state, not an alternative source of collision geometry.

## 4. Navigation: intent versus reality
- Long-range navigation represents goal direction and broad traversability given mountains, forests, valleys, barriers and large obstructions.
- Local movement resolves actual collisions, neighboring enemies, corpses, tree trunks, debris, and crowd pressure.
- Reevaluate movement when the environment changes: tree fall, terrain deformation, a new opening, a collapse, or accumulating remains.
- An enemy should avoid difficult or blocked material if a viable alternative exists. The particular choice among detouring, climbing, squeezing, pushing, or becoming stuck must follow its capabilities and local physics.
- Do **not** rebuild a global navigation graph for every corpse or run perfect full-map pathfinding for every agent each frame. **Proposed architecture:** coarse navigation/flow guidance + local physical steering/contact + incremental/region-based invalidation when meaningful traversal changes occur. This is a candidate to test against existing Arcana, not permission to introduce parallel machinery.
- Congestion is a real, dynamic navigation cost. A corridor can be geometrically open yet practically unusable because of crowd density or accumulated bodies.
- Preserve possibility of failure: congestion, jams, unreachable goals, and delayed re-routing should be observable rather than hidden by teleportation or ghosting.

## 5. Emergent tactical interactions
### A. Tree blockade
Enemies advance through a natural corridor. A tree loses support or falls, placing a trunk across it. Incoming enemies accumulate; local collisions create pressure and spillover. Some divert; others remain jammed. Subsequent destruction, displacement, or terrain deformation can reopen the route.

### B. Corpse dam
A defensive kill zone in a mountain pass produces bodies. Bodies retain shape and contact, forming an increasingly consequential obstacle. Later waves must route around, move over, push into, or get trapped by the pile. Effective defense can therefore change or obstruct its own firing corridor. A large fallen creature can alter a route disproportionately. These are desired *possible* outcomes, not pre-scripted guarantees.

### C. Mutable geography
Mountains, valleys, trees, and forests naturally channel traffic. A hole, excavation, collapsed wall, displaced stone or toppled trunk changes which corridors exist. The illusion of lanes emerges from geography and is destroyed/reconstituted by events.

### D. System cascade (exploratory example, not initial scope)
Fire weakens trees; trunks fall into a stream; debris collects at a crossing; backed-up water changes conditions; enemies find new routes. Water/fire/hydrology are **not** requirements for the first slice, only examples of the eventual causal richness.

### E. Defensive tools
The project is tower defense, but conventional towers, weapons, enemy factions, economy, waves, build menus, progression and victory rules are **not yet specified**. The first meaningful defense may be a tree, gravity, or digging. Discover these through play rather than freezing an untested design.

## 6. First executable slice — The Bottleneck
**Intent:** smallest compelling proof of the emergent battlefield, not a vertical slice of all tower-defense content.

Set up:
- A minimal deformable valley / mountain-pass terrain, with obvious natural traversable space and obstructions.
- A goal and repeated spawn of simple physically colliding enemies.
- One rooted tree with a physically represented trunk and a controlled way to topple it.
- Basic terrain editing or deformation sufficient to create another traversable passage.
- Bodies that remain after enemy death and contribute to contact and congestion.
- Simple visual diagnostics; no asset production requirement.

**Acceptance experiments:**
1. With no manually drawn lanes, enemies take the available natural corridor toward the goal.
2. The tree falls across the corridor and becomes a real obstruction.
3. The following enemies collide with the trunk and one another, accumulate and spill/detour where physically possible; they do not phase through.
4. Eliminated enemies leave collidable bodies. Repeated deaths measurably change clearance, crowding or route selection.
5. Altering terrain creates an alternative passage; agents adapt to the changed world without a level reset or hand-authored route swap.
6. When obstacles are removed/displaced or the passage is widened, traffic can resume.
7. The behavior is observable and repeatable with simple geometry and diagnostic overlays; frame time and contact cost are measured before scaling populations.

**Observe rather than assume:** actual contact stability, corpse pile stability, slope/clearance handling, re-route latency, crowd throughput, jam frequency, solver time and terrain-update cost. Do not claim these are solved until witnessed.

## 7. Engineering constraints from existing Strand
- Existing runtime: `shell/codex/strand/world.js`, hosted by Shell/Athanor, shared Arcana terrain/physics/material systems. Reuse existing signed-field atlas terrain, impact/excavation, BBs, masonry/contact mechanisms as appropriate; inspect before changing.
- Existing Strand README prohibits parallel physics, renderer or clipping paths, O(N²) contacts and heavyweight per-BB solvers. Preserve Genesis, Entropy, Europa and Wanderer. CONTACTS is the material/contact source of truth.
- Existing stone/wood/ice bricks and support-loss behavior are a foundation to evaluate, not proof that general rigid-body piles or living-agent collision already work. The current contact solver is preliminary.
- No ornamental tower, faux foundations, fake collision, sprite substitution or visual-only obstructions.
- Maintain deterministic/reproducible experiment controls where feasible; inspect and instrument actual simulation state.
- Any implementation work must follow Strand README/Chronicle procedure, UTC evidence rules, source readback and publication verification. This **spec-only** change is not an implementation, browser test or deployment.

## 8. Scope boundaries and unresolved design decisions
**Firm direction:** emergent lanes; real mountains/forests/materials; deformable geography; falling trees; enemy collisions and pileups; persistent corpse obstructions; mechanics-first, art-later.

**Proposals, not yet authorized implementation details:** navigation representation, physics solver selection, corpse lifecycle/decay, body shapes, push/step/climb abilities, tree damage thresholds, crowd pressure model, terrain-edit UI, first enemy and tower abilities, wave pacing, combat model, performance budgets, whether water/fire join the simulation, and progression/economy.

**Do not silently simplify away the hard parts:** making corpses cosmetic, enemies non-colliding, trees decorative, paths hard-coded, mountains merely painted, or deformation disconnected from traversability would defeat the thesis.

## 9. Next action
Before coding: inspect Strand README and Chronicle, Arcana CONTACTS, world composition, terrain deformation and existing brick/BB contact behavior. Then design and implement the **smallest Bottleneck experiment** with instrumentation and an explicit verification matrix. Let gameplay expose missing systems; resist visual polish and speculative engine construction. Update Chronicle and handoff only when actual development occurs.
