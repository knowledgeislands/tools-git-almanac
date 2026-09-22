# Install Git Almanac

Use this guide to get a working `git almanac` command, its manual page, and shell completion. Git Almanac is a single executable plus a manual page; installing it never touches a repository.

## Before you begin

The released build needs Git, `curl`, `tar`, either `shasum` or `sha256sum`, and Node 22 or newer on `PATH`. Linking a checkout instead needs Bun, because the development executable runs TypeScript directly.

The executable is named `git-almanac`. Git runs any `git-*` executable on `PATH` as a subcommand, so once installed it answers to both `git-almanac` and `git almanac`. This guide uses the second form.

## Install a released build

Run the installer from the repository's `main` branch. It resolves the latest release, downloads the asset, verifies it against the published `SHA256SUMS` manifest, and only then replaces anything:

```bash
curl -fsSL https://raw.githubusercontent.com/knowledgeislands/tools-git-almanac/main/install.sh | bash
```

To install an exact release rather than the latest, pass the v-prefixed tag, or set `GIT_ALMANAC_VERSION` when piping the script:

```bash
./install.sh v0.1.0
GIT_ALMANAC_VERSION=v0.1.0 curl -fsSL https://raw.githubusercontent.com/knowledgeislands/tools-git-almanac/main/install.sh | bash
```

By default the executable lands in `~/.local/bin` and the manual in `~/.local/share/man/man1`. Override either directory:

```bash
GIT_ALMANAC_INSTALL_DIR="$HOME/bin" GIT_ALMANAC_MAN_INSTALL_DIR="$HOME/share/man/man1" ./install.sh
```

If `~/.local/bin` is not already on `PATH`, add it in your shell profile. Without it the install succeeds and `git almanac` still reports `command not found`.

## Install with Homebrew

Homebrew delivery is owned by `knowledgeislands/homebrew-tap`, which accepts a formula only after independently verifying a published release. Once a formula for the version you want is on the tap:

```bash
brew tap knowledgeislands/tap
brew install git-almanac
```

If `brew install` reports no such formula, that version has not reached the tap yet. Use the release installer above instead.

## Link a checkout

Use a link when no release suits you — you want unreleased behaviour, or you are evaluating a change. Link mode symlinks this checkout's development executable and manual rather than copying a build:

```bash
bun install
GIT_ALMANAC_INSTALL_DIR="$HOME/.local/bin" ./install.sh --link
```

Link mode refuses to replace an existing regular file at either target, so it can never overwrite an installed release by accident. Remove or rename that file deliberately, then retry. Because the link points at the checkout, `git almanac` reflects whatever is currently on your working tree — including a half-finished change. [Local development](../developer/local-development.md) covers the full contributor setup.

## Enable the manual and completion

The installer places the manual page alongside the executable. Read it with:

```bash
man git-almanac
```

If `man` cannot find it, add the manual root to `MANPATH`, for example `export MANPATH="$HOME/.local/share/man:$MANPATH"`.

Git Almanac writes a sourceable completion definition to standard output; it does not install one for you. Source it from your shell profile:

```bash
git almanac completion bash > ~/.local/share/git-almanac-completion.bash
echo 'source ~/.local/share/git-almanac-completion.bash' >> ~/.bashrc
```

```bash
git almanac completion zsh > ~/.local/share/git-almanac-completion.zsh
echo 'source ~/.local/share/git-almanac-completion.zsh' >> ~/.zshrc
```

Completion registers against the `git-almanac` form and offers the command names and shared options; it does not complete refs or paths, and Git's own `git almanac` dispatch is not completed.

## Verify the installation

```bash
git almanac --version
git almanac --help
cd /path/to/any/repository && git almanac calendar
```

The first two must exit successfully and print a version and the command summary. The third prints a calendar for the last 365 days of the repository you are standing in. A calendar with no marked days is a valid result, not a failure — see [Troubleshooting](troubleshooting.md).

## Update or remove

Updating is the same command as installing: rerun the installer for the version you want, and it replaces the executable and manual in place after verifying the new asset. A linked checkout updates itself whenever you pull, because the symlink resolves to the working tree.

To remove an installation, delete the two files the installer created:

```bash
rm -f ~/.local/bin/git-almanac ~/.local/share/man/man1/git-almanac.1
```

Adjust the paths if you overrode the install directories. Removing Git Almanac leaves any `.git-almanac.toml` and any generated report untouched; delete those separately if you no longer want them.

## Recover from an installation failure

- **`release checksum verification failed`** — the download did not match the published manifest. Do not install it. Retry; if it fails again, the asset or your network path is at fault, and the release should be reported rather than worked around.
- **`could not download …`** — the requested tag has no published asset. Check the exact version, including its `v` prefix.
- **`expected exact version such as v0.1.0`** — the version argument was not a full `vMAJOR.MINOR.PATCH` tag. Partial versions and branch names are not accepted.
- **`refusing to replace regular file in --link mode`** — a real file, usually an installed release, already occupies the target. Remove it first, or link into a different directory with `GIT_ALMANAC_INSTALL_DIR`.
- **`node is required` or `bun is required`** — install the missing runtime. Releases need Node; link mode needs Bun.
