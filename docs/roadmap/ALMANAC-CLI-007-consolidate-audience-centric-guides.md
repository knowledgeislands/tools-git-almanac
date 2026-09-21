---
id: ALMANAC-CLI-007
area: CLI
title: Consolidate audience-centric guides
theme: documentation-structure
blocks: []
blocked_by: []
transferred_from: ki-website
created_at: 2026-09-21T15:44:00Z
updated_at: 2026-09-21T15:44:00Z
horizon: triage
status: draft
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

This is a discussion proposal only. It is not accepted, prioritised, or implementation authority, and this repository owns its horizon and plan.

KI Website derives and cites; it does not own this collection. A guide that would not serve this repository's own readers should not be written for the site's benefit.

## Shaping

- Decide whether one user guide is genuinely enough, or whether installation, the report contract, and interpreting output want separating.
- Check what `PDR-ALMANAC-001` fixes about the command and report contract, and make sure the guide explains rather than restates it.
- Relate this to `ALMANAC-CLI-006`: the tool route gives readers a way in, and this decides what they find.
- Run `ki repo audit --skill ki-guides --repo .` once the collection settles.

## Discussion

Review the evidence before deciding whether to consolidate now, defer, or record an exception. The prompting question is whether every practical document in this repository is in the guide collection, under the audience that needs it, and reachable from the collection index.
