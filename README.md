# Git Almanac

Inspect one local Git repository's calendars, authors, contributors, and reports without a network request or forge account.

![A sample Git Almanac SVG calendar](examples/git-almanac.svg)

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/knowledgeislands/tools-git-almanac/main/install.sh | bash
```

The installer verifies the published SHA-256 manifest before replacing anything. To run this checkout instead of a release, link it:

```bash
bun install
./install.sh --link
```

[Installation](docs/guides/user/installation.md) covers exact versions, install directories, Homebrew, the manual page, shell completion, and removal.

## Use

```bash
git almanac calendar
git almanac authors
git almanac contributors --since 2026-01-01
```

The repository argument is optional: Git Almanac discovers the repository containing the current directory, including from a nested directory. Single-file commands write to standard output unless `--output` is supplied, and an `.html`, `.svg`, or `.json` extension infers the format.

Build the complete linked static report under `<repository-root>/reports/git-almanac/`:

```bash
git almanac report
open reports/git-almanac/index.html
```

[Everyday use](docs/guides/user/everyday-use.md) covers history selection, output formats, and reading the results; [Reports](docs/guides/user/reports.md) covers the managed report and its manifest.

## What it counts

By default Git Almanac counts each commit object reachable from `HEAD` once, excludes merge commits, preserves each exact raw Git `Name <email>` identity without guessing equivalence, groups by author date in the local timezone, and covers the 365 local calendar dates ending today. `--author`, `--path`, `--ref`, `--since`, `--until`, `--date`, and `--include-merges` make every deviation explicit.

Contributor percentages describe the selected commit history; they are not productivity scores. The durable behaviour contract lives in the [Git Almanac Specification](docs/specs/git-almanac.md), with product decisions in [Decision Records](docs/decisions/README.md).

## Guides

[Guides](docs/guides/README.md) are grouped by audience: [user guides](docs/guides/user/README.md) for installing, inspecting, reporting, and troubleshooting, and [developer guides](docs/guides/developer/README.md) for local development, the definition of done, and releasing.

## Why Git Almanac

The name describes a local collection of Git calendars, identities, statistics, and reports. The `git-almanac` executable is naturally available as the `git almanac` extension command.

## License

[MIT](LICENSE) © 2026 Kris Brown.
