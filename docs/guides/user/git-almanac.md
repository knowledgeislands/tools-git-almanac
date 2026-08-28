# Use Git Almanac

Use this guide to inspect one local repository, select history, export individual views, and maintain the local static report.

## Discover a repository

Enter any directory inside a repository and run a standalone view:

```bash
git almanac calendar
git almanac authors
git almanac contributors
```

Pass another repository explicitly when needed:

```bash
git almanac calendar /path/to/repository
```

Git Almanac steps upward to the repository root. It does not contact a forge or change repository history.

## Select history

All analytical views and reports share the same selectors:

```bash
git almanac contributors /path/to/repository \
  --ref release-branch \
  --author "Alice" \
  --path "packages/backend api" \
  --since 2026-01-01 \
  --until 2026-08-26 \
  --date committer \
  --include-merges \
  --metric commits
```

`--path` uses Git pathspec semantics relative to the discovered root and may be repeated. Author patterns are interpreted by Git. Output identities remain the exact raw `Name <email>` pairs present in selected commits.

## Choose output

Single-file commands write to standard output by default. A supported extension infers output format:

```bash
git almanac calendar --output activity.svg
git almanac calendar --output activity.html --theme dark
git almanac contributors --output contributors.json
```

Use `--format` to override the extension or choose a stdout format:

```bash
git almanac calendar --format json --output activity.txt
git almanac calendar --format html > activity.html
```

`calendar` supports terminal, HTML, SVG, and JSON. `authors` and `contributors` support terminal, HTML, and JSON.

Create a deliberate combined and per-author calendar set with an explicit directory:

```bash
git almanac calendar --format svg --output-dir ./calendar-set
```

## Generate the managed report

Build every linked view beneath the repository root:

```bash
git almanac report
open reports/git-almanac/index.html
```

Refresh one compatible section without rebuilding the others:

```bash
git almanac report calendar
git almanac report authors
git almanac report contributors
```

The manifest records the effective repository, revision, selectors, timezone, exact-identity policy, metric, theme, sections, and managed paths. A complete `git almanac report` automatically rebuilds every managed section when that contract changes, removes stale managed files, and preserves files it does not own. A named partial update requires the existing manifest to have the same contract. Git Almanac refuses missing, malformed, or unsafe ownership metadata rather than guessing what it may replace.

Inspect `reports/git-almanac/manifest.json` to see the exact props used for the current report and the paths Git Almanac owns.

## Keep report output out of Git

The report command warns when output is not ignored. Ask Git Almanac to add the narrowest safe root rule:

```bash
git almanac ignore
```

It uses `/reports/` only when no tracked or foreign report content could be hidden. Otherwise it adds `/reports/git-almanac/`.

## Keep repository defaults

Configuration is optional:

```bash
git almanac config init
git almanac config show
git almanac config check
```

Edit `.git-almanac.toml` to set durable `ref`, `since`, `until`, `date`, `include_merges`, `metric`, `theme`, `author`, or `paths` defaults. CLI arguments always take precedence. Run `git almanac init` to initialize both configuration and ignore behavior without generating a report.

## Interpret contributors

Contributor order and percentages describe commit activity in the selected history. Aliases remain separate identities, and the values are not productivity measures. Use `--author`, pathspecs, dates, and refs to make the comparison boundary explicit.
