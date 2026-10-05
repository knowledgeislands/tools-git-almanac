# Definition of done for Git Almanac

Use this checklist before presenting a Git Almanac change for review. Release publication has additional requirements in [Release Git Almanac](releasing.md).

Apply the `ki-repo-tools` change-readiness checklist for shared documentation, verification and review requirements, `ki-git` for commit hygiene and authority, `ki-engineering` for the TypeScript/Bun toolchain, and `ki-authoring` for document conventions. This guide supplies Almanac's local checks and executable gates.

## Confirm the change

- Repository inspection remains read-only unless the change explicitly affects report, configuration, ignore, or output files.
- Collection, normalisation, statistics, and rendering remain separate, and Git is invoked through argument arrays rather than interpolated shell input.
- Accepted behaviour and relevant failure paths are covered through the in-process CLI seam using disposable Git repositories.
- Architecture boundary tests prove the source graph resolves, includes cross-area type-only imports, and rejects deliberate core/I/O, renderer, executable-shell, acceptance-test and fixture crossings. Run the checker through its isolated supported compiler, not the root TypeScript 7 install.
- Installer fixtures bundle the real Node candidate, install it and its manual into temporary targets twice, and prove checksum rejection preserves existing files. Release-preflight fixtures reject malformed or mismatched tags before builds.
- Root `help`, `diag`, and `doctor` stay covered; diagnostics redact local paths unless `--full` is explicit, while `doctor` remains read-only. Isolated fixtures prove shared context, executing runtime, linked checkout/receipt/unknown provenance, additive v1 JSON, optional/invalid configuration, dependent skips, actionable failures and three-unit verdict/count consistency.

## Verify the repository

Run focused tests while iterating, then the complete gate:

```sh
bun install --frozen-lockfile --cwd tooling/boundaries
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
