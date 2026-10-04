# Definition of done for Git Almanac

Use this checklist before presenting a Git Almanac change for review. Release publication has additional requirements in [Release Git Almanac](releasing.md).

Apply the `ki-repo-tools` change-readiness checklist for shared documentation, verification and review requirements, `ki-git` for commit hygiene and authority, `ki-engineering` for the TypeScript/Bun toolchain, and `ki-authoring` for document conventions. This guide supplies Almanac's local checks and executable gates.

## Confirm the change

- Repository inspection remains read-only unless the change explicitly affects report, configuration, ignore, or output files.
- Collection, normalisation, statistics, and rendering remain separate, and Git is invoked through argument arrays rather than interpolated shell input.
- Accepted behaviour and relevant failure paths are covered through the in-process CLI seam using disposable Git repositories.
- Root `help`, `diag`, and `doctor` stay covered; diagnostics redact local paths unless `--full` is explicit, while `doctor` remains read-only.

## Verify the repository

Run focused tests while iterating, then the complete gate:

```sh
bunx tsc --noEmit
bun run test:coverage
bun run build
bunx biome check
bun run ki:tools:lint-man
bash -n install.sh
ki repo audit --repo .
git diff --check
```

After a manual layout change, inspect the rendered page:

```sh
mandoc -T utf8 man/git-almanac.1 | col -b
```
