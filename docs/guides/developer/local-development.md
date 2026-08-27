# Local development

Use this guide to change or evaluate Git Almanac without installing a release.

## Prepare the checkout

The declared toolchain provides Bun 1.3.14 and Node 24.19.0 through `mise.toml`.

```bash
mise install
bun install
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

```bash
bunx tsc --noEmit
bun run test:coverage
bun run build
bunx biome check
bun run ki:tools:lint-man
bash -n install.sh
ki repo audit --repo .
```

Tests drive the in-process `run(args, context)` boundary and deliberately dated temporary Git repositories. Product coverage is held at 100% statements, branches, functions, and lines.

## Verify the built CLI

```bash
./dist/cli/cli.js --version
./dist/cli/cli.js calendar . --format json
./dist/cli/cli.js authors .
```

Compiled output runs under Node 22 or newer.
