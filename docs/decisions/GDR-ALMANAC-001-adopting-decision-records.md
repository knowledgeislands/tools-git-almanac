---
id: GDR-ALMANAC-001
title: 'Adopting Decision Records'
date: 2026-08-27
status: current
decision_type: governance
decision_type_url: https://knowledgeislands.info/specifications/decision-records/gdr
---

# GDR-ALMANAC-001: Adopting Decision Records

## Context

Git Almanac has durable product, command, data, output, and repository-management decisions whose consequences span implementation, documentation, distribution, and later roadmap work. Those decisions require a stable, reviewable home distinct from as-built Specifications and delivery records.

## Decision

Git Almanac records significant standalone decisions as living Decision Records under `docs/decisions/`, using type-specific identifiers and maintaining their reading order in this directory's index.

## Consequences

Future work can depend on concise present-state decisions without treating roadmap discussion as permanent architecture. A material change to an existing concern updates its owning record in place; independent decisions receive the next identifier in their own type and scope series.
