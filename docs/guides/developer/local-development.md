# Local development

Use this guide to change or evaluate Git Almanac without installing a release: you prepare the checkout, run the source directly, link it into your path and exercise its behavior against a real repository.

## Prepare the checkout

The exact Bun and Node versions are declared in `mise.toml`; `package.json` repeats the Bun package-manager pin for dependency installation.

```bash
mise install
bun install
bun install --frozen-lockfile --cwd tooling/boundaries
```

Run source directly:

```bash
./bin/git-almanac --version
./bin/git-almanac calendar /path/to/repository --output /tmp/activity.svg
./bin/git-almanac contributors /path/to/repository
```

The development executable uses a Bun shebang and imports `src/cli/cli.ts`; no build is required.

## Link the checkout

Link the development executable and manual into user-selected directories:

```bash
GIT_ALMANAC_INSTALL_DIR="$HOME/.local/bin" ./install.sh --link
git almanac calendar
```

Link mode refuses to replace an existing regular file. Remove or relocate that file deliberately before retrying.

## Exercise repository behavior

Use temporary output for standalone files. A full report intentionally writes beneath the inspected repository:

```bash
git almanac authors /path/to/repository
git almanac calendar /path/to/repository --format svg --output-dir /tmp/git-almanac-calendars
git almanac report /path/to/repository
git almanac config check /path/to/repository
```

For read-only acceptance, fingerprint `git status --porcelain=v2 --branch` before and after analytical commands. Report, configuration initialization, ignore management, and explicit output are documented mutations and should be tested in disposable repositories unless those writes are intended.

## Run the complete gate

Run the complete verification gate in the [definition of done](definition-of-done.md). Keep that guide as the single command list so local development and release preparation exercise the same checks.

Tests drive the in-process `run(args, context)` boundary and deliberately dated temporary Git repositories. Product coverage is held at 100% statements, branches, functions, and lines.

The suite also enforces `.dependency-cruiser.ts`: core counting and types stay below I/O, renderers stay independent of repository writes, the executable stays thin, and CLI acceptance tests use `run` with its documented Git-executor and diagnostic-environment fixture ports. Focused configuration and rendering tests may exercise those modules' exported contracts. The isolated `tooling/boundaries` install holds a TypeScript compiler dependency-cruiser supports; the checker proves it read a resolved, type-aware graph and that each prohibited crossing fails in a temporary fixture, without writing product source.

## Verify the built CLI

```bash
./dist/cli/cli.js --version
./dist/cli/cli.js calendar . --format json
./dist/cli/cli.js authors .
```

Compiled output runs under Node 22 or newer.
