# Working in Git Almanac

This repository contains the standalone Git Almanac command-line tool.

## Governing sources

Use `ki-engineering` for TypeScript/Bun design and toolchain, `ki-repo-tools` for the shared CLI, distribution, change-readiness and release-readiness contracts, `ki-git` for Git hygiene and commit/publication authority, and `ki-authoring` for Markdown, TOML and durable knowledge placement. The selected work lifecycle belongs to `ki-work` and `ki-work-roadmap`.

Use the [definition of done](docs/guides/developer/definition-of-done.md) for Almanac's checks and executable verification gate, and [Release Git Almanac](docs/guides/developer/releasing.md) for its version sources, artifact and publication procedure.

## Local boundaries

- Invoke Git with argument arrays and never interpolate repository input into a shell command.
- Keep collection, normalization, statistics, and rendering separate.
- Drive tests through the in-process CLI seam and temporary Git repositories.
- Keep the inspected repository read-only and perform no network requests.
