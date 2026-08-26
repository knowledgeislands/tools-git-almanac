---
id: GITLENDAR-CLI-002
area: CLI
title: List repository authors
theme: cli
horizon: now
status: draft
blocks: []
blocked_by: []
baseline_ref: null
---

# GITLENDAR-CLI-002: List repository authors

## Goal

The user can list the distinct Git author identities in one repository before selecting an author filter for a calendar.

## Context

The year command accepts Git's `--author` pattern, but users currently need a separate Git command to discover which author identities are present.

## Boundary

This delivery adds a read-only `gitlendar authors [repository]` command over history reachable from `HEAD`. It excludes identity merging, mailmap policy changes, contribution scoring, forge accounts, and network access.

## Current state

The CLI has a year-level author filter and a read-only Git adapter, but it has no author-discovery command.

## Steps

- [ ] Define the authors-command identity and ordering contract.
- [ ] Add argument-safe author collection and CLI parsing/output.
- [ ] Cover populated, duplicate-identity, empty, and invalid-repository behavior through the in-process CLI seam.
- [ ] Update help, completion, specification, guide, manual, README, and changelog surfaces.
- [ ] Run the focused tests and complete repository gate.

## Files touched

Expected scope is the Git adapter, CLI parsing/run/help modules, shared types, CLI tests, user and specification documentation, manual, changelog, README, and this roadmap record.

## Verify

Run `bun run test:coverage`, `bun run build`, `bun ki:tools:lint-man`, `bun run check`, and `ki repo audit --repo .`; exercise `./bin/gitlendar authors` against this repository and the read-only `hnr-backend` acceptance repository.

## Dependencies / blocks

The command reuses the delivered local Git execution seam. It has no external dependency and does not block the initial calendar review.

## Documentation impact

### Decision Records

No Decision Record is needed for this bounded CLI extension.

### Specifications

Extend the activity-calendar specification with the authors-command contract.

### Guides

Add author discovery to the user and local-development guides.

### Roadmap

Retain this item as the canonical delivery and review record, independently of GITLENDAR-CLI-001.

## Discussion

The command should emit stable, script-friendly `Name <email>` lines that can be copied into `gitlendar year --author`.
