# Working in tools-gitlendar

This repository contains the standalone gitlendar command-line tool.

## Engineering

- Use TypeScript with arrow functions, explicit types, cohesive modules, and dependency-conscious boundaries.
- Invoke Git with argument arrays and never interpolate repository input into a shell command.
- Keep collection, normalization, statistics, and rendering separate.
- Drive tests through the in-process CLI seam and temporary Git repositories.
- Keep the inspected repository read-only and perform no network requests.

## Workflow

- Use the repository roadmap lifecycle for multi-step work.
- Use atomic Conventional Commits and stage only intended paths.
- Run the focused test while iterating and the complete gate before review.
- Do not push, publish, release, or edit a sibling repository without explicit approval.

## Documentation

Use the installed ki-authoring conventions for Markdown and TOML. Specifications record what the CLI does, guides explain how to use or maintain it, and roadmap items record delivery state.
