---
id: GDR-ALMANAC-001
title: 'Adopting Decision Records'
date: 2026-10-05
status: current
decision_type: governance
decision_type_url: https://knowledgeislands.info/specifications/decision-records/gdr
---

# GDR-ALMANAC-001: Adopting Decision Records

## Context

Git Almanac has durable product, command, data, output, and repository-management decisions whose consequences span implementation, documentation, distribution, and later roadmap work. Those decisions require a stable, reviewable home distinct from as-built Specifications and delivery records.

The same product boundary appears in argument parsing, Git collection, normalized models, renderers, configuration, and managed report files. Tests show whether those parts satisfy the accepted behavior, but cannot explain why the boundary exists. User guides explain practical operations, while developer guides explain verification and publication. Neither audience benefits from turning those procedures into a second record of the product's rationale.

## Decision

Git Almanac records significant standalone decisions as living Decision Records under `docs/decisions/`, using type-specific identifiers and maintaining their reading order in this directory's index.

The collection states the currently adopted decision, its context, and its consequences. Existing concerns are amended in their owning record; only an independently meaningful concern receives another record. The records name the instruments carrying implementation and delivery detail rather than duplicating their procedures.

## Consequences

Work depends on concise present-state decisions without treating roadmap discussion as permanent architecture. A material change to an existing concern updates its owning record in place; independent decisions receive the next identifier in their own type and scope series. This keeps rationale discoverable without binding it to a completed ticket, a particular source layout, or one release's command output.
