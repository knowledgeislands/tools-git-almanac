# Changelog

All notable changes to Git Almanac will be documented here.

This changelog records the V1 release baseline. It does not retroactively track individual 0.x releases; tags and commit history remain the record of the pre-V1 run-up.

## [1.0.0] — in progress

Pre-V1 work is summarized as one baseline. Separate 0.x release entries are not maintained.

### Shipped commands

#### General

- `git almanac --help`
- `git almanac --version`

#### History views

- `git almanac calendar [repository]`
- `git almanac authors [repository]`
- `git almanac contributors [repository]`

#### Managed reports

- `git almanac report [calendar|authors|contributors] [repository]`

#### Repository setup

- `git almanac config init [repository]`
- `git almanac config show [repository]`
- `git almanac config check [repository]`
- `git almanac ignore [repository]`
- `git almanac init [repository]`

#### Shell integration

- `git almanac completion bash`
- `git almanac completion zsh`

### Behaviours

- Omitted repository arguments discover the Git repository containing the current directory; inspection remains local, offline, and read-only.
- Author, path, ref, date-field, merge-policy, interval, metric, and theme options share one normalized reachable-history contract.
- Author views preserve exact raw Git identities, while contributor views rank selected commit activity and shares deterministically.
- Calendar views render terminal, self-contained HTML, accessible SVG, and stable versioned JSON output, with explicit format precedence and output-extension inference.
- Calendar directory output produces combined and per-author assets from the same selected history.
- Managed reports build protected `reports/git-almanac/` workspaces with versioned manifests, linked pages, normalized data, and contributor assets.
- Repository configuration follows built-in → repository → CLI precedence; initialization and ignore commands add only the narrowest safe report rule.

### Distribution baseline

- `./bin/git-almanac`
- `install.sh`, including released and linked-checkout installation
- `git-almanac(1)`
- Bash and Zsh completion definitions
- Platform-independent Node 22 release archive and `SHA256SUMS`
- GitHub release verification for coverage, build, manual lint, packaging, and publication
