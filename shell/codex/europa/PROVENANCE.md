# Europa synthetic provenance

`stratigraphy.js` provides illustrative units and composition proxies, not measured Europa geology. `terrain.extractNodes` now optionally emits each removed node's coordinates. `world.extractTestCore` records those nodes with provenance tags and a per-unit tally; `world.europaSection` returns a stratigraphic grid plus an occupancy mask sampled from actual terrain. These are programmatic outputs, not a rendered cross-section UI. Stratigraphic layer boundaries are not yet aligned to the terrain elevation. Runtime extraction and exact-source tests remain unverified. Terrain generic material IDs are not chemical species.


## Paired interrogation trial

The Europa survey has an explicit `EXTRACT TWO CORES` control, backed by `world.interrogateEuropa()` and `europaInterrogateJSON()`. It removes lattice nodes at the synthetic transported-lens site (-3.1, 2.2) and reference site (5, -3), with recovery fraction 0.8. Reports distinguish node counts, provenance tallies, a deterministic recovered-parcel proxy, lens detection, ledger balance, and post-extraction terrain inventory agreement. The parcel proxy is **not** a physically calibrated recovered core and is not guaranteed to match the material ledger's recovery allocation. The operation is single-use on a fresh scene; reload to repeat. No empirical Europa measurements are implied. Browser execution of this revision is not yet verified.
