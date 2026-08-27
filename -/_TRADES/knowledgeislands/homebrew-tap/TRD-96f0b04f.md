---
id: TRD-96f0b04f
title: "Add gitlendar formula after v0.1.0 release"
created_at: 2026-08-26T09:44:35Z
sender: knowledgeislands/tools-gitlendar
receiver: knowledgeislands/homebrew-tap
kind: work
source_ref: "ALMANAC-CLI-001"
observation: completion
phase: submitted
---

# TRD-96f0b04f: Add gitlendar formula after v0.1.0 release

## Context

tools-gitlendar now provides a Node 22 CLI, portable release archive, SHA256SUMS, manual page, and verified installer contract. The repository is locally implemented and awaiting review; no release has been published.

## Submission

After knowledgeislands/tools-gitlendar publishes immutable v0.1.0, add and verify a gitlendar Homebrew formula using the release archive and checksum.

## Constraints

Do not create the formula from a mutable branch. Pin the immutable v0.1.0 archive and checksum; depend on node@22 or a compatible Node 22 runtime; verify gitlendar --version, a read-only calendar smoke run, and the installed manual.
