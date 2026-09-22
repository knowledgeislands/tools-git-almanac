# Maintain the Git Almanac report

Use this guide to build and keep the managed static report. Unlike the standalone views in [Everyday use](everyday-use.md), `report` owns a directory inside the inspected repository, so it is the one part of Git Almanac that writes more than a file you named.

## Build the report

```bash
git almanac report
open reports/git-almanac/index.html
```

Everything lands under `<repository-root>/reports/git-almanac/`: linked HTML pages for the calendar, authors, and contributors; the normalised JSON behind them; a combined SVG calendar; a per-contributor SVG calendar; and `manifest.json`.

`report` owns that workspace, so it does not accept `--format`, `--output`, or `--output-dir`. Use the standalone commands when you want to choose the file yourself. Every history selector still applies:

```bash
git almanac report --ref release-branch --since 2026-01-01 --theme dark
```

## Refresh one section

Rebuild a single section when only it is stale:

```bash
git almanac report calendar
git almanac report authors
git almanac report contributors
```

A partial refresh requires the existing report to have been built with the same contract — the same repository, revision, selectors, interval, timezone, identity policy, metric, and theme. If any of those differ, Git Almanac refuses rather than leaving a report whose sections disagree with each other. Run a complete `git almanac report` instead; it rebuilds every managed section automatically when the contract has changed.

## Understand what the manifest owns

`manifest.json` records the effective repository, resolved revision, selectors, timezone, exact-identity policy, metric, theme, generated sections, and every path Git Almanac wrote. Read it whenever you need to know what a published report was actually based on:

```bash
cat reports/git-almanac/manifest.json
```

The manifest is also the safety mechanism. Git Almanac replaces only the paths it recorded as its own: a complete rebuild removes its stale files and leaves anything it does not own untouched. Updates are staged beside the workspace and published as a replacement, so a failed run restores the previous report rather than leaving a half-written one.

The practical consequence is that the report directory is Git Almanac's, not yours. Do not hand-edit files inside it and do not add your own files there — either makes the next rebuild refuse or discard your work. Keep anything you want to preserve outside `reports/git-almanac/`.

## Keep report output out of Git

`report` warns when its output is not ignored. Ask Git Almanac to add the narrowest safe rule:

```bash
git almanac ignore
```

It uses `/reports/` only when no tracked or foreign report content could be hidden by that rule; otherwise it adds `/reports/git-almanac/` so other tools' reports stay visible. Running it again when output is already ignored changes nothing. `git almanac init` composes this with configuration setup.

Ignoring the output is the recommended default: a report is a rebuildable artefact whose contents change with every commit, and committing it produces large, meaningless diffs.

## Recover from a refusal

Git Almanac refuses rather than guesses when it cannot prove it owns what it is about to replace.

- **`refusing foreign report directory without a Git Almanac manifest`** — `reports/git-almanac/` exists with content but no manifest, so something else wrote it. Move or delete that directory deliberately, then rerun `git almanac report`.
- **`refusing foreign report directory: invalid …`** or **`unrecognised manifest`** — the manifest is malformed or from an incompatible schema. Delete the report directory and rebuild it.
- **`refusing to overwrite unowned report path`** — a file inside the workspace is not recorded in the manifest, usually because it was added by hand. Move it somewhere outside `reports/git-almanac/` and rerun.
- **`refusing symbolic report path owned by manifest`** or **`refusing non-file report path`** — a managed path was replaced by a symlink or a directory. Remove the substituted entry and rebuild.
- **`refusing concurrent report update while lock exists`** — another report run holds `reports/.git-almanac.lock`. Wait for it to finish. If no run is active, the previous one was interrupted; delete the lock file and rerun.
- **A partial refresh is refused as incompatible** — the selectors have moved on. Run the complete `git almanac report`.

The behaviour behind each refusal is fixed by requirements `ALM-013` to `ALM-015` in the [Git Almanac Specification](../../specs/git-almanac.md); [Troubleshooting](troubleshooting.md) covers the failures that are not specific to reports.
