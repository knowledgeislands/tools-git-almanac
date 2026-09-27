---
id: ALMANAC-CLI-006
area: CLI
title: Adopt website tool routes
theme: cli
horizon: triage
status: draft
blocks: []
blocked_by: []
baseline_ref: null
created_at: 2026-09-17T21:05:58Z
updated_at: 2026-09-27T23:21:41Z
---

# ALMANAC-CLI-006: Adopt website tool routes

## Goal

Keep the website's advertised `git-almanac` version matching what this repository has released, and align this installer's version-pinning interface with the other Knowledge Islands tools.

## Context

`knowledgeislands/ki-website` delivered `KI-WEB-SITE-007`, which gives every released Knowledge Islands tool the same two public routes: `/tooling/<tool>/` for people and `/install/<tool>/` for machines. Both are generated from one website-owned registry.

`git-almanac` now has a product page at `https://knowledgeislands.info/tooling/git-almanac/` and a stable installer endpoint at `https://knowledgeislands.info/install/git-almanac`, which redirects to `https://raw.githubusercontent.com/knowledgeislands/tools-git-almanac/v0.1.0/install.sh`. The registry currently advertises `v0.1.0`.

The website does not discover releases. It advances only when this repository hands it the new version, which keeps the public recommendation deliberate — but it also means a release that is not handed over leaves the site advertising an older version.

This installer also accepts an explicit version only through `GIT_ALMANAC_VERSION`, while `ki` and `git-almanac` accept a positional `vX.Y.Z`. That inconsistency is the subject of `tools-ki` `KI-TOOL-CLI-076`.

## Boundary

This does not move release authority, installer behaviour, artifact hosting, or checksum verification to the website. The website is an indirection layer over what this repository publishes.

Do not remove the latest-release default from the installer. Pinning is an explicit opt-in; an unpinned `curl | sh` must keep working.

## Discussion

### The release handoff

Add a named release follow-up: after publishing a release intended for general recommendation, hand `ki-website` an item naming the exact version and the immutable installer target `https://raw.githubusercontent.com/knowledgeislands/tools-git-almanac/v0.1.0/install.sh` with the new tag substituted. The website updates its registry entry and ships.

The website verifies declared routes before deployment and reports upstream drift as a warning rather than a failure, so an outstanding handoff is visible without breaking anyone's build.

### Version pinning

Accept a positional `vX.Y.Z` argument in addition to `GIT_ALMANAC_VERSION`, per the interface proposed in `tools-ki` `KI-TOOL-CLI-076`. Keep `GIT_ALMANAC_VERSION` working as an alias. Follow that item rather than deciding the interface here.

### Related

Originating repository and item: `knowledgeislands/ki-website` `KI-WEB-SITE-007`. That item is done and this one does not block it. The route contract is documented at `docs/guides/tool-routes.md` in that repository.

### Pickup checkpoint — 2026-09-28

- **Delivered and changed elsewhere:** website commit `022b6f2` established tool routes; later commit `ec5022b` merged tools into the projects registry. Current `knowledgeislands/ki-website/apps/site/src/_data/projects.json5` declares `git-almanac` at `v0.1.0` with an installer pinned to the `v0.1.0` tag. Its current `docs/guides/developer/tool-routes.md` defines `/projects/<tool>/` and `/install/<tool>`, which map this registry entry to `/projects/git-almanac/` and `/install/git-almanac`. The `/tooling/git-almanac/` route and `docs/guides/tool-routes.md` location stated above are superseded. This was checked in the local website checkout, not against a live deployment.
- **Already present locally:** `install.sh` accepts positional `vX.Y.Z`, retains `GIT_ALMANAC_VERSION`, and uses the latest release when neither is supplied; `src/tests/install.test.ts` checks the positional usage text. Commit `b22400e` already contained that interface before this item was captured in `61de117`. Local `v0.1.0` is a Git tag. `docs/guides/developer/releasing.md` still names the retired `/tooling/git-almanac/` route. No new release handoff or remote deployment was verified in this audit.
- **Remaining and pickup:** reconcile this item's proposed route and handoff scope with the current website registry, release automation, and local release guide before deciding any follow-up. It remains unadopted Triage; only a later approved disposition or adopted plan may change that. Reconcile destination branch, any linked tasks and live ownership, and retained worktrees before further work; missing task evidence does not release ownership or lift a hold. This checkpoint is guidance, not an execution block or resumption authority. Owner review and acceptance govern closure, and any later Done record remains until explicit pruning.
