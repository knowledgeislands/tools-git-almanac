# Generate an activity calendar

Use this guide to inspect one local Git repository or one path within a monorepo.

## Render the default year

Enter any directory inside the repository and run:

```bash
gitlendar year
```

The terminal report uses colour when standard output is interactive. Set `NO_COLOR`, redirect output, or pass `--no-color` to use five distinct text characters instead.

## Select history

Pass a repository path when it is not the current repository:

```bash
gitlendar year /path/to/repository
```

Combine explicit filters as needed:

```bash
gitlendar year /path/to/repository \
  --ref release-branch \
  --author "Alice" \
  --path "packages/backend api" \
  --since 2026-01-01 \
  --until 2026-08-26 \
  --date committer \
  --include-merges
```

Each `--path` is a Git pathspec relative to the discovered repository root and may be repeated.

## Create a shareable report

SVG is compact and publishable:

```bash
gitlendar year --format svg --output activity.svg
```

HTML is a self-contained responsive page with an embedded accessible SVG:

```bash
gitlendar year --format html --theme dark --output activity.html
open activity.html
```

JSON exposes the stable normalized model for other tools:

```bash
gitlendar year --format json --output activity.json
```

## Verify

The report states the selected interval, timezone, ref, filters, counting policy, daily counts, thresholds, and summary statistics. Compare totals between formats by generating them with the same options.

If gitlendar reports an invalid ref or malformed date, correct the named value and rerun it. It does not fall back to another ref or silently reinterpret a date.
