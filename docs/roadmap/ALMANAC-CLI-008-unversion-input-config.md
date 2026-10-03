---
id: ALMANAC-CLI-008
area: CLI
title: Unversion input config
theme: cli
horizon: next
status: ready
blocks: []
blocked_by: []
baseline_ref: null
created_at: 2026-10-03T04:00:16Z
updated_at: 2026-10-03T06:43:44Z
---

## Goal

Make newly written Git Almanac input configuration unversioned while keeping each generated JSON contract independently identified as v1.

## Context

`.git-almanac.toml` currently requires `schema = 1`. Activity, people and report output already declare version 1. The approved treatment is one current input shape with no authored version field; old known files may be read and offered a previewed repair. Generated contracts retain their own v1 identity, with additive-field tolerance for consumers.

## Boundary

Do not introduce `latest`, `pre-release`, `0` or an estate-wide version. Do not infer compatibility from a marker when the actual structure is unknown, silently rewrite on read, prompt in non-interactive runs, or collapse distinct output contracts into one version namespace.

## Current state

Input parsing and examples require a version field. Output contract versions are already at v1 and need only audit and consumer-compatibility tests.

## Steps

- [ ] Audit config parsing, init/capture paths and examples; accept the current shape without a schema field.
- [ ] Read only recognised legacy `schema = 1` shape. Add `config repair [repository]` as a read-only exact-change preview and `config repair [repository] --apply` as the explicit repair; revalidate the candidate and refuse a changed file before writing.
- [ ] Check generated JSON identities and flexible additive-field consumers, then update tests, help, completion, manual and user guidance as affected.

## Files touched

- `src/config/config.ts`, CLI config-writing and repair surfaces
- `src/tests/config.test.ts` and output contract tests
- `man/git-almanac.1`, user guide and examples
- This roadmap item

## Verify

Run the repository audit, coverage, build, Biome and manual gates. Test unversioned new config, recognised legacy repair, unknown-shape rejection, non-interactive no-write behaviour and output v1 identities.

## Dependencies / blocks

No external dependency. The explicit `--apply` action must show the exact removal and must never prompt or write during a read-only command.

## Documentation impact

### Decision Records

Only needed if the parser contract differs materially from the approved treatment.

### Specifications

Update input and generated-output contract descriptions.

### Guides

Explain unversioned input and explicit repair.

### Roadmap

Record delivered behaviour and verification here.

## Discussion

The existing output version value of 1 stays per contract; it is not a reason to keep a version marker in user-authored input.
