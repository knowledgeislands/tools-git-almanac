# Definition of done for Git Almanac

Use this checklist before presenting a Git Almanac change for review. Release publication has additional requirements in [Release Git Almanac](releasing.md).

## Confirm the change

- Repository inspection remains read-only unless the change explicitly affects report, configuration, ignore, or output files.
- Collection, normalisation, statistics, and rendering remain separate, and Git is invoked through argument arrays rather than interpolated shell input.
- Accepted behaviour and relevant failure paths are covered through the in-process CLI seam using disposable Git repositories.
- Public help, the README, user and developer guides, specifications, `man/git-almanac.1`, completion, and the V1 changelog baseline remain aligned where affected.
- Removed behaviour leaves no obsolete documentation, compatibility branch, or unreachable implementation.

## Verify the repository

Run the complete gate:

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

## Prepare review

- Commit one coherent, verified unit with only the intended paths staged.
- Record unavailable checks or unresolved receiver-owned follow-up explicitly.
- Do not push, tag, publish, release, accept roadmap work, or change the Homebrew tap or website without separate authority.
