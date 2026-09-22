# Use Git Almanac

Use this guide to inspect one local repository day to day: find the repository, select exactly the history you mean, export the view you want, and read what the numbers claim. [Installation](installation.md) covers getting the command in the first place, and [Reports](reports.md) covers the managed multi-page report.

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

Git Almanac steps upward to the repository root, so a nested directory works as well as the root. It does not contact a forge or change repository history.

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

Defaults matter as much as selectors, because they decide what an unqualified number means. With no options Git Almanac reads commits reachable from `HEAD`, excludes merge commits, groups by author date in your local timezone, counts the `commits` metric, and covers the 365 local calendar dates ending today. Set `TZ` to group by another timezone; use `--date committer` when you care when work landed rather than when it was written.

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

`calendar` supports terminal, HTML, SVG, and JSON. `authors` and `contributors` support terminal, HTML, and JSON; asking either for SVG is refused rather than silently downgraded.

Create a deliberate combined and per-author calendar set with an explicit directory:

```bash
git almanac calendar --format svg --output-dir ./calendar-set
```

Terminal output uses five distinguishable intensity states that survive without colour, so a piped or logged calendar stays readable. Disable colour explicitly with `--no-color`, or by setting `NO_COLOR` in the environment.

## Read the results

The calendar reports total commits, active days, the busiest day, the current streak, and the longest streak for the selected history. Two details are worth knowing before you quote any of them: the busiest day is the earliest of any tied maximum, and the current streak is the run ending on the final selected date — so a `--until` in the past ends the streak there rather than today.

Cell shading is relative, not absolute. A day with no commits is always empty; every other day falls into a band at 25%, 50%, 75%, or 100% of the busiest day in the same selection. Two calendars with different selections therefore shade the same commit count differently, and comparing them by colour alone is misleading.

`authors` lists every exact identity in deterministic identity order with its commit count and share. `contributors` ranks the same identities by descending count, breaking ties by exact identity. Both describe the selected commit history only.

Git Almanac deliberately does not merge identities. If one person committed under two addresses, they appear twice, because guessing equivalence would silently change the numbers. Narrow the comparison with `--author`, a pathspec, a ref, or a date range instead — and treat the resulting percentages as a description of commit activity in that boundary, never as a productivity measure.

JSON output carries the same model the other renderers use, including the resolved ref, the effective selectors, and the counting policy, which makes it the right format to feed another tool or to record what a figure was based on.

## Keep repository defaults

Configuration is optional, and `.git-almanac.toml` is safe to commit because it holds repository defaults only:

```bash
git almanac config init
git almanac config show
git almanac config check
```

Edit `.git-almanac.toml` to set durable `ref`, `since`, `until`, `date`, `include_merges`, `metric`, `theme`, `author`, or `paths` defaults. Built-in defaults apply first, repository configuration second, and CLI arguments last, so an explicit option always wins over the file.

`config init` never replaces an existing configuration; it validates what is already there. Run `git almanac init` to set up configuration and report ignore behaviour together without generating a report.

## Where to go next

- [Reports](reports.md) — build and maintain the linked static report under the repository root.
- [Troubleshooting](troubleshooting.md) — what an exit status means and how to recover from a refusal.
- [Git Almanac Specification](../../specs/git-almanac.md) — the normative contract behind every behaviour described here.
