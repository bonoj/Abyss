# Abyss — N disposable worlds, one reliable publisher

**Repository:** https://github.com/bonoj/Abyss  
**Canonical origin:** https://bonoj.github.io/Abyss/  
**Experiment URL:** https://bonoj.github.io/Abyss/<folder>/

## Conjoiner command

**“Fling <experiment> into Abyss.”** Clara reads this README and the workflow, writes `<folder>/index.html` plus its assets, commits to `main`, explicitly starts **Publish Abyss** via `workflow_dispatch`, watches the run, and verifies the live URL and deployed SHA. No manual upload or browser-cache ritual.

**Important: committing does not publish.** The workflow is manual-only, so setup/documentation edits never launch a site. Never describe a commit as deployed. Do not trigger publishing merely to test the infrastructure without instruction.

## Architecture

- N isolated experiment directories, each with its own `index.html` and relative assets; e.g. `sparks/index.html`, `terrain/index.html`. No per-experiment workflows or repositories.
- One workflow: `.github/workflows/pages.yml`. It publishes the whole repository snapshot atomically to one Pages site, so all experiment URLs remain stable.
- Every publication uses `github.sha` as its source identity. It generates global `/Abyss/build.json`, `/Abyss/pages.json`, and per-experiment `/Abyss/<folder>/build.json`. Never hand-maintain those generated files.
- HTML references to relative local JS/CSS and relative JS module imports are stamped with `?v=<full commit SHA>`. Use relative asset paths; avoid absolute `/foo` references because Pages is hosted beneath `/Abyss/`.
- Validation: all referenced local JS/CSS must exist; JS syntax is checked; after deployment, the workflow fetches the global manifest and every experiment's `index.html` and `build.json` and checks expected SHA.
- Concurrency is serialized. A manual run deploys its selected commit. Don't queue a second deployment until the first has been observed.

## Cache truth and recovery

- A commit SHA and verified manifest prove **which build was published**. They do not guarantee a user's browser is displaying fresh HTML: browsers, CDN edges, service workers, and third-party assets have independent caches.
- For reliable observation, use the canonical experiment URL with a `?v=<observed SHA>` navigation query if needed; ensure local asset URLs are versioned. Do not promise that cache staleness is impossible. Avoid registering service workers in disposable experiments.
- **Never tell the Conjoiner to clear browser cache as the normal fix.** Diagnose the executing SHA versus expected SHA. If the public manifest is stale, investigate Pages propagation or the workflow; if manifest is current but app is stale, inspect HTML/service-worker/asset caching.
- If a deploy fails, inspect the exact Actions run and logs, repair the cause, and rerun explicitly. No success claims until the public page and manifest are observed.
- To restore a prior experiment, revert or restore its known-good commit, commit to `main`, explicitly dispatch the publisher, and verify. Preserve other folders.
- The repository contains source, not an independent disaster-recovery backup. GitHub Pages settings and secrets are not part of a Git clone.

## Cold-boot checklist

1. Read this README and `.github/workflows/pages.yml`.
2. Find the requested experiment folder or create it; keep other experiments intact.
3. Change source only; preserve publisher and generated-file contract.
4. Commit to `main`. **Only publish if requested.**
5. When publishing, explicitly dispatch the workflow on `main`; wait for completion and verify `pages.json`, per-folder `build.json`, and the page.
6. Report the exact URL, 8-character SHA, and verified state. If verification is incomplete, say so.

The root `index.html` is an optional placeholder/landing page. Experiments live in separate folders. **The workflow requires at least one experiment folder before a publication can succeed.**
