---
id: ALMANAC-CLI-008
area: CLI
title: Unversion input config
theme: cli
horizon: next
status: done
blocks: []
blocked_by: []
baseline_ref: 1322b6cd88da62f6e5f7ddedef9b1b56458bcda8
created_at: 2026-10-03T04:00:16Z
updated_at: 2026-10-03T07:30:08Z
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

- [x] Audit config parsing, init/capture paths and examples; accept the current shape without a schema field.
- [x] Read only recognised legacy `schema = 1` shape. Add `config repair [repository]` as a read-only exact-change preview and `config repair [repository] --apply` as the explicit repair; revalidate the candidate and refuse a changed file before writing.
- [x] Check generated JSON identities and flexible additive-field consumers, then update tests, help, completion, manual and user guidance as affected.

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

## Review

### Delivered

Against baseline `1322b6cd88da62f6e5f7ddedef9b1b56458bcda8`, newly initialized and shown configuration omits the schema field. Recognised legacy input remains readable; repair previews the exact removed line and requires explicit `--apply`. Generated activity, people and manifest contracts remain independently at v1. No release or push is included.

### Change Summary

Updated the config parser and writer, added guarded repair and CLI routing, expanded focused tests, and aligned help, manual, specification, user guides and changelog. Top-level shell completion lists commands rather than config subactions, so no completion definition changed.

### Verification

`bun run test:coverage` passed 55 tests at 100% statement, branch, function and line coverage. `bun run build`, `bunx biome check`, `bun run ki:tools:lint-man`, `ki repo audit --repo .` (21 skills), and `git diff --check` passed. Tests cover unversioned initialization, legacy reads and explicit repair, changed-file refusal, unknown schema rejection, output v1 and additive manifest tolerance.

### Outstanding concerns

None within this item. Acceptance and any release remain separate decisions.

### Post-change review

The approved input/output boundary is preserved. Read-only commands do not rewrite configuration; explicit repair refuses an invalid or changed source. The new command and public documentation align, with low regression risk supported by the full local gate.

### Mini recap

Git Almanac now writes unversioned input, reads recognised legacy v1 input, and offers guarded explicit repair; all local gates passed. No further learning route is needed beyond the updated specification and guides.

## Done

Accepted 2026-10-03 by Kris Brown on the review packet above.

## Discussion

The existing output version value of 1 stays per contract; it is not a reason to keep a version marker in user-authored input.
