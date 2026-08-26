---
id: GITLENDAR-CLI-001
area: CLI
title: Initial activity calendar
theme: cli
horizon: now
status: awaiting-review
blocks: []
blocked_by: []
baseline_ref: 54adf837553b00d990ff681dd385ca3650e85ac5
---

# GITLENDAR-CLI-001: Initial activity calendar

## Goal

A user can turn one local Git repository's trailing activity into a trustworthy, polished calendar in terminal, HTML, SVG, or JSON form.

## Context

The repository identity and toolchain are being established. The product must use one local Git history traversal, share one normalized model across every renderer, remain read-only, and provide a direct local-development entry point.

## Boundary

This delivery excludes hosted services, forge APIs, cross-repository aggregation, productivity scoring, publication, and release.

## Current state

The repository now provides the complete initial CLI, four shared-model renderers, local and release distribution surfaces, contract tests, documentation, and a submitted Homebrew handoff. The delivery is awaiting human review before any release or publication.

## Steps

- [x] Establish the normalized date, activity, counting-policy, intensity, and statistics model.
- [x] Implement the argument-safe Git adapter and concise CLI contract using one history traversal.
- [x] Implement terminal, SVG, HTML, and versioned JSON renderers over the shared model.
- [x] Add contract-level temporary-repository tests for boundaries, filters, refs, merge policy, accessibility, consistency, and determinism.
- [x] Add the manual, completion output, installer, local link mode, Specifications, Guides, README examples, sample report, CI, and release guidance.
- [x] Run the complete engineering and repository gates, then perform a read-only acceptance run against hnr-backend.
- [x] Prepare the Homebrew tap trade and assemble the canonical awaiting-review packet.

## Files touched

The expected scope is the standalone tools-gitlendar repository: product source under `src/`, executable and installer surfaces, tests, toolchain configuration, CI, manual, documentation, sample output, outgoing Homebrew trade, and this roadmap record.

## Verify

Run `bun run test:coverage`, `bun run build`, `ki repo audit --repo .`, `bun run ki:tools:lint-man`, direct development and built executable smoke checks, renderer consistency checks, and a read-only hnr-backend acceptance run.

## Dependencies / blocks

The installed `knowledgeislands/ki-agentic-harness` supplies the governing skills and local roadmap adapter. Homebrew installation remains blocked on a separately authorised immutable v0.1.0 release and the tap receiver's independent application.

## Documentation impact

### Decision Records

No Decision Record is needed: the user approved the language, product boundary, renderer set, local-development mode, and awaiting-review delivery plan.

### Specifications

Add an as-built CLI and counting contract under `docs/specs/`.

### Guides

Add local-development, installation, and release guidance under `docs/guides/`.

### Roadmap

Retain this item as the canonical delivery and review record; no additional local roadmap item is planned.

## Review

### Delivered

From immutable baseline `54adf837553b00d990ff681dd385ca3650e85ac5`, the standalone `gitlendar` repository now turns one local repository or monorepo path into terminal, HTML, SVG, or JSON annual activity output. It includes direct checkout execution, development linking, completion output, a manual, CI and release workflows, a sample SVG, governed release and Homebrew guidance, and reciprocal `ki-all` registration. The reviewed implementation and test-fix evidence ends at `2a1dd6b0672691dca36287edd76e5ca106707be4` before this packet refresh. Tagging, release publication, and Homebrew tap implementation remain outside the accepted delivery boundary.

### Summary of changes

- Added an argument-safe, read-only Git process adapter that performs one history traversal per calendar request.
- Added a typed normalized model, local-timezone date grouping, summary statistics, and deterministic shared intensity bands.
- Added terminal, self-contained HTML, accessible standalone SVG, and versioned JSON renderers.
- Added 19 contract tests using deliberately dated temporary repositories, including filtering, refs, merges, timezones, boundaries, accessibility, renderer consistency, and installer linking.
- Added KI-conformant repository governance, Specifications, Guides, installer, manual, CI, release packaging, and outbound Homebrew trade `TRD-96f0b04f`.
- Resolved three non-failing Biome environment-access notices in the missing-Git contract test and added reciprocal `ki-all` Agora consent.
- Aligned the live GitHub repository with the declared public KI standard: synchronized description, squash-only merges, branch cleanup, feature toggles, dependency security, secret protection, and public topics.
- Initialized ephemeral Claude and Codex repository skill surfaces and aligned KI/XDG registry state so CI can run the canonical full audit on a blank runner.

### Verification

- `bunx tsc --noEmit`, `bun run test`, `bun run test:coverage`, `bunx biome check .`, `bunx rumdl check .`, `bunx knip`, `bunx syncpack lint`, `bun run build`, `shellcheck install.sh`, `bun run ki:tools:lint-man`, and `git diff --check` passed during review.
- All 19 tests passed with 100% statements, branches, functions, and lines over product code.
- `ki repo audit --repo .` passed all 16 declared capabilities against the selected canonical Harness.
- The scoped live-GitHub `ki-repo` audit passed after the repository settings were conformed.
- An isolated clean-clone reproduction with the CI bootstrap passed the full 16-capability audit using only ephemeral runtime markers, managed repository skill links, and explicit local registry state.
- The bundled Node release executable reported `gitlendar 0.1.0`.
- `./bin/gitlendar year` and local terminal, SVG, HTML, and JSON renders agreed on nine commits across one active day; all generated reports were written under `/tmp`.
- `./install.sh --link` linked the executable and manpage into temporary install directories, and the linked executable reported `gitlendar 0.1.0`.
- The linked executable rendered all four `hnr-backend` formats with identical totals: 2,749 commits across 266 active days from 2025-08-27 through 2026-08-26. The SVG was 89,651 bytes.
- The `hnr-backend` acceptance repository remained clean at `8d91089114199aeede3531de13c5e1d36a58a195`; its Git status fingerprint was unchanged after all four renders.
- `ki repo audit --skill ki-agora --repo .` passed in both `tools-gitlendar` and the Agora home. `ki agora show estate` includes `tools-gitlendar`, and `ki agora show ki-all` resolves 19 reciprocal members including this repository.
- The GitHub repository exists and its `main` branch contained the complete initial delivery before these review commits.

### Outstanding concerns

- `v0.1.0` remains untagged and unpublished pending explicit release approval.
- The Homebrew formula cannot be finalized until an immutable release exists and the tap independently receives and accepts `TRD-96f0b04f`.
- No implementation or verification concerns remain for the approved delivery boundary.

### Post-change review

All formats consume the same normalized model, so totals and counting rules cannot drift by renderer. Git invocation uses argument arrays, pathspecs containing spaces are covered by contract tests, empty histories and invalid inputs fail helpfully, and inspected repositories remain unchanged. The review exercise reproduced those properties against both this repository and `hnr-backend`; no network or forge integration entered the product core.

### Mini recap

The initial product outcome is complete, locally usable, present on GitHub, registered in the local estate, and reciprocally admitted to `ki-all`. Human review can exercise `./bin/gitlendar year`, inspect `examples/gitlendar.svg`, and use `./install.sh --link`; acceptance, release, and tap work remain deliberately gated.

## Discussion

### Delivery shape

The agreed architecture is a Git process adapter feeding a normalized activity model and statistics layer consumed by terminal, SVG, HTML, and JSON renderers.

### Distribution

The repository will prepare the installer, manual, release guidance, and a governed Homebrew handoff. An installable tap formula remains dependent on an immutable release.
