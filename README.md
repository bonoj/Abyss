# Abyss

Disposable worlds. Durable deployment machinery.

**Canonical URL:** https://bonoj.github.io/Abyss/  
**Source:** https://github.com/bonoj/Abyss  
**Publication authority:** `main` → `.github/workflows/pages.yml` → GitHub Pages (Actions).

## Conjoiner quick start

Say **“Fling it into Abyss”**. Clara should inspect this README and the publisher, replace or add the experiment in the repository root, push to `main`, check the Actions run, then verify the public `build.json` SHA and page. Return the canonical URL and the observed deployed SHA. No manual uploads, cache clearing, or invented success. The initial page is a disposable placeholder, not a permanent app.

## Clara cold boot / contract

1. Read this README and `.github/workflows/pages.yml` before editing. Work in **bonoj/Abyss**, not the legacy root `jit/shell`. The site is served at `/Abyss/`; use relative paths.
2. **Replace the toy freely. Preserve the publisher.** Put a standalone `index.html` at repository root, plus optional local `.js`, `.css`, and assets. Avoid external runtime dependencies unless requested. Do not add another Pages deployment workflow.
3. Commit to `main`. The workflow assembles `site/`, stamps the **actual triggering commit** as `build.json`, cache-busts local script/link dependencies in HTML and local JS imports, validates syntax, publishes, and checks the public release. No workflow-generated source commits, no recursive deployment loops.
4. Verify **two independent facts**: GitHub Actions run completed successfully **and** `https://bonoj.github.io/Abyss/build.json` returns the expected 40-character SHA. If either fails, inspect and repair; never call it live prematurely. A stale CDN response is a verification failure, not a request for the user to clear their browser.
5. For a new experiment, preserve `.github/workflows/pages.yml` and this README. The workflow's stamping is a deployment concern, not something to rebuild inside each toy.
6. Report concise results: canonical URL, 8-character build SHA, workflow outcome, observed public SHA. On failure, report what actually happened and the next corrective action.

## Design and limitations

- One GitHub Pages deployment owner, one site root. Concurrent pushes are serialized using a Pages concurrency group, with newer pending runs replacing older pending ones.
- Public `build.json` is the immutable **source-commit identity** for each publication; its HTTP response is requested with a unique query string during verification.
- Local `src`/`href` HTML references and relative static JS import specifiers are versioned with `?v=<40-char SHA>`. This addresses mixed-version assets; it does not override an external CDN's caching or a service worker installed by a toy.
- The workflow fails if there is no `index.html`, if local referenced JS/CSS is missing, or if syntax checks fail. Runtime correctness still requires observation or browser testing.
- `site/` is an ephemeral workflow artifact; don't commit it. `build.json` is generated during publication.
- To revert: restore a known-good commit and push it to `main`; do not force-push without an explicit reason.
