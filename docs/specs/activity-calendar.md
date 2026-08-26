# Activity calendar — CAL

The as-built local Git activity and rendering contract. See the [Specifications index](index.md) for the ID scheme.

## Collection

### CAL-001 — Repository discovery

The year command MUST inspect the Git repository containing the current working directory unless the user supplies another repository path.

_Verify:_ `src/tests/cli.test.ts` exercises default discovery, an explicit path, a path containing spaces, and a non-repository error.

### CAL-002 — Reachable unique history

The collector MUST count each commit object reachable from the selected ref once through one argument-safe Git history traversal.

_Verify:_ `src/tests/cli.test.ts` counts the Git log invocation, alternate refs, and merge-graph reachability.

### CAL-003 — Default counting policy

The default model MUST include all authors, exclude merges, group by author date in the local timezone, and count 365 local calendar dates ending today.

_Verify:_ `src/tests/cli.test.ts` covers author and committer dates, timezone rollover, merge policy, leap day, and the trailing boundary.

### CAL-004 — Explicit filters

The year command MUST support author, Git pathspec, ref, since, until, date-field, and merge-policy overrides without shell interpolation.

_Verify:_ `src/tests/cli.test.ts` exercises every option against deliberately dated temporary repositories.

## Model and statistics

### CAL-005 — Shared normalized model

Every renderer MUST consume one normalized model containing repository identity, selected ref and filters, interval and timezone, counting policy, daily counts, deterministic intensity thresholds, and summary statistics.

_Verify:_ renderer consistency tests compare totals and inspect the versioned JSON model.

### CAL-006 — Deterministic intensity

The model MUST assign zero to empty days and four non-zero levels using the shared 25%, 50%, 75%, and 100% maximum-relative thresholds.

_Verify:_ the stable-intensity contract test produces daily counts of one through four and asserts thresholds and levels.

### CAL-007 — Activity statistics

The model MUST report total commits, active days, earliest tied busiest day, current streak ending on the selected until date, and longest streak.

_Verify:_ empty, inactive, and consecutive-activity contract tests assert every statistic.

## Rendering

### CAL-008 — Terminal output

Terminal output MUST show month and weekday labels, five intensity states, summary statistics, and a non-colour intensity fallback.

_Verify:_ terminal contract tests inspect the summary, fallback characters, and ANSI eligibility.

### CAL-009 — Accessible static output

HTML and SVG output MUST remain self-contained and label every displayed day with its date and commit count for hover and keyboard access.

_Verify:_ renderer contract tests assert embedded SVG, roles, focusable day groups, and accessible labels.

### CAL-010 — Versioned JSON

JSON output MUST expose schemaVersion 1 and the complete normalized model with an explicit generation timestamp.

_Verify:_ JSON contract tests parse the output, assert model fields, and compare deterministic runs with an injected clock.

## Safety and errors

### CAL-011 — Local read-only operation

The collector MUST perform no network request and MUST NOT mutate inspected Git history, configuration, refs, index, or working files.

_Verify:_ contract tests compare the inspected HEAD before and after output failure, and the product adapter invokes only read-only Git commands.

### CAL-012 — Helpful failure

The CLI MUST reject malformed dates and syntax with status 2 and invalid repositories, refs, Git data, or output operations with status 1.

_Verify:_ the error contract tests assert exit status and named diagnostic text for each failure family.
