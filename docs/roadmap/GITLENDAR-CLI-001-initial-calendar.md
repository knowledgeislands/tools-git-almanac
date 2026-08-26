---
id: GITLENDAR-CLI-001
area: CLI
title: Initial activity calendar
theme: cli
horizon: now
status: ready
blocks: []
blocked_by: []
baseline_ref: null
---

# GITLENDAR-CLI-001: Initial activity calendar

## Goal

A user can turn one local Git repository's trailing activity into a trustworthy, polished calendar in terminal, HTML, SVG, or JSON form.

## Context

The repository identity and toolchain are being established. The product must use one local Git history traversal, share one normalized model across every renderer, remain read-only, and provide a direct local-development entry point.

## Boundary

This delivery excludes hosted services, forge APIs, cross-repository aggregation, productivity scoring, publication, and release.

## Current state

The repository has its confirmed identity, current KI configuration, TypeScript/Bun toolchain scaffold, direct development executable, and this draft delivery record. It does not yet collect or render activity.

## Steps

- [ ] Establish the normalized date, activity, counting-policy, intensity, and statistics model.
- [ ] Implement the argument-safe Git adapter and concise CLI contract using one history traversal.
- [ ] Implement terminal, SVG, HTML, and versioned JSON renderers over the shared model.
- [ ] Add contract-level temporary-repository tests for boundaries, filters, refs, merge policy, accessibility, consistency, and determinism.
- [ ] Add the manual, completion output, installer, local link mode, Specifications, Guides, README examples, sample report, CI, and release guidance.
- [ ] Run the complete engineering and repository gates, then perform a read-only acceptance run against hnr-backend.
- [ ] Prepare the Homebrew tap trade and assemble the canonical awaiting-review packet.

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

## Discussion

### Delivery shape

The agreed architecture is a Git process adapter feeding a normalized activity model and statistics layer consumed by terminal, SVG, HTML, and JSON renderers.

### Distribution

The repository will prepare the installer, manual, release guidance, and a governed Homebrew handoff. An installable tap formula remains dependent on an immutable release.
