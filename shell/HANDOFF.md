# Shell — Abyss handoff

## Entry
- Source: `bonoj/Abyss/shell/`
- Canonical: https://bonoj.github.io/Abyss/shell/
- Workflow: https://github.com/bonoj/Abyss/actions/workflows/pages.yml
- Commits: https://github.com/bonoj/Abyss/commits/main/
- Original source: `bonoj/Hermeticon/sieve/` plus its Athanor, Codex, and Arcana dependencies. **Do not edit the original to change Shell.**

## Contract
Shell is an isolated snapshot of the Sieve world, not a live link to Hermeticon. All first-party runtime modules live under `shell/`. Third-party Three.js is pinned at 0.180.0 via CDN. Shell's root `index.html` loads `./sieve/compose.js`, which mounts `../codex/sieve/world.js` through `../athanor/athanor.js`.

The top title is SHELL. The 🐙 menu links here, to Abyss commits, and to the Abyss Pages workflow. The outreach workspace links deliberately remain in Hermeticon as reference material, not runtime dependencies.

## Build identity
The shared Abyss publisher writes `/Abyss/build.json` containing the exact deployment commit SHA. Shell's `athanor/athanor.js` reads `../../build.json` relative to its module URL, displays the first 8 hex characters in `#build`, and reports the full SHA to the inspector. The displayed SHA must equal the successful Pages run's head SHA; if not, do not declare the page live. A successful workflow is not sufficient to prove runtime execution.

## Deploy / verify
Changes under `shell/**` trigger the `Publish Abyss` workflow. Changes to the workflow itself also trigger it. Preserve all other experiment directories. After publish, verify `/Abyss/pages.json` contains `shell`, the `/Abyss/shell/` HTML responds, and the *executing* build number matches the workflow commit. Check browser runtime errors and imports. If the build does not wake, inspect workflow logs and missing local imports before changing the publisher.

## Known boundaries
Abyss publishes files unchanged; the producer is responsible for application-level cache busting and module-graph completeness. The clone was copied from Hermeticon with local module paths preserved. Do not introduce service workers or shared-origin storage that could interfere with other Abyss experiments. Do not silently recreate `sieve/` at repository root.

## Recovery
Restore a known-good `shell/` snapshot from Abyss history and publish; never overwrite Hermeticon or other Abyss experiments.
