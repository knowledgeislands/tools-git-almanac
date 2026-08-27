---
id: ALMANAC-CLI-002
area: CLI
title: Establish Git Almanac
theme: cli
horizon: now
status: in-progress
blocks: []
blocked_by: []
baseline_ref: 435dc16f86a195b739b41b67147575e018acb37b
---

# ALMANAC-CLI-002: Establish Git Almanac

## Goal

The user can invoke a local-first `git almanac` suite to inspect repository calendars, discover author identities, understand contributor activity, and generate a coherent static report from one repository without network access.

## Context

ALMANAC-CLI-001 delivered and established the trustworthy calendar engine under its pre-release name; the user accepted that evidence-backed baseline on 27 August 2026.

Review showed that the intended product is broader than an annual calendar. `git-stats`, `git-info`, `git-radar`, and `git-chronicle` have material existing command or product collisions, while preliminary exact registry checks found no `git-almanac` collision. The rename should happen before the first release, package publication, or Homebrew formula so that the public identity does not accumulate compatibility obligations.

## Boundary

This delivery renames the product to Git Almanac and its Git extension executable to `git-almanac`, establishes `calendar`, `authors`, `contributors`, `report`, `ignore`, `init`, and `config` command surfaces, and migrates the GitHub, local-checkout, KI estate, and reciprocal `ki-all` identities.

It includes one normalized local-history model, the initial `commits` metric, deterministic author and contributor views, report-workspace generation, output inference, optional repository configuration, safe ignore management, distribution surfaces, tests, and documentation.

It excludes hosted services, forge APIs, network collection, guessed identity merging, `.mailmap` policy, productivity scoring, file and line metrics, global user configuration, PDF output, release tagging or publication, package publication, and changes to the Homebrew tap. The repository-local outbound Homebrew trade may be updated to describe the renamed future artifact, but the tap remains outside scope.

## Current state

The accepted repository provides `gitlendar year` with terminal, HTML, SVG, and JSON renderers over one normalized commit-count model. The public GitHub repository is `knowledgeislands/tools-gitlendar`, the local checkout has the same basename, the npm package is `@knowledgeislands/gitlendar`, and the executable, manual, installer, examples, CI release assets, KI estate entry, `ki-all` membership, and outbound Homebrew trade use the old identity.

No release or package has been published and no Homebrew formula has been installed, so a hard rename can replace the unreleased command without a legacy alias. By explicit user decision, the pre-release roadmap namespace has moved once to the canonical `ALMANAC` code; Git history is the only retained source of the previous identifier and product name.

## Steps

- [ ] Complete exact name clearance and add a Decision Record for the Git Almanac identity, one-time pre-release migration to the stable `ALMANAC` roadmap code, command taxonomy, output rules, report workspace, configuration precedence, and deferred metrics.
- [ ] Extend the normalized history model and argument-safe Git adapter with exact raw `Name <email>` author identities while preserving one history traversal per request, read-only inspection, commit-OID uniqueness, local-timezone grouping, and the accepted filter contract.
- [ ] Replace the unreleased `gitlendar year` surface with `git almanac calendar`, add `authors` and full `contributors`, share repository/ref/date/path/author/merge options, and expose `--metric commits` as the only initially supported metric.
- [ ] Implement standalone output rules: stdout by default, supported-extension format inference for `--output`, explicit `--format` precedence, exact explicit paths, combined calendar default, deterministic contributor ordering, and explicit `--output-dir` for multi-file exports.
- [ ] Implement `git almanac report` plus partial `report calendar`, `report authors`, and `report contributors` builds under `<repository-root>/reports/git-almanac/`, with a static linked site, combined and per-author SVG assets, versioned normalized data, an effective counting-contract manifest, atomic managed updates, and refusal to overwrite a foreign directory.
- [ ] Add optional `<repository-root>/.git-almanac.toml` configuration with schema versioning and built-in → repository → CLI precedence, plus `config init`, `config show`, `config check`, composite `init`, and idempotent `ignore` behavior that chooses `/reports/` only when broad ignoring is safe and otherwise adds `/reports/git-almanac/`.
- [ ] Rename package, executable, bin entry, manual, installer/link mode, completions, examples, release assets, source terminology, documentation, and local checkout from Gitlendar to Git Almanac without retaining an unreleased compatibility alias.
- [ ] Rename the GitHub repository to `knowledgeislands/tools-git-almanac`, update its canonical metadata and local remote, migrate the local KI estate entry, and update reciprocal `ki-all` consent in this repository and `knowledgeislands/ki-agentic-harness`.
- [ ] Update every field and instruction in the repository-local Homebrew trade for the future `git-almanac` artifact, including sender, source reference, repository URL, archive, executable, manual, formula, and smoke-test names, without modifying the Homebrew tap, publishing a release, or claiming receiver acceptance.
- [ ] Add in-process CLI and temporary-repository coverage for command parsing, author identity and ranking, shared filters, output inference, report assembly and partial builds, manifest compatibility, safe overwrite refusal, configuration precedence and validation, ignore/init idempotence, installer linking, paths with spaces, empty repositories, and error behavior.
- [ ] Run the complete local engineering and KI gates, exercise the linked `git almanac` command and all report views against this repository, and perform read-only acceptance against `hnr-backend` while proving its status fingerprint does not change.
- [ ] Prove an exhaustive case-insensitive tracked-file sweep contains no previous product, command, repository, package, artifact, trade, estate, or Agora name outside Git history.
- [ ] Commit each repository's changes atomically with Conventional Commits, push the authorised GitHub and Harness migrations, verify green GitHub CI at the renamed canonical URL, and assemble the six-part awaiting-review packet without accepting, tagging, releasing, publishing, or editing the Homebrew tap.

## Files touched

Expected scope in this repository includes `.ki-config.toml`, `.gitignore`, package and toolchain metadata, `bin/`, `src/`, tests, installer, manual, completions, examples, workflows, README, changelog, Specifications, Guides, a new Decision Record, the outbound trade, and this roadmap record. Product files may be renamed or split into cohesive history, configuration, report, and rendering modules.

The local checkout moves from `tools-gitlendar` to `tools-git-almanac`. The authorised cross-repository scope is limited to the exact reciprocal `ki-all` membership entry in `knowledgeislands/ki-agentic-harness`; local KI estate registration and GitHub repository metadata are migrated through their canonical tools. `hnr-backend` remains read-only, and `knowledgeislands/homebrew-tap` must not be changed.

## Verify

Run `bunx tsc --noEmit`, `bun run test:coverage`, `bun run build`, `bunx biome check`, `bun ki:tools:lint-man`, `bash -n install.sh`, and `ki repo audit --repo .` in the renamed repository. Run the applicable KI audit and test gate in `knowledgeislands/ki-agentic-harness` after its bounded membership update.

Exercise `git almanac calendar`, `authors`, `contributors`, the four standalone renderer formats, output-extension inference, `report` and every partial report build, `config init/show/check`, `ignore`, `init`, and linked-checkout installation. Confirm report output is rooted at `<repository-root>/reports/git-almanac/`, the manifest records the effective contract, generated pages and SVGs link locally, and unsafe existing destinations are preserved.

Run calendar, author, contributor, and report acceptance against `hnr-backend`; compare its full Git status fingerprint before and after. Confirm `ki agora show estate` and `ki agora show ki-all` resolve `tools-git-almanac`, GitHub redirects the former repository URL, canonical metadata names the new repository, and the renamed repository's pushed CI concludes successfully.

## Dependencies / blocks

ALMANAC-CLI-001 is done and supplies the accepted baseline. The GitHub repository exists, current administrative access is available, the package and release remain unpublished, and the Homebrew tap has not acted on the outbound trade.

Implementation requires explicit approval of this Ready plan because it includes a public GitHub rename, a local checkout move, a bounded sibling-Harness commit and push, and local estate migration. No release, tag, package publication, or Homebrew-tap write is authorised by approving this item.

## Documentation impact

### Decision Records

Add a Decision Record that fixes the Git Almanac name, Git extension form, stable roadmap code, command responsibilities, shared-option model, output targeting, report workspace, configuration precedence, safe ignore behavior, initial identity policy, and deferred metrics.

### Specifications

Replace the Gitlendar-specific annual-calendar specification with an as-built Git Almanac CLI and data contract covering commands, normalized identity and contribution semantics, counting metadata, output inference, report manifests and ownership, configuration, ignore/init mutations, and explicit non-goals.

### Guides

Rewrite user, local-development, installation, and release guidance for `git almanac`; include current-directory discovery, linked-checkout setup, author filtering, contributor views, standalone and report outputs, configuration examples, safe ignore initialization, and report inspection.

### Roadmap

Retain ALMANAC-CLI-001 as the accepted baseline and this ALMANAC-CLI-002 identity as the canonical rename and product-expansion delivery record. Future work uses the stable `ALMANAC` repository code; the one-time migration from the pre-release namespace is documented in Git history and the new Decision Record rather than preserved as a live alias.

## Discussion

### Product identity

The product name is Git Almanac, the package and executable identity is `git-almanac`, the natural invocation is `git almanac`, the GitHub repository is `knowledgeislands/tools-git-almanac`, and the KI roadmap code is the stable `ALMANAC` value after one explicit pre-release namespace migration.

### Command responsibilities

`calendar` answers when selected repository activity occurred and writes one combined view by default. `authors` inventories exact raw Git author identities. `contributors` ranks those identities by selected commit activity, reports shares, and supports individual calendar views. `report` assembles all views or a named partial view into one managed static report workspace.

### Output contract

Standalone commands remain pipe-friendly and write stdout unless an output destination is explicit. A recognised `--output` extension infers HTML, SVG, or JSON only when `--format` is absent; explicit format wins. Multi-file standalone output requires `--output-dir`, while report commands own the canonical report workspace and may create the linked HTML, data, and SVG set there.

### Report workspace

The default report root is `<repository-root>/reports/git-almanac/`. Its manifest identifies the schema, repository and resolved revision, history selectors, timezone, identity policy, metric, generated sections, and managed paths. Partial builds must not silently combine incompatible contracts, and a directory without a valid Git Almanac manifest is foreign and protected from managed overwrite.

### Configuration and ignore

`.git-almanac.toml` is optional, repository-rooted, strict, and safe to commit. It supplies durable defaults but never outranks CLI arguments. `git almanac init` composes configuration initialization and ignore setup without generating a report; `git almanac ignore` may modify only the repository-root `.gitignore` after checking existing ignore rules and tracked or foreign report content.

### Deferred extensions

The public grammar reserves metrics beyond commits without accepting undefined values. File-change and line-churn metrics, mailmap or other identity consolidation, global user configuration, programmatic config mutation, PDF, hosted publication, and cross-repository aggregation require later records with their own semantics and verification.

### Migration and authority

The hard rename is appropriate before release and avoids maintaining two commands. GitHub, local checkout, package, documentation, roadmap records, KI estate, reciprocal Agora identities, and the complete outbound Homebrew trade migrate together. No previous product-name reference or compatibility alias remains in tracked files; release publication and tap implementation remain separately gated.
