# Troubleshoot Git Almanac

Use this guide when a command fails, refuses, or produces something you did not expect. Every diagnostic Git Almanac prints names the value it rejected or the destination it protected, so the message itself is usually the fastest route to the fix.

## Read the exit status

- **0** — success.
- **1** — a repository, Git, configuration, report ownership, rendering, or output failure. The request made sense; carrying it out did not work.
- **2** — invalid syntax or an invalid option value. Git Almanac also prints the command summary, because the request itself was malformed.

Status 2 means fix the command line; status 1 means fix the repository, the filesystem, or the report workspace.

## The command is not found

`git: 'almanac' is not a git command` or `git-almanac: command not found` means the executable is not on `PATH`. Confirm where it was installed and that its directory is on `PATH` — see [Installation](installation.md). Git finds the subcommand only because `git-almanac` is on `PATH`; there is nothing to register with Git itself.

## Git Almanac cannot find the repository

`not a Git repository: <path>` means neither the given path nor the current directory is inside a repository. Git Almanac searches upward from where you are, so this usually means you are outside the tree entirely. Pass the repository explicitly:

```bash
git almanac calendar /path/to/repository
```

## The history selection is rejected

- **`invalid Git ref '<ref>'`** — the ref does not resolve to a commit in this repository. Check it with `git rev-parse --verify <ref>^{commit}`. A remote-tracking branch needs its full name, such as `origin/main`.
- **`malformed date '<value>'; expected YYYY-MM-DD`** — `--since` and `--until` take calendar dates only, with no time component.
- **`malformed date '<value>'; expected a real calendar date`** — the date is well-formed but does not exist, such as a 31st in a 30-day month.
- **`since date <a> is after until date <b>`** — the interval is inverted. Swap the two values.
- **`--metric must be one of: commits`** — `commits` is the only metric Git Almanac counts today.

## The calendar is empty

An empty calendar is a valid result, not a failure, and it exits 0. The usual causes are a repository with no commits yet, a date range that predates the history, a `--path` pathspec that matches nothing, or an `--author` pattern that matches no identity in the selected range.

Confirm what Git sees before suspecting Git Almanac:

```bash
git log --oneline -5
git log --since 2026-01-01 --oneline | head
```

Remember that merge commits are excluded by default; a branch whose recent activity is all merges looks quiet until you add `--include-merges`.

## The output format is refused

- **`authors does not support SVG output; use terminal, HTML, or JSON`** — only `calendar` has an SVG renderer, because there is no per-person grid to draw for a list. The same applies to `contributors`.
- **`--output and --output-dir cannot be combined`** — choose one exact file or one generated directory.
- **`--output-dir is supported by calendar; report creates managed contributor assets`** — `authors` and `contributors` write a single view; the managed report already produces per-contributor calendars.
- **`report owns its workspace; --format, --output, and --output-dir are not supported`** — see [Reports](reports.md).
- **`--format must be one of: terminal, html, svg, json`** — an unrecognised renderer name.

An explicit `--format` always beats the extension of `--output`, so `--format json --output activity.svg` writes JSON into a file named `.svg`. If a file's contents surprise you, check whether an explicit format overrode the extension you meant to rely on.

## The command line is rejected

- **`unknown command '<name>'`** and **`unknown option '--name'`** — check the spelling against `git almanac --help`.
- **`<command> accepts at most one repository argument`** — Git Almanac inspects one repository at a time. Unquoted paths containing spaces are a common cause; quote them.
- **`<option> requires a value`** — an option was given last, or immediately before another option.
- **`config requires one action: init, show, or check`** — `config` needs an action.
- **`completion requires exactly one supported shell: bash or zsh`** — only those two shells have a definition.

## Configuration is rejected

`invalid <path>: <reason>` means `.git-almanac.toml` did not parse or contained a value of the wrong type or an unknown key. Validate it directly:

```bash
git almanac config check
git almanac config show
```

`config show` prints the effective defaults, which is the quickest way to see whether the file you are editing is the one being read: configuration is looked up at the repository root, not the current directory. `config init` never overwrites an existing file, so a configuration that will not validate must be corrected or removed by hand.

## The report refuses or warns

`warning: report output is not ignored; run 'git almanac ignore'` is a warning, not a failure — the report was written. Every ownership, lock, and compatibility refusal is covered in [Reports](reports.md).

## The numbers are not what you expected

- **A person appears twice.** Git Almanac preserves exact raw `Name <email>` identities and never guesses that two are the same person. Filter with `--author` to compare deliberately.
- **Totals differ from a forge's figures.** Forges count differently: a different default branch, merges included, a different timezone, or commits counted per-branch. Git Almanac counts each reachable commit object once, excludes merges, and groups by author date locally.
- **A day landed on the wrong date.** Days are grouped in the local timezone. Set `TZ` to group by another, and use `--date committer` if you meant when the commit landed rather than when it was authored.
- **Shading changed without the history changing.** Intensity bands are relative to the busiest day in the current selection, so narrowing a date range re-shades everything. Compare counts, not colours.

## Colour and terminal rendering

Set `NO_COLOR` in the environment or pass `--no-color` to disable ANSI colour. Terminal output keeps five distinguishable intensity states without it, so a piped or captured calendar remains readable.

## Still stuck

The [Git Almanac Specification](../../specs/git-almanac.md) states the behaviour each command is required to have, with the exit-status classification in `ALM-020`. `man git-almanac` documents every option and environment variable. If the tool's actual behaviour disagrees with the specification, the specification is authoritative and the defect is in the tool.
