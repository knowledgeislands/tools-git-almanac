---
id: ALMANAC-CLI-007
title: Consolidate audience-centric guides
area: CLI
theme: cli
horizon: now
status: ready
blocks: []
blocked_by: []
transferred_from: ki-website
baseline_ref: null
created_at: 2026-09-21T15:44:00Z
updated_at: 2026-09-22T06:55:00Z
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

Adopted into `Now` by explicit approval, so this is prioritised work rather than intake. `ki-plan` shaped it to `Ready` before any implementation, and this repository still owns its plan and sequencing.

KI Website derives and cites; it does not own this collection. A guide that would not serve this repository's own readers should not be written for the site's benefit.

No behaviour changes. No source file under `src/`, no `man/git-almanac.1` rewrite, and no change to `docs/specs/` requirement text. `ALMANAC-CLI-005` and `ALMANAC-CLI-006` are out of scope.

## Shaping

Shaping is settled; the decisions below are what implementation follows.

- **One user guide is not enough.** A reader arrives with one of four separable tasks: install the tool, use it day to day, maintain the managed report, or recover from a refusal. The user audience gets a guide for each, and `user/git-almanac.md` becomes `user/everyday-use.md` so no file is named after the tool rather than the task. Nothing outside this repository cites the old path, so the rename costs no inbound link.
- **The guides explain, the specification fixes.** `PDR-ALMANAC-001` and `docs/specs/git-almanac.md` already hold the command and report contract. Each guide gives sequence, conditions, verification, and recovery, and links to the specification for the normative statement rather than restating it.
- **`man/git-almanac.1` is a reference manual, not a displaced guide.** It belongs where it is, and stays. Likewise `docs/specs/git-almanac.md` is a behaviour specification and is not a guide in the wrong folder. What does move is practical instruction currently only reachable through the manual or `install.sh --help`.
- **`ALMANAC-CLI-006` gives readers the route in; this decides what they find.** Neither blocks the other.
- The guides audit runs once the collection settles, and `ki repo audit` in full must still pass.

## Current state

`docs/guides/` declares `[skills.ki-guides]` and has a `developer/` directory with its own index covering local development, releasing, and the definition of done. The user side is a single `user/git-almanac.md` with no `user/README.md`, so that audience has a document but no index routing a reader to it — a concrete gap this item closes.

The sweep of `README.md`, `docs/specs/`, `man/`, and `install.sh` found these further gaps:

- The collection index lists one user document and one developer directory under a single `## Start here`, so it routes by artefact rather than by audience.
- `developer/README.md` is a bare list of three links with no scope statement, so a contributor cannot tell what the audience covers before opening a file.
- `README.md` carries the practical detail itself — `Try locally`, `Output`, `Local report`, and `Configuration` restate the user guide at length, which is the material the collection should own.
- Shell completion (`git almanac completion bash|zsh`) appears only in `man/git-almanac.1`. No guide mentions it.
- Installing a released binary is described in `README.md` and `install.sh --help`. The only guide covering installation is `developer/local-development.md`, which is the audience that wrote it rather than the audience that needs it: a user installing a release should not have to read a contributor guide.
- Nothing covers recovery. Exit statuses 1 and 2, a missing repository, an invalid ref, empty history, SVG requested for `authors` or `contributors`, and the report refusals — foreign directory without a manifest, unowned path collision, concurrent lock, incompatible partial update — are specified in `ALM-020` and `ALM-014` but never explained to the reader who hits them.

## Steps

- [ ] Sweep `README.md`, `docs/specs/`, and any `man/` page for practical instruction that belongs in the collection.
- [ ] Confirm every audience directory has an index that routes its own readers.
- [ ] Place anything found under the audience that needs it, rather than under the audience that wrote it.
- [ ] Add `docs/guides/user/README.md` so the user audience is routed rather than merely present.
- [ ] Confirm the collection index routes by audience before anything else.
- [ ] Rename `docs/guides/user/git-almanac.md` to `docs/guides/user/everyday-use.md` and narrow it to everyday inspection, selection, output, and reading the results.
- [ ] Add `docs/guides/user/installation.md` covering the release installer, an exact version, the environment overrides, Homebrew once the tap accepts a formula, linking a checkout, the manual page, shell completion, and how to verify and remove an installation.
- [ ] Add `docs/guides/user/reports.md` covering generating and refreshing the managed report, what the manifest owns, keeping report output out of Git, and recovering from an ownership or lock refusal.
- [ ] Add `docs/guides/user/troubleshooting.md` covering exit statuses and the common failures a first-time reader hits, each with its recovery.
- [ ] Give `docs/guides/developer/README.md` a scope statement and descriptions a contributor can choose from.
- [ ] Reduce `README.md` to purpose, one credible example, and routes into the collection, leaving the detail to the guides it links.
- [ ] Run `ki repo conform --skill ki-authoring --repo .` and then the guides, authoring, and full repository audits, repairing what they report.

## Files touched

`docs/guides/README.md`; `docs/guides/user/README.md`, `everyday-use.md` (renamed from `git-almanac.md`), `installation.md`, `reports.md`, `troubleshooting.md`; `docs/guides/developer/README.md`; `README.md`; this record.

## Verify

Run from the repository root:

```sh
ki repo audit --skill ki-guides --repo . --concise --progress never
ki repo audit --skill ki-authoring --repo . --concise --progress never
ki repo audit --repo . --concise --progress never
```

All three must pass, and the full audit must still report every one of its 17 skills passing. Every relative link in a changed document must resolve to a file that exists.

## Dependencies / blocks

Nothing blocks this. `KI-HARNESS-GOV-083` in `ki-agentic-harness` proposes making audience directories a `ki-guides` requirement; this collection already groups by audience, so that change should confirm the arrangement rather than force one.

## Documentation impact

### Decision Records

No decision record is needed. This is consolidation within an arrangement the repository has already adopted.

### Specifications

No behaviour-level contract changes. Where a guide and a specification disagree, the specification is authoritative and the guide is corrected. The sweep found no behaviour documented nowhere, so no `ki-specs` gap is raised.

### Guides

This item is entirely guide impact: gaps are filled, stray practical material is brought in, and the indexes are made to route.

### Roadmap

No further roadmap change is expected. `ALMANAC-CLI-006` remains independent; this item neither blocks nor is blocked by it.

## Discussion

Shaping settles how far consolidation goes, not whether it happens. The prompting question is whether every practical document in this repository is in the guide collection, under the audience that needs it, and reachable from the collection index.

### What is not a displaced guide

Two documents look like candidates for the collection and are not. `man/git-almanac.1` is the tool's reference manual: it is an option-by-option surface a reader consults, not a procedure a reader follows, and it ships with the release asset. `docs/specs/git-almanac.md` states normative behaviour with conformance evidence, which is exactly what `ki-specs` owns and what `ki-guides` says a guide must link to rather than restate. Moving either would put the wrong instrument in the guide root. What the sweep did take from them is the practical instruction they alone carried — shell completion from the manual, and the failure classification behind the troubleshooting guide.

### Why the README shrinks

`README.md` grew a full tutorial because, until now, there was nowhere better for it. With four user guides in place the README's job is the shortest useful route: what the tool is, one example that proves it works, and a link to the guide that owns each workflow. That follows the README composition convention's preference for descriptive links to durable guides over duplicated detail, and it removes a second copy of instructions that would otherwise drift from the collection.
