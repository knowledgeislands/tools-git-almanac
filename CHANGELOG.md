# Changelog

All notable changes to Git Almanac will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The changelog records the V1 release baseline; it does not retroactively track individual 0.x releases. Tags and commit history remain the record of the pre-V1 run-up.

## [1.0.0] — in progress

Pre-V1 work is summarized as one baseline. Separate 0.x release entries are not maintained.

### Added

- Establish `calendar`, `authors`, `contributors`, `report`, `config`, `ignore`, and `init` commands over one normalized local-history model.
- Preserve exact raw Git author identities, rank commit shares deterministically, and export combined and per-author calendar sets.
- Infer standalone HTML, SVG, and JSON output from file extensions while keeping explicit format precedence and stdout defaults.
- Generate protected static report workspaces with versioned manifests, linked pages, normalized data, and per-contributor SVG assets.
- Support optional repository configuration, strict built-in → repository → CLI precedence, and idempotent narrowest-safe report ignore rules.
- Rename the product, Git extension, package, repository, installer, manual, release assets, and KI registrations to Git Almanac.
- Establish the standalone repository and governed initial-delivery roadmap.
- Add the local Git activity collector, normalized annual model, statistics, and deterministic intensity bands.
- Render terminal, self-contained HTML, accessible SVG, and stable versioned JSON output.
- Support author, path, ref, date-field, merge-policy, interval, theme, and output options.
- Provide shell completion, a manual page, direct checkout execution, development linking, and release packaging.
- Cover the CLI contract with deliberately dated temporary Git repositories and strict coverage gates.

### Fixed

- Install `mandoc` on Ubuntu release runners before linting the manual page.
