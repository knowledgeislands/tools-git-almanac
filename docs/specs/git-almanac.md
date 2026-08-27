# Git Almanac — ALM

This Specification defines the as-built local Git inspection, output, configuration, and report contract. See the [Specifications index](index.md) for the identifier scheme.

## Repository and history

### ALM-001 — Repository discovery

Every repository-scoped command MUST inspect the Git repository containing the current directory unless the user supplies another repository path. Discovery MUST work from nested directories.

_Verify:_ CLI tests exercise default discovery, explicit paths, nested paths, paths containing spaces, and non-repository errors.

### ALM-002 — Reachable unique history

Analytical commands MUST collect commits reachable from the selected ref through one argument-safe Git history traversal and MUST count each commit object ID at most once.

_Verify:_ tests count Git log invocations, alternate refs, merge graphs, and unique totals.

### ALM-003 — Shared selectors

`calendar`, `authors`, `contributors`, and `report` MUST share repository, ref, since, until, date, author, pathspec, merge, metric, and theme options. The initial metric MUST accept only `commits`.

_Verify:_ parsing and temporary-repository tests exercise every selector and reject unsupported values with usage status 2.

### ALM-004 — Default history contract

The default MUST select `HEAD`, all authors, non-merge commits, author dates, the local timezone, the `commits` metric, and 365 local calendar dates ending today.

_Verify:_ date, timezone, merge-policy, leap-day, interval, and default-model tests assert each field.

## Identity and contribution

### ALM-005 — Exact author identity

Git Almanac MUST preserve each raw Git author as the exact `Name <email>` pair returned by Git and MUST NOT guess identity equivalence or independently apply a mailmap policy.

_Verify:_ author and contributor tests create distinct identities and inspect the normalized models.

### ALM-006 — Author inventory

`authors` MUST list exact identities present in selected history in deterministic identity order, including commit counts and shares of the selected total.

_Verify:_ the expanded command contract asserts identity order, counts, and terminal and JSON output.

### ALM-007 — Contributor ranking

`contributors` MUST rank identities by descending selected commit count, break ties by exact identity, and report percentages of the selected total without treating them as productivity scores.

_Verify:_ contributor tests assert ranking, tie contract, counts, and six-decimal normalized shares.

## Calendar and standalone output

### ALM-008 — Shared calendar model

Every calendar renderer MUST consume one versioned normalized model containing repository identity, selected ref, filters, interval, timezone, counting policy, daily counts, deterministic intensity thresholds, and summary statistics.

_Verify:_ renderer consistency tests compare totals and inspect schema-versioned JSON.

### ALM-009 — Calendar statistics and intensity

The calendar MUST expose total commits, active days, earliest tied busiest day, current streak ending on the final selected date, and longest streak. Empty days MUST use intensity zero; non-zero counts MUST use shared maximum-relative 25%, 50%, 75%, and 100% bands.

_Verify:_ focused calendar tests assert thresholds, levels, ties, and streaks.

### ALM-010 — Static renderer accessibility

Terminal output MUST preserve five distinguishable levels without ANSI color. HTML and SVG MUST be self-contained, and SVG MUST label every displayed date and commit count for hover, keyboard focus, and assistive technology.

_Verify:_ renderer tests assert Unicode fallback, ANSI eligibility, embedded SVG, focusable cells, and accessible labels.

### ALM-011 — Output targeting

Standalone commands MUST write to standard output by default. A recognised `.html`, `.htm`, `.svg`, or `.json` output extension MUST infer format only when `--format` is absent; explicit format MUST win and the exact requested path MUST be used.

_Verify:_ output tests assert inference, explicit override, stdout HTML, deterministic output paths, and write failures.

### ALM-012 — Multi-file calendar export

`calendar --output-dir` MUST write one combined calendar and one deterministic collision-resistant file for every exact selected identity. Multi-file output MUST NOT occur without an explicit output directory.

_Verify:_ calendar-set tests assert the combined file, per-author filenames, and file count.

## Managed report

### ALM-013 — Canonical workspace

`report` MUST generate a linked static report under `<repository-root>/reports/git-almanac/`; optional `calendar`, `authors`, or `contributors` subcommands MUST update only the named compatible section.

_Verify:_ report tests inspect index, section pages, normalized data, combined calendar SVG, and per-contributor SVG assets.

### ALM-014 — Manifest ownership

The report manifest MUST identify its schema, tool, repository, resolved revision, selectors, interval, timezone, identity policy, metric, theme, generated sections, and managed paths. Git Almanac MUST refuse a non-empty directory without a valid manifest and MUST refuse partial combination when the effective contract differs.

_Verify:_ report tests exercise compatible partial updates, incompatible contracts, malformed or missing ownership, and preservation of foreign files.

### ALM-015 — Managed writes

Report files MUST be written through atomic sibling replacement, and the manifest MUST be published after section content. Git Almanac MUST warn when the canonical report path is not ignored.

_Verify:_ report implementation uses temporary sibling writes and rename; command tests inspect warning and final manifest state.

## Configuration and ignore behavior

### ALM-016 — Configuration precedence

Optional `<repository-root>/.git-almanac.toml` MUST use schema 1, reject unknown or malformed values, and apply built-in defaults before repository defaults and CLI arguments. Configuration MUST NOT be required for ordinary commands.

_Verify:_ configuration tests assert nested discovery, parsing, show/check/init behavior, and repository-versus-CLI precedence.

### ALM-017 — Safe initialization

`config init` MUST create the configuration only when absent and MUST validate rather than replace an existing file. `init` MUST compose configuration initialization and ignore management without generating a report.

_Verify:_ initialization tests call commands repeatedly and inspect unchanged valid files and absent report output.

### ALM-018 — Narrowest safe ignore rule

`ignore` MUST make no change when report output is already ignored. Otherwise it MUST add `/reports/` only when no tracked or foreign report content exists, and MUST add `/reports/git-almanac/` when broader ignoring could hide other reports.

_Verify:_ ignore tests cover idempotence, empty report roots, and tracked foreign reports.

## Safety and errors

### ALM-019 — Local read-only inspection

Analytical commands MUST perform no network request and MUST NOT mutate inspected Git history, configuration, refs, index, or working files. Only explicit `report`, `config init`, `ignore`, `init`, or output options may write their documented targets.

_Verify:_ the Git adapter invokes argument arrays and read-only Git operations; acceptance compares repository status fingerprints before and after analytical output.

### ALM-020 — Failure classification

The CLI MUST return status 2 for malformed syntax or option values and status 1 for repository, Git, configuration, ownership, rendering, or output failures. Diagnostics MUST name the rejected value or protected destination.

_Verify:_ error tests assert status and diagnostic families for dates, refs, commands, formats, metrics, Git data, output, configuration, and report ownership.

## Explicit non-goals

Hosted services, forge APIs, network collection, guessed identity merging, a new mailmap policy, productivity scoring, file-change or line-churn metrics, global user configuration, PDF output, cross-repository aggregation, release publication, and Homebrew tap mutation are outside this contract.
