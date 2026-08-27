---
id: ALMANAC-CLI-003
area: CLI
title: Reconcile tool documentation
theme: cli
horizon: next
status: ready
blocks: []
blocked_by: []
baseline_ref: 556a43f0359b0df857b336ed2cd58447d439e2eb
---

# ALMANAC-CLI-003: Reconcile tool documentation

## Goal

Users and maintainers encounter coherent, correctly rendered, and tool-appropriate documentation across Git Almanac, mgit, and the Knowledge Islands CLI.

## Context

The three Knowledge Islands tool repositories have evolved independently and now expose differences in documentation structure, terminology, coverage, and presentation. One visible example is missing visual separation after headings in the Git Almanac manual page. A later bounded reconciliation should identify material inconsistencies across the complete documentation surfaces rather than repairing isolated symptoms opportunistically.

The repositories in scope are `knowledgeislands/tools-git-almanac`, `knowledgeislands/tools-mgit`, and `knowledgeislands/tools-ki`. This draft records future work only and does not authorize documentation edits.

## Boundary

Reconcile user-facing manual pages, CLI help, READMEs, guides, specifications, installation and release instructions, examples, terminology, links, navigation, and documented command behavior across the three tools. Establish shared conventions where they improve comprehension while preserving intentional tool-specific structure and behavior.

The work is documentation-only. Help text embedded in runtime source may change, but command parsing, execution, outputs, exit behavior, and other runtime contracts may not. The item excludes new CLI capabilities, release publication, package publication, tags, Harness changes, and unrelated repository conformance changes. Implementation must retain atomic per-repository commits and preserve unrelated work.

## Current state

All three repositories are clean, synchronized with `origin/main`, and pass their declared `ki-authoring`, `ki-guides`, `ki-specs`, and `ki-repo-tools` audits. Their grounded baselines are Git Almanac `556a43f0359b0df857b336ed2cd58447d439e2eb`, mgit `e207025453d5ca76dcca2197862fbd97f1cd52b2`, and tools-ki `4ba8d0788babd7cb3a23729d84fadea21bb4599d`.

All three physical manuals pass `mandoc -T lint`, but lint does not prove rendered spacing. The current `ki-repo-tools` standard requires a literal `\&` after every `.SH` and `.SS`, followed by `.PP` before prose or a structural macro. Git Almanac omits that separator after all 15 headings, while mgit has it after all 20 and tools-ki after all 35. Git Almanac keeps help in `src/cli/help.ts`, mgit keeps contextual help in `bin/mgit`, and tools-ki builds help through its command modules, so reconciliation must compare rendered behavior rather than mechanically copying source layout.

## Steps

- [ ] Build one command-and-documentation matrix for each tool covering the executable help hierarchy, installer help, manual, README, guides, specifications, examples, navigation, configuration files, completion command, and release guidance at the recorded baselines.
- [ ] Establish the shared contract from current KI tool and authoring standards: source authority is explicit, command and option claims match executable help, terminology is internally consistent, links and navigation resolve, examples are runnable, and intentional tool-specific differences are recorded.
- [ ] Reconcile `git-almanac(1)`, including literal separators and paragraph macros after every heading, then align Git Almanac help, README, guides, specifications, examples, installation, and release guidance with the verified command surface.
- [ ] Reconcile `mgit(1)`, embedded contextual and installer help, README, user and developer guides, and specifications against actual Bash command behavior while preserving its standalone Bash runtime and intentional workspace terminology.
- [ ] Reconcile `ki(1)`, generated command help and descriptions, README, governance and developer guides, and specifications against the current command tree while preserving its existing CLI behavior and normative/specification boundaries.
- [ ] Add the smallest repository-local regression checks needed to catch manual heading and rendered-layout drift that `mandoc -T lint` alone misses; do not modify KI Agentic Harness under this item.
- [ ] Render every manual at representative widths, exercise documented help and examples, run the complete native and KI gates in each repository, and compare each working tree against its recorded baseline for behavior-only drift.
- [ ] Commit each repository independently with atomic Conventional Commits, assemble one cross-repository evidence summary in this canonical record, and stop at `awaiting-review` without pushing, releasing, tagging, or publishing unless separately authorized.

## Files touched

Git Almanac scope is `README.md`, `man/git-almanac.1`, help-only text in `src/cli/help.ts` and `install.sh`, related CLI or manual tests under `src/tests/`, `docs/guides/**`, `docs/specs/**`, `examples/git-almanac.svg` only if its surrounding documented contract changes, and this roadmap record. `CHANGELOG.md` changes only when an existing user-facing claim must be corrected; no release entry is created.

mgit scope is `README.md`, `man/mgit.1`, help-only text in `bin/mgit` and `install.sh`, related assertions in `tests/mgit.bats`, `docs/guides/**`, and `docs/specs/**`. The executable remains pure Bash and no package toolchain is introduced.

tools-ki scope is `README.md`, `man/ki.1`, help-only descriptions under `src/commands/**` or their registration sites, related CLI/manual assertions under `src/tests/**`, `docs/guides/**`, and `docs/specs/**`. Decision Records and portable normative contracts change only if reconciliation proves an existing contradiction; no new product decision is in scope.

Documentation-specific CI configuration in each repository may change only when required to run the agreed regression check. No other repository, generated release asset, Homebrew tap, or published artifact is in scope.

## Verify

In every repository, run `mandoc -T lint` for the physical manual, render with `mandoc -T utf8 ... | col -b` at representative widths, and prove every `.SH` and `.SS` is immediately followed by literal `\&` with the required following paragraph or structural macro. Run `ki repo audit --skill ki-repo-tools`, `ki-authoring`, `ki-guides`, and `ki-specs`, followed by the full `ki repo audit --repo .`.

For Git Almanac, run `bunx tsc --noEmit`, `bun run test:coverage`, `bun run build`, `bunx biome check .`, `bunx knip`, `bun run ki:tools:lint-man`, `bash -n install.sh`, the executable and installer help surfaces, and representative documented calendar, authors, contributors, and report examples.

For mgit, run `shellcheck bin/mgit install.sh`, `bats tests/`, `mandoc -T lint man/mgit.1`, installer help, root and contextual command help, and representative documented discovery, manifest, group, worktree, completion, and direct-command examples in temporary repositories.

For tools-ki, run `bunx tsc --noEmit`, `bun run test`, `bun run test:coverage`, `bun run build`, `bun run ki:tools:lint-man`, installer help, root and command-group help, and the focused inventory and manual-order assertions. Run Markdown formatting and `git diff --check` over every touched repository, verify links and examples against local files or executable output, and confirm no functional source path changed beyond help text.

## Dependencies / blocks

No dependency blocks implementation. The user explicitly selected CLI-003 from Soon into Next and approved its agreed three-repository documentation boundary. The Git Almanac record remains the single canonical coordinator by prior user decision; no duplicate sibling roadmap records are created.

Implementation still requires fresh preflight in all three repositories. Their local instructions apply independently: sibling changes must remain within the exact help/documentation and test paths above, commits must be reviewed separately, and pushing any repository requires separate explicit authority. Any required Harness rubric correction, functional CLI change, release action, or newly discovered product decision must stop and become separate work.

## Documentation impact

Documentation is the delivery surface. The implementation should make authority relationships clearer and reduce drift without imposing one information architecture on three materially different tools. READMEs remain entry points, manuals remain comprehensive terminal references, and help remains concise executable truth.

### Decision Records

No Decision Record change is planned because this item applies existing documentation and tool-repository standards without making a new product decision. If reconciliation exposes a genuine unresolved decision or contradiction in an accepted record, stop and route that work separately.

### Specifications

Reconcile each tool's existing specifications with verified behavior and help. Specifications remain behavioral contracts; do not move tutorial material into them or invent unsupported behavior to make surfaces look uniform.

### Guides

Reconcile user and developer guides, their indexes, installation and release guidance, examples, terminology, and links. Guides remain task-oriented explanations and may preserve different structures where each tool's audience or workflow requires them.

### Roadmap

Keep this Git Almanac item as the canonical cross-repository coordinator and update it with implementation evidence. Do not create sibling roadmap records unless implementation discovers separately scoped work that cannot honestly remain within this approved boundary.

## Discussion

### Presentation and coverage

Manual-page review should include heading spacing, paragraph structure, indentation, wrapping, escaping, and representative terminal widths. Broader reconciliation should cover command names, option descriptions, examples, cross-links, installation guidance, release guidance, and documentation navigation.

### Verification direction

Verification must render each manual page with canonical tooling and run manual lint, Markdown and link checks, CLI help snapshots or smoke tests, relevant documentation generators, and every declared KI audit in each repository. Examples must match supported commands, and runtime source changes are limited to help text.

### Authority and timing

The selected item is Ready in Next. Approval of this plan authorizes later `ki-implement` execution only after its fresh preflight; it does not authorize pushing, release publication, package publication, tags, functional runtime changes, Harness changes, or unrelated conformance work.
