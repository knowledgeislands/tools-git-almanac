---
id: PDR-ALMANAC-001
title: 'Git Almanac command and report contract'
date: 2026-08-27
status: current
decision_type: product
decision_type_url: https://knowledgeislands.info/specifications/decision-records/pdr
decision_depends_on: ["GDR-ALMANAC-001"]
---

# PDR-ALMANAC-001: Git Almanac command and report contract

## Context

Git Almanac begins with a trustworthy local activity-calendar engine, while its intended surface also inventories author identities, ranks contribution activity, and assembles those views into a coherent report. These views share repository discovery, history selectors, counting semantics, and normalized data. Standalone commands must remain pipe-friendly, while multi-file output requires a predictable owned workspace and safeguards against overwriting unrelated files.

## Decision

Git Almanac adopts the following product contract:

- `git-almanac` is the executable, naturally invoked as `git almanac`, and `ALMANAC` is the stable roadmap scope.
- `calendar`, `authors`, and `contributors` are standalone local-history views; `report` assembles all or one named view; `config`, `ignore`, and `init` manage optional repository-local defaults and report hygiene.
- Shared history options select one repository, ref, date interval, date field, author pattern, pathspec set, and merge policy. `commits` is the only accepted metric until another metric receives its own semantics and verification.
- Author identity is the exact raw Git `Name <email>` pair. Git Almanac does not guess identity equivalence or apply a separate mailmap policy.
- Single-file commands write to standard output unless `--output` is present. A recognised output extension infers HTML, SVG, or JSON when `--format` is absent; an explicit format wins. Calendar sets require `--output-dir`.
- Managed static reports live under `<repository-root>/reports/git-almanac/`. A versioned manifest records the effective repository, revision, selectors, timezone, identity, metric, theme, sections, and managed paths. A missing, invalid, or incompatible manifest prevents overwrite or partial combination.
- Optional `<repository-root>/.git-almanac.toml` defaults apply after built-ins and before CLI arguments. `ignore` adds the broad `/reports/` rule only when safe and otherwise adds `/reports/git-almanac/`; `init` configures defaults and ignore behavior without generating a report.
- Repository inspection remains read-only and offline. Release, publication, hosted reporting, forge APIs, identity consolidation, and metrics other than commits remain outside this contract.

## Consequences

Every analytical command can reuse one argument-safe Git history traversal and one normalized counting contract. Users can pipe standalone output, generate deterministic contributor calendar sets deliberately, or incrementally refresh a protected local report. Exact identities can appear separately when Git history contains aliases, and commit shares describe selected history rather than productivity. Configuration stays safe to commit because it contains repository defaults only, while report artifacts can be ignored without hiding unrelated reports.

## References

- [GDR-ALMANAC-001](GDR-ALMANAC-001-adopting-decision-records.md) — establishes the Decision Record collection governing this product record.
