---
id: ALMANAC-CLI-003
area: CLI
title: Reconcile tool documentation
theme: cli
horizon: next
status: done
blocks: []
blocked_by: []
baseline_ref: a7cad61bf2458de20075fb6479ce36e82494022d
---

# ALMANAC-CLI-003: Reconcile tool documentation

## Goal

Users and maintainers encounter coherent, correctly rendered, and tool-appropriate documentation across Git Almanac, mgit, and the Knowledge Islands CLI.

## Context

The three Knowledge Islands tool repositories have evolved independently and now expose differences in documentation structure, terminology, coverage, and presentation. One visible example is missing visual separation after headings in the Git Almanac manual page. A later bounded reconciliation should identify material inconsistencies across the complete documentation surfaces rather than repairing isolated symptoms opportunistically.

The documentation repositories in scope are `knowledgeislands/tools-git-almanac`, `knowledgeislands/tools-mgit`, and `knowledgeislands/tools-ki`. The governing checker and safe conformance implementation is owned by `knowledgeislands/ki-agentic-harness` under `ki-repo-tools`.

## Boundary

Reconcile user-facing manual pages, CLI help, READMEs, guides, specifications, installation and release instructions, examples, terminology, links, navigation, and documented command behavior across the three tools. Establish shared conventions where they improve comprehension while preserving intentional tool-specific structure and behavior.

The tool changes are documentation-only. Help text embedded in runtime source may change, but command parsing, execution, outputs, exit behavior, and other runtime contracts may not. The Harness change may add deterministic manual-layout audit and safe conformance behavior only within `ki-repo-tools`; it must not alter unrelated skill contracts. The item excludes new CLI capabilities, release publication, package publication, tags, and unrelated repository conformance changes. Implementation must retain atomic per-repository commits and preserve unrelated work.

## Current state

Implementation starts from Git Almanac `a7cad61bf2458de20075fb6479ce36e82494022d`, mgit `e4a970821513937dd20dc666982d6faaad9144f1`, tools-ki `0bd79f8ff9644700bcbf55ddf5fe3f414d0bc0ad`, and KI Agentic Harness `712976bb0de9bebd9c64d8307d67e8a2599a2fde`. Git Almanac, mgit, and KI Agentic Harness were clean. The tools-ki workspace contained concurrent, preserved `.gitignore` and `vitest.config.ts` conformance edits; its full KI audit passed with those edits present, and this delivery must neither claim nor stage them.

All four repositories are clean. Their reshaping baselines are Git Almanac `bf68935f14f80ed2ec681aad179f1c258ca96850`, mgit `fd1a05a3bf774271912743630b8a2448dc219308`, tools-ki `0e4cbd2d387f72844cd4400961bd31916371ce66`, and KI Agentic Harness `712976bb0de9bebd9c64d8307d67e8a2599a2fde`. The three sibling repositories contain concurrent, unrelated roadmap and trade commits ahead of their remotes; those commits are baseline state and must not be rewritten or incorporated into item-specific commits.

All three physical manuals pass `mandoc -T lint` and the current `ki-repo-tools` audit, but neither gate proves the standard's rendered-spacing contract. The standard requires a literal `\&` after every `.SH` and `.SS`, followed by `.PP` before prose or a structural macro. Git Almanac omits the separator after all 15 headings; mgit and tools-ki have the separator but do not consistently include the required paragraph macro before structural content. `MAN-STYLE` is currently judgment-only, so these objective divergences do not fail audit or produce a conform proposal.

## Steps

- [x] Build one command-and-documentation matrix for each tool covering the executable help hierarchy, installer help, manual, README, guides, specifications, examples, navigation, configuration files, completion command, and release guidance at the recorded baselines.
- [x] Establish the shared contract from current KI tool and authoring standards: source authority is explicit, command and option claims match executable help, terminology is internally consistent, links and navigation resolve, examples are runnable, and intentional tool-specific differences are recorded.
- [x] Extend the Harness `ki-repo-tools` rubric with a deterministic failing manual-spacing criterion and focused fixtures; add safe, idempotent conform behavior for the literal separator and paragraph macro when the physical roff source is unambiguous, while retaining judgment review for broader layout and FILES quality.
- [x] Prove the released checker gap with pre-change fixtures, then use the updated local Harness audit and conform path against all three tools so the shared rule drives repository fixes rather than duplicating ad hoc checks.
- [x] Reconcile `git-almanac(1)`, including literal separators and paragraph macros after every heading, then align Git Almanac help, README, guides, specifications, examples, installation, and release guidance with the verified command surface.
- [x] Reconcile `mgit(1)`, embedded contextual and installer help, README, user and developer guides, and specifications against actual Bash command behavior while preserving its standalone Bash runtime and intentional workspace terminology.
- [x] Reconcile `ki(1)`, generated command help and descriptions, README, governance and developer guides, and specifications against the current command tree while preserving its existing CLI behavior and normative/specification boundaries.
- [x] Add repository-local regression checks only where the shared Harness audit cannot cover a tool-specific source-of-truth relationship; do not duplicate the portable manual-spacing rule in three repositories.
- [x] Render every manual at representative widths, exercise documented help and examples, run the complete native and KI gates in each repository, and compare each working tree against its recorded baseline for behavior-only drift.
- [x] Commit each repository independently with atomic Conventional Commits, assemble one cross-repository evidence summary in this canonical record, and stop at `awaiting-review` without pushing, releasing, tagging, or publishing unless separately authorized.

## Files touched

Git Almanac scope is `README.md`, `man/git-almanac.1`, help-only text in `src/cli/help.ts` and `install.sh`, related CLI or manual tests under `src/tests/`, `docs/guides/**`, `docs/specs/**`, `examples/git-almanac.svg` only if its surrounding documented contract changes, and this roadmap record. `CHANGELOG.md` changes only when an existing user-facing claim must be corrected; no release entry is created.

mgit scope is `README.md`, `man/mgit.1`, help-only text in `bin/mgit` and `install.sh`, related assertions in `tests/mgit.bats`, `docs/guides/**`, and `docs/specs/**`. The executable remains pure Bash and no package toolchain is introduced.

tools-ki scope is `README.md`, `man/ki.1`, help-only descriptions under `src/commands/**` or their registration sites, related CLI/manual assertions under `src/tests/**`, `docs/guides/**`, and `docs/specs/**`. Decision Records and portable normative contracts change only if reconciliation proves an existing contradiction; no new product decision is in scope.

KI Agentic Harness scope is the `ki-repo-tools` rubric item and context needed to read and safely propose manual-source changes, focused rubric/session fixtures, and generated rubric publication required by the native skill gate. Existing standards already state the desired rule and change only if implementation exposes ambiguity.

Documentation-specific CI configuration in each repository may change only when required to run the agreed regression check. No fifth repository, generated release asset, Homebrew tap, or published artifact is in scope.

## Verify

In the Harness, run focused `ki-repo-tools` rubric tests, `bunx tsc --noEmit`, `bun run test`, `ki repo audit --skill ki-skills --repo .`, and the full repository audit. Prove audit fails a physical manual missing either required spacing token, conform produces the minimal idempotent patch for a safe source, unsafe or ambiguous sources remain diagnostic, and the post-conform audit passes.

In every tool repository, run `mandoc -T lint` for the physical manual, render with `mandoc -T utf8 ... | col -b` at representative widths, and prove every `.SH` and `.SS` is immediately followed by literal `\&` and the required `.PP`. Run the updated local Harness `ki repo audit --skill ki-repo-tools`, `ki-authoring`, `ki-guides`, and `ki-specs`, followed by the full `ki repo audit --repo .`.

For Git Almanac, run `bunx tsc --noEmit`, `bun run test:coverage`, `bun run build`, `bunx biome check .`, `bunx knip`, `bun run ki:tools:lint-man`, `bash -n install.sh`, the executable and installer help surfaces, and representative documented calendar, authors, contributors, and report examples.

For mgit, run `shellcheck bin/mgit install.sh`, `bats tests/`, `mandoc -T lint man/mgit.1`, installer help, root and contextual command help, and representative documented discovery, manifest, group, worktree, completion, and direct-command examples in temporary repositories.

For tools-ki, run `bunx tsc --noEmit`, `bun run test`, `bun run test:coverage`, `bun run build`, `bun run ki:tools:lint-man`, installer help, root and command-group help, and the focused inventory and manual-order assertions. Run Markdown formatting and `git diff --check` over every touched repository, verify links and examples against local files or executable output, and confirm no functional source path changed beyond help text.

## Dependencies / blocks

No dependency blocks implementation. The user explicitly approved expanding CLI-003 to the owning Harness skill and direct changes in all four repositories. The Git Almanac record remains the single canonical coordinator by prior user decision; no duplicate sibling roadmap records are created.

Local instructions apply independently. Changes must remain within the exact Harness checker, help, documentation, manual, and test paths above; commits must be reviewed separately; concurrent commits must be preserved; and pushing any repository requires separate explicit authority. Any functional CLI change, release action, or newly discovered product decision must stop and become separate work.

## Documentation impact

Documentation is the delivery surface. The implementation should make authority relationships clearer and reduce drift without imposing one information architecture on three materially different tools. READMEs remain entry points, manuals remain comprehensive terminal references, and help remains concise executable truth.

### Decision Records

No Decision Record change is planned because this item enforces and applies existing documentation and tool-repository standards without making a new product decision. If reconciliation exposes a genuine unresolved decision or contradiction in an accepted record, stop and route that work separately.

### Specifications

Reconcile each tool's existing specifications with verified behavior and help. Specifications remain behavioral contracts; do not move tutorial material into them or invent unsupported behavior to make surfaces look uniform.

### Guides

Reconcile user and developer guides, their indexes, installation and release guidance, examples, terminology, and links. Guides remain task-oriented explanations and may preserve different structures where each tool's audience or workflow requires them.

### Roadmap

Keep this Git Almanac item as the canonical four-repository coordinator and update it with implementation evidence. Do not create sibling roadmap records unless implementation discovers separately scoped work that cannot honestly remain within this approved boundary.

## Review

### Delivered

Delivered the approved four-repository documentation reconciliation from immutable Git Almanac baseline `a7cad61bf2458de20075fb6479ce36e82494022d`. The resulting evidence heads are Git Almanac `845cb8d695e3aad0101c1f71fd10e188b44cfd7b`, mgit `59aa50ab6c2b697d9a547e9f28e43d792e54726f`, tools-ki `66acd0e2baa5da6d45c2e1015e8e92f4dce883fb`, and KI Agentic Harness `8e1f67b2aa61b6483d972ae150ff20c204ab1240`. No CLI behavior, release asset, tag, package, Homebrew tap, or remote state changed.

### Summary of changes

- Added a mechanical `MAN-STYLE` failure and automatic, idempotent physical-roff conformance path to `ki-repo-tools`, with focused context, catalogue, inventory, generated-rubric, and end-to-end host evidence.
- Tightened the manual standard around a literal `\&` separator after `.SH` and `.SS`, `.PP` before prose, and direct structural macros. The first stricter draft exposed empty-paragraph lint warnings, so the final rule deliberately removes redundant `.PP` before structural macros.
- Applied the shared rule to all three manuals. Git Almanac gained the missing heading separators and prose paragraphs; mgit and KI each removed only redundant empty paragraphs.
- Compared root and nested executable help, installer help, rendered manuals, README entry points, guide and specification indexes, examples, completion surfaces, configuration guidance, and release guidance. The only additional command-surface drift was Git Almanac's undocumented global `--help` and `--version`, now covered by `git-almanac(1)`.
- Kept the preflight `tools-mgit` compositional ignore repair in its own `e4a9708` commit. Concurrent mgit and tools-ki work was preserved and never staged into this delivery.

### Verification

- KI Agentic Harness: focused `ki-repo-tools` Bun tests passed; `bunx tsc --noEmit`, `bun run test` (527 tests), `bunx biome check .`, generated-rubric publication, `ki repo audit --skill ki-skills --repo .`, and the full KI audit passed. The full audit retained two pre-existing environment-binding warnings and no failures.
- Git Almanac: `bunx tsc --noEmit`, `bun run test:coverage` (46 tests, 100% statements, branches, functions, and lines), `bun run build`, Biome, Knip, man lint and rendered inspection, installer syntax and help, CLI help, `git diff --check`, and the full 17-skill KI audit passed.
- mgit: ShellCheck, 54 Bats cases, contextual and installer help, man lint and rendered inspection, `git diff --check`, and the full 15-skill KI audit passed.
- tools-ki: TypeScript, 685 tests, coverage at 100% statements, branches, functions, and lines, compiled build, root and command-group help, installer help, man lint and rendered inspection, `git diff --check`, and the full 18-skill KI audit passed.
- Local acceptance: `./install.sh --link` refreshed the executable and manual links; the `hnr-backend` repository produced terminal, SVG, HTML, calendar JSON, authors JSON, contributors JSON, and Zsh completion output in a temporary directory. JSON schemas and markup were validated, and the existing managed report was not changed.

### Outstanding concerns

No blocking concern remains. The Harness audit's two environment-binding warnings and Biome schema-version information pre-date this item and are outside its approved boundary. None of the four repositories was pushed.

### Post-change review

The approved documentation-only boundary held. The shared rule now turns the original visible spacing gap into deterministic evidence without duplicating repository checks, every resulting manual is lint-clean and rendered-readable, and live help matches the comprehensive manual surfaces. Regression risk is limited to physical roff normalization and is covered by idempotence, unsafe-path, generated-publication, live-host, and repository-native tests. The item is ready for human acceptance review.

### Mini recap

CLI-003 established one portable manual-spacing contract, reconciled all three tool manuals and the one discovered help/manual omission, and recorded cross-repository verification without remote mutation. ALMANAC-CLI-004 remains the separate approved behavioral delivery for rebuilding changed complete reports.

## Done

Accepted by the user on 2026-08-28 after review of the delivered documentation reconciliation, verification evidence, and clean repository states. The done record is retained.

## Discussion

### Presentation and coverage

Manual-page review should include heading spacing, paragraph structure, indentation, wrapping, escaping, and representative terminal widths. Broader reconciliation should cover command names, option descriptions, examples, cross-links, installation guidance, release guidance, and documentation navigation.

### Verification direction

Verification must render each manual page with canonical tooling and run manual lint, Markdown and link checks, CLI help snapshots or smoke tests, relevant documentation generators, and every declared KI audit in each repository. Examples must match supported commands, and runtime source changes are limited to help text.

### Authority and timing

The selected item is Ready in Next. The user approved implementation across the Harness and all three tool repositories, including atomic commits. Approval does not authorize pushing, release publication, package publication, tags, functional runtime changes, or unrelated conformance work.
