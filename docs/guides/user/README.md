# Git Almanac user guides

These guides are for anyone running `git almanac` against a repository. Git Almanac reads one local repository, makes no network request, and needs no forge account, so everything here works offline against history you already have. It never rewrites that history: only `report`, `config init`, `ignore`, `init`, and an explicit `--output` path write anything at all.

Read [Installation](installation.md) and [Everyday use](everyday-use.md) in order the first time. After that, come back to whichever guide matches the task in front of you.

## Install Git Almanac

[Installation](installation.md) covers installing a released build, pinning an exact version, choosing where the executable and manual land, linking a checkout when no release suits you, and enabling the manual page and shell completion. It ends with the commands that prove the installation works and the steps that remove it again.

## Inspect a repository

[Everyday use](everyday-use.md) is the guide to reach for once Git Almanac is installed. It covers discovering the repository, selecting exactly the history you mean with refs, dates, author patterns, and pathspecs, choosing a terminal, HTML, SVG, or JSON view, reading what the calendar statistics and contributor shares actually claim, and storing repository defaults in `.git-almanac.toml`.

## Maintain the managed report

[Reports](reports.md) covers `git almanac report`: the linked static workspace it builds beneath the repository root, refreshing a single section, what the manifest owns and therefore protects, keeping report output out of Git, and recovering when Git Almanac refuses to write into a directory it does not own.

## Recover from a failure

[Troubleshooting](troubleshooting.md) explains what each exit status means and lists the failures a first-time reader actually hits — a missing repository, an unknown ref, an empty calendar, an unsupported format, a refused report — each with the command that recovers from it.
