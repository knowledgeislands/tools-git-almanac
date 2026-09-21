---
id: ALMANAC-CLI-007
title: Consolidate audience-centric guides
area: CLI
theme: cli
horizon: now
status: draft
blocks: []
blocked_by: []
transferred_from: ki-website
baseline_ref: null
created_at: 2026-09-21T15:44:00Z
updated_at: 2026-09-21T16:40:00Z
---

## Goal

The user collection covers what a reader actually needs rather than the one document that happened to be written first.

## Context

`tools-git-almanac` already has the `user/` and `developer/` split, but `user/` holds a single guide, `git-almanac.md`, while `developer/` holds four. That asymmetry usually means the user account is thinner than the tool warrants, not that users need less.

`ALMANAC-CLI-006` already covers adopting the website's tool routes, so the site will be pointing readers here.

KI Website now declares, for every page it publishes under `apps/site/src/guidance/`, the exact upstream document and pinned ref that page was written from, and a `verify:guidance --network` sweep reports the pages whose source has moved. The site intends to derive public guidance for this project from this repository's own guides and cite them at a pinned ref, so the quality and stability of `docs/guides/` here directly determines the quality of what the site can publish.

That is a pull, not an obligation: KI Website derives, it does not own. This repository decides what its guides say and when they change.

Separately, `ki-guides` is being asked to require audience directories under `docs/guides/` rather than permitting a flat collection (`ki-agentic-harness` `KI-HARNESS-GOV-083`). If that lands, this repository's collection has to satisfy it.

## Boundary

Adopted into `Now` by explicit approval, so this is prioritised work rather than intake. It remains `status: draft`: `ki-plan` shapes it to `Ready` before any implementation, and this repository still owns its plan and sequencing.

KI Website derives and cites; it does not own this collection. A guide that would not serve this repository's own readers should not be written for the site's benefit.

## Shaping

- Decide whether one user guide is genuinely enough, or whether installation, the report contract, and interpreting output want separating.
- Check what `PDR-ALMANAC-001` fixes about the command and report contract, and make sure the guide explains rather than restates it.
- Relate this to `ALMANAC-CLI-006`: the tool route gives readers a way in, and this decides what they find.
- Run `ki repo audit --skill ki-guides --repo .` once the collection settles.

## Current state

`docs/guides/` declares `[skills.ki-guides]` and has a `developer/` directory with its own index covering local development, releasing, and the definition of done. The user side is a single `user/git-almanac.md` with no `user/README.md`, so that audience has a document but no index routing a reader to it — a concrete gap this item closes.

## Steps

- [ ] Sweep `README.md`, `docs/specs/`, and any `man/` page for practical instruction that belongs in the collection.
- [ ] Confirm every audience directory has an index that routes its own readers.
- [ ] Place anything found under the audience that needs it, rather than under the audience that wrote it.
- [ ] Add `docs/guides/user/README.md` so the user audience is routed rather than merely present.
- [ ] Confirm the collection index routes by audience before anything else.
- [ ] Run the guides audit and repair what it reports.

## Files touched

`docs/guides/` and its audience directories; `README.md` and other documents where instruction moves out of them.

## Verify

`ki repo audit --skill ki-guides --repo .` passes, and `ki repo audit --skill ki-authoring --repo .` passes over the collection.

## Dependencies / blocks

Nothing blocks this. `KI-HARNESS-GOV-083` in `ki-agentic-harness` proposes making audience directories a `ki-guides` requirement; this collection already groups by audience, so that change should confirm the arrangement rather than force one.

## Documentation impact

### Decision Records

No decision record is needed. This is consolidation within an arrangement the repository has already adopted.

### Specifications

No behaviour-level contract changes. Where a guide and a specification disagree, the specification is authoritative and the guide is corrected.

### Guides

This item is entirely guide impact: gaps are filled, stray practical material is brought in, and the indexes are made to route.

### Roadmap

No further roadmap change is expected unless the sweep finds behaviour documented nowhere, which would be raised as its own item.

## Discussion

Shaping settles how far consolidation goes, not whether it happens. The prompting question is whether every practical document in this repository is in the guide collection, under the audience that needs it, and reachable from the collection index.
