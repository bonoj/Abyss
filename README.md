# Abyss — executable worlds, boring publication

**Repository:** https://github.com/bonoj/Abyss  
**Shell:** https://bonoj.github.io/Abyss/shell/  
**Shell handoff:** [shell/HANDOFF.md](shell/HANDOFF.md)  
**Publisher:** [.github/workflows/pages.yml](.github/workflows/pages.yml)  
**Commits:** https://github.com/bonoj/Abyss/commits/main/

## Cold boot for Clara / the Conjoiner

1. Read this README and [Shell's handoff](shell/HANDOFF.md). Inspect the actual workflow before making deployment claims.
2. **For a new world using the existing runtime:** author it in `shell/codex/<world>/`, using `shell/arcana/` for reusable systems; connect it through `shell/main.js`. Do not clone Athanor for each world.
3. **For a deliberately independent runtime:** create another top-level `<experiment>/index.html` folder with all its first-party runtime dependencies inside it. No runtime imports across experiment folders.
4. Commit changes to `main`. Currently **changes under `shell/**` and to the publisher workflow trigger publication automatically**. Other folders do **not** automatically trigger deployment; add a deliberate workflow trigger or use `workflow_dispatch` when supported. Do not imply an ordinary commit to another folder was deployed.
5. Follow the actual Actions run to completion. Check `/Abyss/pages.json`, the relevant public entry, and the executing build number. Distinguish **committed**, **Pages deployed**, **public entry verified**, and **browser runtime verified**. Do not call a world live solely because the workflow succeeded.

## What Shell contains

```text
shell/
├── index.html           # HTML entry and controls
├── main.js              # runtime bootstrap / mounted world selection
├── athanor/             # world host, renderer, scheduling, instrumentation
├── arcana/              # reusable capabilities
├── codex/
│   └── genesis/
│       └── world.js     # canonical authored Genesis world
├── archive/sieve/       # preserved non-runtime outreach artifacts
└── HANDOFF.md
```

`shell/sieve/compose.js` and the redundant `shell/codex/sieve/world.js` have been removed. Genesis was byte-identical to the old Sieve world. The top-level Shell directory is **one deployable application** that can host multiple Codex worlds. Separate top-level Abyss folders are only necessary for independent applications/runtimes, not for every world.

Shell's `index.html` imports `./main.js`; `main.js` imports Athanor and `./codex/genesis/world.js`, mounts the world, and attaches its view. Extend this composition deliberately as worlds are added.

## Publication contract

Abyss's Pages workflow publishes the repository as a static site **without rewriting experiment HTML, CSS, JavaScript, imports, or asset paths**. It excludes Git internals and workflow files. It discovers nested `index.html` entries, checks packaged JS syntax, uploads a single Pages artifact, deploys it, and checks the public manifest and HTML entries.

- `/Abyss/build.json`: exact **Abyss deployment commit SHA**.
- `/Abyss/pages.json`: that SHA plus discovered experiment entry folders.
- Shell's `athanor/athanor.js` fetches `../../build.json` and displays the first eight characters of the SHA. The observed on-screen SHA should match the successful deployment's head commit.
- Third-party imports such as pinned Three.js are allowed. Shell's first-party runtime is local to `shell/`.
- Pages success and HTTP reachability **do not** prove that a world boots or that every dynamic import resolves. Verify browser execution separately.
- HTML/module caching remains a producer concern. Do not mistake a fresh manifest for proof that an old browser tab executed the new build. Never ask the user to clear browser caches manually as the default recovery.
- Top-level experiments share a Pages deployment and origin, despite separate source folders. Avoid service workers and shared-origin storage that interfere with other worlds.

## Current deployment trigger — precise scope

The workflow has `workflow_dispatch` and a push trigger on `main` for:

```yaml
paths:
  - 'shell/**'
  - '.github/workflows/pages.yml'
```

A Shell commit deploys the entire Abyss artifact. A README-only commit does **not** deploy. A commit changing only another experiment directory does **not** deploy under this configuration. If the policy changes, update this section alongside the workflow. The connected GitHub tools do not currently provide a reliable workflow-dispatch action; do not build a procedure that depends on it without first verifying that capability.

## Recovery and handoff

Use Git history to restore the affected world or runtime; preserve other worlds and top-level experiments. Diagnose syntax, missing imports, wrong relative paths, publication failures, and build-SHA mismatches separately. Do not alter the original Hermeticon repository to repair Abyss. Record the exact commit, public URL, Actions run, and observed runtime state in the relevant handoff.

**The objective:** create worlds rapidly in Codex, use existing Athanor and Arcana, and keep publishing predictable rather than turning every experiment into a new infrastructure project.
