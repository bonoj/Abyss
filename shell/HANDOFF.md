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
Changes to `shell/**` trigger the Pages workflow, which copies the repo without rewriting application files. The publisher writes `/Abyss/build.json` with the deployment commit SHA. `shell/athanor/athanor.js` fetches it using `../../build.json` and displays its first 8 characters. Match this number against the successful workflow commit before calling the running build verified. The workflow checks packaging, JS syntax, public manifest, and HTML reachability, not browser runtime execution.

## Recovery
If Shell fails to wake, check the console and the module graph, then workflow logs. Restore a known-good Shell tree from Abyss history if needed. Do not change Hermeticon or other Abyss experiments to fix Shell. Avoid service workers and shared-origin storage collisions.
