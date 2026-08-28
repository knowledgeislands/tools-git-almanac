---
id: ALMANAC-CLI-004
area: CLI
title: Rebuild changed reports
theme: cli
horizon: next
status: in-progress
blocks: []
blocked_by: []
baseline_ref: e4be1838a03e07cbfcdc9730812361bd1ffe6c54
---

# ALMANAC-CLI-004: Rebuild changed reports

## Goal

A complete `git almanac report` rebuilds its managed report safely whenever the requested repository, revision, selectors, interval, timezone, identity, metric, or theme differs from the existing report contract.

## Context

The report manifest already records the effective properties used to generate a report. Current implementation compares that contract with every subsequent request and refuses any mismatch, including a complete `git almanac report`. This correctly prevents incompatible partial sections from being combined, but it also prevents the natural full-rebuild operation when a user changes properties such as `--since`.

The user explicitly requested that full report execution treat changed generation properties as a rebuild condition. This is internal report-workspace behavior rather than a new analysis capability.

## Boundary

Use the versioned manifest contract as the canonical record of generated report properties. A complete `report` request with a valid Git Almanac manifest may replace all managed sections under the new effective contract; a partial `report calendar`, `report authors`, or `report contributors` request must continue refusing an incompatible contract. Missing, malformed, foreign, or unsupported manifests remain protected.

Rebuild only paths owned by the previous manifest, publish the replacement manifest after successful content generation, remove obsolete manifest-owned assets safely, and preserve unowned files. The item excludes hosted publication, new metrics, identity-policy changes, arbitrary destructive overwrite, and release activity.

## Current state

`src/report/workspace.ts` parses the existing manifest and compares its full contract with the requested contract before writing. The mismatch guard is unconditional, so both full and partial report requests emit the same refusal. `manifest.json` already contains repository identity, resolved ref, filters, interval, timezone, counting and identity policy, metric, theme, sections, and managed paths.

The report writer uses atomic sibling replacement for individual files and publishes the manifest after section content. It carries prior `managedPaths` forward but does not currently remove paths that become obsolete, such as contributor SVGs after an identity or filter change.

## Steps

- [ ] Define the complete-versus-partial compatibility decision before filesystem mutation and lock the staging, rollback, unowned-file, and stale-managed-path rules.
- [ ] Refactor report-workspace handling so a compatible request refreshes normally, an incompatible full request rebuilds every section, and an incompatible partial request continues failing closed.
- [ ] Rebuild only manifest-owned content, safely remove obsolete manifest-owned assets after replacement content succeeds, preserve unowned files, and publish the new manifest last.
- [ ] Keep `manifest.json` as the authoritative property record and add a concise human-readable contract view only if it does not create duplicated mutable state.
- [ ] Extend in-process CLI and temporary-repository tests across changed dates, ref, author and path filters, merge policy, date field, timezone, metric, theme, repository identity, compatible refreshes, incompatible partial requests, stale managed paths, unowned files, malformed manifests, and simulated write failure.
- [ ] Update the report specification and user guidance to distinguish automatic complete rebuilds from compatibility-bound partial refreshes.
- [ ] Run the complete engineering and KI gates, exercise a changed full rebuild against a temporary clone, and stop at `awaiting-review` without pushing, releasing, tagging, or publishing.

## Files touched

Expected scope is `src/report/workspace.ts`, narrowly related CLI orchestration or report types only if required, report-focused tests under `src/tests/`, `docs/specs/git-almanac.md`, `docs/guides/user/git-almanac.md`, `README.md`, `man/git-almanac.1`, and this roadmap record. A Decision Record changes only if planning proves the accepted report decision must be superseded rather than clarified.

## Verify

Run focused report tests while iterating, then `bunx tsc --noEmit`, `bun run test:coverage`, `bun run build`, `bunx biome check .`, `bunx knip`, `bun run ki:tools:lint-man`, `bash -n install.sh`, `git diff --check`, and `ki repo audit --repo .`.

Create temporary repositories and report workspaces to prove compatible full and partial refreshes, changed full-contract rebuilds, incompatible partial refusal, foreign and malformed manifest refusal, stale owned-path cleanup, unowned-file preservation, and manifest-last behavior on failure. Exercise `git almanac report --since 2000-01-01` after generating a report with a different interval and inspect the resulting manifest and pages.

## Dependencies / blocks

No functional dependency blocks the work. CLI-003 may touch the same documentation surfaces; fresh planning must sequence or rebase documentation edits without coupling either item's lifecycle or hiding conflicts.

## Documentation impact

### Decision Records

Assess the accepted report-contract Decision Record. Add a superseding decision only if automatic full rebuild contradicts its locked intent; do not rewrite accepted history silently.

### Specifications

Clarify manifest ownership, full rebuild, partial compatibility, stale managed-path cleanup, and manifest publication requirements with explicit verification evidence.

### Guides

Explain that changing report properties triggers a complete rebuild, while named partial refreshes require compatibility, and show where users can inspect the effective manifest contract.

### Roadmap

Retain this item as the independent behavioral delivery record. Keep CLI-003 focused on cross-tool documentation conformance and do not merge their review or acceptance evidence.

## Discussion

### Rebuild semantics

The natural distinction is request completeness, not a force flag: `git almanac report` owns every section and can rebuild its valid managed workspace, while a named partial report cannot prove that untouched sections match a changed contract and must fail closed.

### Property visibility

`reports/git-almanac/manifest.json` already records repository, resolved revision, filters, interval, timezone, identity, metric, theme, sections, and managed paths. Delivery should make that contract understandable without creating a second competing source of truth.

### Safety

A valid manifest grants authority only over its listed managed paths. Rebuild must not turn report ownership into permission to delete unrelated files or overwrite a foreign directory.
