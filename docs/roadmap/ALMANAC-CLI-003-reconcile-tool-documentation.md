---
id: ALMANAC-CLI-003
area: CLI
title: Reconcile tool documentation
theme: cli
horizon: soon
status: draft
blocks: []
blocked_by: []
baseline_ref: null
---

# ALMANAC-CLI-003: Reconcile tool documentation

## Goal

Users and maintainers encounter coherent, correctly rendered, and tool-appropriate documentation across Git Almanac, mgit, and the Knowledge Islands CLI.

## Context

The three Knowledge Islands tool repositories have evolved independently and now expose differences in documentation structure, terminology, coverage, and presentation. One visible example is missing visual separation after headings in the Git Almanac manual page. A later bounded reconciliation should identify material inconsistencies across the complete documentation surfaces rather than repairing isolated symptoms opportunistically.

The repositories in scope are `knowledgeislands/tools-git-almanac`, `knowledgeislands/tools-mgit`, and `knowledgeislands/tools-ki`. This draft records future work only and does not authorize documentation edits.

## Boundary

Reconcile user-facing manual pages, CLI help, READMEs, guides, specifications, installation and release instructions, examples, terminology, links, navigation, and documented command behavior across the three tools. Establish shared conventions where they improve comprehension while preserving intentional tool-specific structure and behavior.

The work is documentation-only. It excludes runtime behavior changes, new CLI capabilities, release publication, package publication, tags, and unrelated repository conformance changes. Future implementation authority must explicitly cover each repository, retain atomic per-repository commits, and preserve unrelated work.

## Shaping

Planning should inventory the authoritative documentation surfaces and their generation or validation paths, compare terminology and documented behavior, render every manual page, and define the smallest useful consistency contract. Intentional tool-specific differences should be recorded rather than erased for superficial uniformity.

Candidate delivery covers manual pages, CLI help, READMEs, guides, specifications, examples, navigation, and focused regression checks. Exact files, source-of-truth relationships, repository-local verification, sequencing, and commit boundaries must be grounded before the item can become Ready.

## Discussion

### Presentation and coverage

Manual-page review should include heading spacing, paragraph structure, indentation, wrapping, escaping, and representative terminal widths. Broader reconciliation should cover command names, option descriptions, examples, cross-links, installation guidance, release guidance, and documentation navigation.

### Verification direction

Future verification should render each manual page with canonical tooling and run manual lint, Markdown and link checks, CLI help snapshots or smoke tests, relevant documentation generators, and every declared KI audit in each repository. Examples must match supported commands, and runtime source must remain unchanged unless separately authorized.

### Authority and timing

The work remains in Soon while current delivery has priority. Before promotion, planning must ground all three repositories, resolve current local changes, obtain explicit cross-repository implementation authority, and retain atomic per-repository commits. This draft does not authorize documentation edits, release publication, package publication, tags, runtime changes, or unrelated conformance work.
