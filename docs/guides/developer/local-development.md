# Local development

Use this guide to change or evaluate gitlendar without installing a release.

## Prepare the checkout

The declared toolchain is Bun 1.3.14 and Node 24.19.0 through `mise.toml`.

```bash
mise install
bun install
```

Run source directly:

```bash
./bin/gitlendar --version
./bin/gitlendar year /path/to/repository --format svg --output /tmp/activity.svg
```

The development executable has a Bun shebang and imports `src/cli/cli.ts`. No build is required.

## Link the checkout

Link the development executable and manual into user-selected directories:

```bash
GITLENDAR_INSTALL_DIR="$HOME/.local/bin" ./install.sh --link
gitlendar year .
```

Link mode refuses to replace an existing regular file. Remove or relocate that file deliberately before retrying.

## Run the complete gate

```bash
bun run test:coverage
bun run build
bun run ki:tools:lint-man
ki repo audit --repo .
```

Tests drive the in-process `run(args, context)` boundary against temporary deliberately dated Git repositories. Product coverage is held at 100% for statements, branches, functions, and lines.

## Verify the built CLI

```bash
./dist/cli/cli.js --version
./dist/cli/cli.js year . --format json
```

The compiled output runs under Node 22 or newer.
