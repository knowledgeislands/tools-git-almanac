---
id: ALMANAC-CLI-004
area: CLI
title: Rebuild changed reports
theme: cli
horizon: next
status: done
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

`src/report/workspace.ts` now validates the complete manifest contract and managed paths, distinguishes complete rebuilds from compatibility-bound partial refreshes, stages the whole replacement workspace under a lock, preserves unowned files, removes stale owned paths, and rolls back a failed publication. `manifest.json` remains the single authoritative record of repository identity, resolved ref, filters, interval, timezone, counting and identity policy, metric, theme, sections, and managed paths.

The report writer publishes a complete staged workspace with its manifest written last. It swaps the staged directory into place only after generation succeeds and restores the previous directory if publication fails.

## Steps

- [x] Define the complete-versus-partial compatibility decision before filesystem mutation, including lock, staging, rollback, unowned-file, and stale-managed-path rules.
- [x] Refactor report-workspace handling so a compatible request refreshes normally, an incompatible full request rebuilds every section, and an incompatible partial request continues failing closed.
- [x] Rebuild only manifest-owned content, safely remove obsolete manifest-owned assets after replacement content succeeds, preserve unowned files, and publish the new manifest last.
- [x] Keep `manifest.json` as the authoritative property record and add a concise human-readable contract view only if it does not create duplicated mutable state.
- [x] Extend in-process CLI and temporary-repository tests across changed dates, ref, author and path filters, merge policy, date field, timezone, metric, theme, repository identity, compatible refreshes, incompatible partial requests, stale managed paths, unowned files, malformed manifests, and simulated write failure.
- [x] Update the report specification and user guidance to distinguish automatic complete rebuilds from compatibility-bound partial refreshes.
- [x] Run the complete engineering and KI gates, exercise a changed full rebuild against a temporary clone, and stop at `awaiting-review` without pushing, releasing, tagging, or publishing.

## Files touched

Expected scope is `src/report/workspace.ts`, narrowly related CLI orchestration or report types only if required, report-focused tests under `src/tests/`, `docs/specs/git-almanac.md`, `docs/guides/user/git-almanac.md`, `README.md`, `man/git-almanac.1`, and this roadmap record. A Decision Record changes only if planning proves the accepted report decision must be superseded rather than clarified.

## Verify

Run focused report tests while iterating, then `bunx tsc --noEmit`, `bun run test:coverage`, `bun run build`, `bunx biome check .`, `bunx knip`, `bun run ki:tools:lint-man`, `bash -n install.sh`, `git diff --check`, and `ki repo audit --repo .`.

Create temporary repositories and report workspaces to prove compatible full and partial refreshes, changed full-contract rebuilds, incompatible partial refusal, foreign and malformed manifest refusal, stale owned-path cleanup, unowned-file preservation, and manifest-last behavior on failure. Exercise `git almanac report --since 2000-01-01` after generating a report with a different interval and inspect the resulting manifest and pages.

## Dependencies / blocks

No functional dependency blocks the work. CLI-003 may touch the same documentation surfaces; fresh planning must sequence or rebase documentation edits without coupling either item's lifecycle or hiding conflicts.

## Documentation impact

### Decision Records

The current living product Decision Record was updated in place, as required by the KI Decision Record standard, to state the automatic complete-rebuild and compatibility-bound partial-refresh contract.

### Specifications

Clarify manifest ownership, full rebuild, partial compatibility, stale managed-path cleanup, and manifest publication requirements with explicit verification evidence.

### Guides

Explain that changing report properties triggers a complete rebuild, while named partial refreshes require compatibility, and show where users can inspect the effective manifest contract.

### Roadmap

Retain this item as the independent behavioral delivery record. Keep CLI-003 focused on cross-tool documentation conformance and do not merge their review or acceptance evidence.

## Review

### Delivered

- Complete report requests rebuild all managed sections when any manifest-recorded generation property changes; named partial reports remain compatibility-bound.
- Whole-workspace staging, a repository-local lock, manifest validation, unowned-path collision checks, stale owned-path cleanup, directory publication, and rollback protect report updates.
- The existing product Decision Record, specification, guide, README, CLI help, and manual describe the current rebuild contract and manifest inspection path.

### Summary of changes

- `3f0c967 feat(report): rebuild changed complete reports` implements the transaction and adds report-contract, filesystem-safety, repository-identity, and publication-failure coverage.
- `115112a docs(report): describe automatic complete rebuilds` reconciles the living decision, specification, guide, README, and manual.
- `37c0e75 test(report): split filesystem safety cases` resolves the final KI audit's long-running-test finding without reducing coverage.
- `./install.sh --link` refreshed the local executable and manual links; no repository, tap, release, tag, or publication mutation was performed.

### Verification

- Focused report suite: 15 tests passed across `src/tests/almanac.test.ts` and `src/tests/report-transaction.test.ts`.
- Complete suite: 53 tests passed with 100% statements, branches, functions, and lines.
- `bunx tsc --noEmit`, `bun run build`, `bunx biome check .`, `bunx knip`, `bun run ki:tools:lint-man`, `bash -n install.sh`, and `git diff --check` passed; Knip retained two existing configuration hints only.
- Full `ki repo audit --repo .` passed all 17 declared skills.
- A clean temporary clone passed changed interval, theme, date-field, merge-policy, and ref rebuilds; incompatible partial refusal left the manifest unchanged; unowned content survived; no transaction artifacts remained.

### Outstanding concerns

None within the approved scope.

### Post-change review

The implementation grants replacement authority only through a valid manifest's managed paths. Complete rebuilds remove stale owned files but preserve unowned files, while malformed ownership, unsafe filesystem shapes, unowned collisions, concurrent locks, and incompatible partial requests fail closed. Simulated initial and replacement publication failures leave no partial report. Documentation now matches this behavior, and the current Decision Record remains a living present-state record.

### Mini recap

ALMANAC-CLI-004 is implemented, verified, committed, and ready for human review at `awaiting-review`. Its immutable baseline is `e4be1838a03e07cbfcdc9730812361bd1ffe6c54`. No push, release, tag, or publication occurred.

## Done

Accepted by the user on 2026-08-28 after review of the automatic rebuild behavior, transaction safety evidence, complete verification gates, and clean repository state. The done record is retained.

## Discussion

### Rebuild semantics

The natural distinction is request completeness, not a force flag: `git almanac report` owns every section and can rebuild its valid managed workspace, while a named partial report cannot prove that untouched sections match a changed contract and must fail closed.

### Property visibility

`reports/git-almanac/manifest.json` already records repository, resolved revision, filters, interval, timezone, identity, metric, theme, sections, and managed paths. Delivery should make that contract understandable without creating a second competing source of truth.

### Safety

A valid manifest grants authority only over its listed managed paths. Rebuild must not turn report ownership into permission to delete unrelated files or overwrite a foreign directory.
