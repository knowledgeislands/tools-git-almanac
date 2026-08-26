# gitlendar

Turn one local Git repository's activity into a trustworthy annual calendar.

`gitlendar year` reads local history reachable from `HEAD`, counts each non-merge commit once by author date in the local timezone, and renders a GitHub-inspired 53-week calendar without a network request or forge account.

![A sample gitlendar SVG calendar](examples/gitlendar.svg)

## Try it locally

Install dependencies once, then run the checkout directly:

```bash
bun install
./bin/gitlendar year
```

Generate each supported format:

```bash
./bin/gitlendar year --no-color
./bin/gitlendar year --format svg --output activity.svg
./bin/gitlendar year --format html --output activity.html --theme dark
./bin/gitlendar year --format json --output activity.json
```

Use one workspace or subsystem in a monorepo:

```bash
./bin/gitlendar year /path/to/repository --path "packages/service with spaces"
```

Run `./bin/gitlendar --help` or read [gitlendar(1)](man/gitlendar.1) for every option.

## Counting contract

The default calendar:

- discovers the repository containing the current working directory;
- uses commits reachable from `HEAD`;
- includes all authors;
- excludes merge commits;
- groups commits by author date in the user's local timezone;
- counts each commit object once;
- covers 365 local calendar dates ending today and pads only the display to complete Sunday-through-Saturday weeks;
- reads history with one argument-safe `git log` traversal;
- performs no network request and changes no Git history or configuration.

`--author`, `--path`, `--ref`, `--since`, `--until`, `--date`, and `--include-merges` make each deviation explicit. Every renderer consumes the same normalized model and linear maximum-relative intensity thresholds: zero is empty, and non-zero counts fall at 25%, 50%, 75%, and 100% of the busiest day.

The durable behaviour contract lives in [the Activity calendar Specification](docs/specs/activity-calendar.md).

## Install

For checkout development, link both the executable and manual without publishing:

```bash
./install.sh --link
gitlendar year .
```

After the first immutable release:

```bash
curl -fsSL https://raw.githubusercontent.com/knowledgeislands/tools-gitlendar/main/install.sh | bash
brew tap knowledgeislands/tap
brew install gitlendar
```

The release installer verifies the published SHA-256 manifest before replacing the installed executable. The Homebrew command becomes available only after the tap independently accepts the prepared formula handoff for an immutable release.

[Guides](docs/guides/README.md) cover everyday use, local development, and release preparation.

## Why gitlendar

The name combines Git and calendar, makes `gitlendar year` self-explanatory, and had no exact npm, PyPI, crates.io, Homebrew, or GitHub repository-name collision when selected on 26 August 2026.

## License

[MIT](LICENSE) © 2026 Kris Brown.
