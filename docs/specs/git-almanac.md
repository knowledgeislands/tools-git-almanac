# Git Almanac — ALM

This Specification defines the as-built local Git inspection, output, configuration, and report contract. See the [Specifications index](index.md) for the identifier scheme.

## Repository and history

### ALM-001 — Repository discovery

Every repository-scoped command MUST inspect the Git repository containing the current directory unless the user supplies another repository path. Discovery MUST work from nested directories.

_Conformance:_ conforming

_Verify:_ CLI tests exercise default discovery, explicit paths, nested paths, paths containing spaces, and non-repository errors.

_Evidence:_ `src/tests/cli.test.ts` passes repository discovery, explicit-path, nested-path, space-path, and non-repository cases.

### ALM-002 — Reachable unique history

Analytical commands MUST collect commits reachable from the selected ref through one argument-safe Git history traversal and MUST count each commit object ID at most once.

_Conformance:_ conforming

_Verify:_ tests count Git log invocations, alternate refs, merge graphs, and unique totals.

_Evidence:_ `src/tests/almanac.test.ts` passes alternate-ref, merge-graph, traversal-count, and unique-commit assertions.

### ALM-003 — Shared selectors

`calendar`, `authors`, `contributors`, and `report` MUST share repository, ref, since, until, date, author, pathspec, merge, metric, and theme options. The initial metric MUST accept only `commits`.

_Conformance:_ conforming

_Verify:_ parsing and temporary-repository tests exercise every selector and reject unsupported values with usage status 2.

_Evidence:_ `src/tests/cli.test.ts` passes shared-selector parsing and unsupported-value usage assertions.

### ALM-004 — Default history contract

The default MUST select `HEAD`, all authors, non-merge commits, author dates, the local timezone, the `commits` metric, and 365 local calendar dates ending today.

_Conformance:_ conforming

_Verify:_ date, timezone, merge-policy, leap-day, interval, and default-model tests assert each field.

_Evidence:_ `src/tests/almanac.test.ts` passes default interval, date, timezone, merge-policy, metric, and leap-day assertions.

## Identity and contribution

### ALM-005 — Exact author identity

Git Almanac MUST preserve each raw Git author as the exact `Name <email>` pair returned by Git and MUST NOT guess identity equivalence or independently apply a mailmap policy.

_Conformance:_ conforming

_Verify:_ author and contributor tests create distinct identities and inspect the normalized models.

_Evidence:_ `src/tests/almanac.test.ts` passes exact raw-identity and mailmap-policy assertions.

### ALM-006 — Author inventory

`authors` MUST list exact identities present in selected history in deterministic identity order, including commit counts and shares of the selected total.

_Conformance:_ conforming

_Verify:_ the expanded command contract asserts identity order, counts, and terminal and JSON output.

_Evidence:_ `src/tests/almanac.test.ts` and `src/tests/cli.test.ts` pass deterministic author order, count, share, and JSON assertions.

### ALM-007 — Contributor ranking

`contributors` MUST rank identities by descending selected commit count, break ties by exact identity, and report percentages of the selected total without treating them as productivity scores.

_Conformance:_ conforming

_Verify:_ contributor tests assert ranking, tie contract, counts, and six-decimal normalized shares.

_Evidence:_ `src/tests/almanac.test.ts` passes contributor grouping and six-decimal share assertions.

## Calendar and standalone output

### ALM-008 — Shared calendar model

Every calendar renderer MUST consume one versioned normalized model containing repository identity, selected ref, filters, interval, timezone, counting policy, daily counts, deterministic intensity thresholds, and summary statistics.

_Conformance:_ conforming

_Verify:_ renderer consistency tests compare totals and inspect schema-versioned JSON.

_Evidence:_ `src/tests/almanac.test.ts` passes versioned model, renderer-total, and JSON-schema assertions.

### ALM-009 — Calendar statistics and intensity

The calendar MUST expose total commits, active days, earliest tied busiest day, current streak ending on the final selected date, and longest streak. Empty days MUST use intensity zero; non-zero counts MUST use shared maximum-relative 25%, 50%, 75%, and 100% bands.

_Conformance:_ conforming

_Verify:_ focused calendar tests assert thresholds, levels, ties, and streaks.

_Evidence:_ `src/tests/almanac.test.ts` passes total, active-day, busiest-day, streak, and intensity-band assertions.

### ALM-010 — Static renderer accessibility

Terminal output MUST preserve five distinguishable levels without ANSI color. HTML and SVG MUST be self-contained, and SVG MUST label every displayed date and commit count for hover, keyboard focus, and assistive technology.

_Conformance:_ conforming

_Verify:_ renderer tests assert Unicode fallback, ANSI eligibility, embedded SVG, focusable cells, and accessible labels.

_Evidence:_ `src/tests/almanac.test.ts` passes terminal fallback, ANSI eligibility, embedded SVG, focusability, and accessible-label assertions.

### ALM-011 — Output targeting

Standalone commands MUST write to standard output by default. A recognised `.html`, `.htm`, `.svg`, or `.json` output extension MUST infer format only when `--format` is absent; explicit format MUST win and the exact requested path MUST be used.

_Conformance:_ conforming

_Verify:_ output tests assert inference, explicit override, stdout HTML, deterministic output paths, and write failures.

_Evidence:_ `src/tests/cli.test.ts` passes format inference, explicit override, stdout, exact-path, and write-failure assertions.

### ALM-012 — Multi-file calendar export

`calendar --output-dir` MUST write one combined calendar and one deterministic collision-resistant file for every exact selected identity. Multi-file output MUST NOT occur without an explicit output directory.

_Conformance:_ conforming

_Verify:_ calendar-set tests assert the combined file, per-author filenames, and file count.

_Evidence:_ `src/tests/cli.test.ts` passes combined and per-author calendar export assertions.

## Managed report

### ALM-013 — Canonical workspace

`report` MUST generate a linked static report under `<repository-root>/reports/git-almanac/`; optional `calendar`, `authors`, or `contributors` subcommands MUST update only the named compatible section.

_Conformance:_ conforming

_Verify:_ report tests inspect index, section pages, normalized data, combined calendar SVG, and per-contributor SVG assets.

_Evidence:_ `src/tests/cli.test.ts` passes canonical report workspace, navigation, and optional-artifact assertions.

### ALM-014 — Manifest ownership

The report manifest MUST identify its schema, tool, repository, resolved revision, selectors, interval, timezone, identity policy, metric, theme, generated sections, and managed paths. A complete report request with a valid manifest MUST rebuild every managed section when the effective contract differs. A partial request MUST refuse an incompatible contract. Git Almanac MUST refuse a non-empty directory without a valid manifest, unsafe managed paths, and collisions with unowned paths.

_Conformance:_ conforming

_Verify:_ report tests exercise changed complete contracts, compatible and incompatible partial updates, malformed or missing ownership, unsafe paths, unowned collisions, stale managed-path removal, and preservation of unowned files.

_Evidence:_ `src/tests/cli.test.ts` and `src/tests/report-transaction.test.ts` pass manifest, compatibility, ownership, collision, and stale-path assertions.

### ALM-015 — Managed writes

Report updates MUST be assembled in a sibling staging directory, with the manifest written after section content, and published by replacing the report directory. A failed publication MUST restore the previous workspace and remove transaction artifacts. A complete rebuild MUST remove stale manifest-owned files while preserving unowned files. Git Almanac MUST serialize report updates with a repository-local lock and warn when the canonical report path is not ignored.

_Conformance:_ conforming

_Verify:_ report implementation tests cover staged replacement, simulated publication failure and rollback, lock refusal, warning, and final manifest state.

_Evidence:_ `src/tests/report-transaction.test.ts` passes staged replacement, rollback, locking, ignore warning, and manifest publication assertions.

## Configuration and ignore behavior

### ALM-016 — Configuration precedence

Optional `<repository-root>/.git-almanac.toml` MUST use schema 1, reject unknown or malformed values, and apply built-in defaults before repository defaults and CLI arguments. Configuration MUST NOT be required for ordinary commands.

_Conformance:_ conforming

_Verify:_ configuration tests assert nested discovery, parsing, show/check/init behavior, and repository-versus-CLI precedence.

_Evidence:_ `src/tests/config.test.ts` passes schema, validation, discovery, defaults, and precedence assertions.

### ALM-017 — Safe initialization

`config init` MUST create the configuration only when absent and MUST validate rather than replace an existing file. `init` MUST compose configuration initialization and ignore management without generating a report.

_Conformance:_ conforming

_Verify:_ initialization tests call commands repeatedly and inspect unchanged valid files and absent report output.

_Evidence:_ `src/tests/config.test.ts` passes idempotent initialization and no-report-output assertions.

### ALM-018 — Narrowest safe ignore rule

`ignore` MUST make no change when report output is already ignored. Otherwise it MUST add `/reports/` only when no tracked or foreign report content exists, and MUST add `/reports/git-almanac/` when broader ignoring could hide other reports.

_Conformance:_ conforming

_Verify:_ ignore tests cover idempotence, empty report roots, and tracked foreign reports.

_Evidence:_ `src/tests/config.test.ts` passes idempotent narrow ignore-rule selection with tracked and foreign content.

## Safety and errors

### ALM-019 — Local read-only inspection

Analytical commands MUST perform no network request and MUST NOT mutate inspected Git history, configuration, refs, index, or working files. Only explicit `report`, `config init`, `ignore`, `init`, or output options may write their documented targets.

_Conformance:_ conforming

_Verify:_ the Git adapter invokes argument arrays and read-only Git operations; acceptance compares repository status fingerprints before and after analytical output.

_Evidence:_ `src/tests/almanac.test.ts` passes read-only Git adapter and unchanged repository-state assertions.

### ALM-020 — Failure classification

The CLI MUST return status 2 for malformed syntax or option values and status 1 for repository, Git, configuration, ownership, rendering, or output failures. Diagnostics MUST name the rejected value or protected destination.

_Conformance:_ conforming

_Verify:_ error tests assert status and diagnostic families for dates, refs, commands, formats, metrics, Git data, output, configuration, and report ownership.

_Evidence:_ `src/tests/cli.test.ts`, `src/tests/config.test.ts`, and `src/tests/report-transaction.test.ts` pass status and diagnostic-family assertions.

## Explicit non-goals

Hosted services, forge APIs, network collection, guessed identity merging, a new mailmap policy, productivity scoring, file-change or line-churn metrics, global user configuration, PDF output, cross-repository aggregation, release publication, and Homebrew tap mutation are outside this contract.
