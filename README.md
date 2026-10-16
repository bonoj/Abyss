# Abyss — isolated JIT worlds, boring publication

**Source:** https://github.com/bonoj/Abyss  
**Canonical experiment:** `https://bonoj.github.io/Abyss/<folder>/`

## One-sentence contract

**Athanor (or another producer) packages a complete, independently executable world; Abyss publishes the package without changing a byte of its application code.**

The producer owns its dependencies, paths, cache busting, and executable build identity. Abyss owns GitHub Pages delivery, a deployment manifest, and public reachability checks. Third-party pinned CDN imports (e.g. Three.js) are fine. Do not copy only `athanor/` if the world also imports `codex/` and `arcana/`: package the complete dependency closure **inside that experiment folder**, and adjust paths during packaging, before handing it to Abyss.

## For the Conjoiner

“Fling <world> into Abyss” means Clara should inspect this README, put a complete world at `<folder>/index.html` with all of its own local code and assets inside `<folder>/`, commit, **explicitly dispatch** the Pages workflow, wait for completion, verify the public manifest and the experiment URL, and report the observed SHA. No user uploads, no manual cache clearing, no extra repo per experiment.

A commit **does not** trigger deployment. Deployment requires an explicit workflow dispatch. Setup edits do not launch worlds.

## Invariants

- Each experiment is a folder with `index.html`. Nested folders are allowed; each `index.html` is an entry.
- **No runtime references to Hermeticon's live source or another experiment's files.** All first-party runtime dependencies are inside the experiment's own directory. The producer must enforce this; Abyss does not currently inspect module dependency closure.
- Abyss's workflow does **not** rewrite HTML, CSS, JS, imports, or URLs. It copies source files verbatim into the Pages artifact, excluding `.git`, `.github`, and generated site files.
- One workflow publishes all folders as one atomic Pages artifact. Experiment files are not shared, but deployment is shared. Avoid service workers and shared-origin storage in experiments: these can bypass folder isolation.
- The workflow generates `/Abyss/build.json` and `/Abyss/pages.json` with the **Abyss repository commit SHA** and checks the public manifest and each entry. These are *publication identity*, not necessarily the Athanor package's original build SHA.
- **Cache busting is a producer responsibility.** Packaged HTML and its module graph should already carry a pinned build identity. GitHub Pages/CDN/browser HTML caching can still be stale; verify the executing build, not merely a successful workflow.
- JS syntax is checked during publication. The workflow verifies that each HTML entry is publicly reachable; it does **not** certify that the application boots, that all dependencies resolve, or that runtime isolation is complete.
- If no experiment folder exists, manual publication intentionally fails instead of publishing an empty site.

## Clara cold boot

1. Read this README and `.github/workflows/pages.yml`.
2. Package the requested world into its own directory; include the entire first-party dependency closure and validate relative paths. Preserve all other experiment folders.
3. Inspect for first-party imports crossing outside the experiment folder; avoid service workers and shared storage. Keep third-party imports version-pinned.
4. Commit to `main`. **Do not dispatch unless asked to publish.**
5. When asked to publish, dispatch `Publish Abyss` on `main`, observe completion, fetch `/Abyss/pages.json?verify=<sha>` and the experiment's URL, and independently verify runtime build identity.
6. Report canonical URL, source/package SHA, Abyss publication SHA, and verified outcome. If runtime verification is unavailable, say so.

## Recovery

Restore the desired experiment's known-good package from Git history, commit, explicitly dispatch, and verify. Do not reset or overwrite unrelated experiments. Abyss is not an independent backup of Hermeticon.
