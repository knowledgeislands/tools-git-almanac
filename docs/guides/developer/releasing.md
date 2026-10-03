# Release Git Almanac

Use this guide only after the candidate satisfies the [definition of done](definition-of-done.md) and publication is explicitly authorised.

The `ki-repo-tools` release-readiness checklist owns common release checks; this guide supplies Almanac's exact package, asset, and downstream procedure.

## Prepare the version

1. Confirm every required gate passes on a clean checkout.
2. Before 1.0, update the consolidated Pre-1.0 command and behaviour baseline in `CHANGELOG.md`; tags and releases retain the exact 0.x snapshots. From 1.0 onward, add a dated release entry.
3. Set the exact release version in `package.json`, the manual heading, and version tests.
4. Compare CLI help, generated Bash and Zsh completions, the README, user guides, manual, and changelog against the candidate executable; keep commands, options, and installation guidance aligned.
5. Commit the release candidate as one atomic Conventional Commit.

## Publish the immutable asset

Confirm that GitHub release immutability is enabled for this repository before publishing. It protects only releases created after the setting was enabled; an older mutable release is not retroactively made immutable.

Create and push the exact `vX.Y.Z` tag only with explicit publication authority. The tag-triggered release workflow:

1. reruns coverage, build, and manual gates;
2. builds the platform-independent Node executable;
3. packages the executable and manual as `git-almanac-vX.Y.Z.tar.gz`;
4. publishes `SHA256SUMS`; and
5. creates the GitHub release.

Verify a clean installation against the exact tag and confirm that GitHub reports the new release as immutable before treating the release as complete.

## Complete downstream distribution

Hand the immutable release to `knowledgeislands/homebrew-tap`. The tap owns `Formula/git-almanac.rb` and independently verifies the release URL and checksum, Node runtime dependency, executable and manual installation, version output, and tap CI. This repository neither writes nor decides the tap's formula.

After the validated formula reaches the tap's `main` branch, the tap dispatches a verified tool-release event to explicitly enrolled consumers. Confirm that the existing KI Website entry receives an update pull request, passes its checks, and reaches its intended disposition before closing the downstream release handoff. The current website receiver opens a pull request rather than merging it automatically; do not report the handoff as complete merely because the event was sent. This repository stores no shared release-App credentials and does not duplicate tap or website verification.

A first-time website entry, a maturity change, or a consumer not enrolled in automation remains an explicit receiver-owned handoff. Supply the exact tag, immutable asset URL, and expected `/projects/git-almanac/` and `/install/git-almanac` routes without transferring release authority.

## Recover from a failed release

Do not move or recreate an immutable tag. Correct the source on `main`, choose the next patch version, and publish a new release candidate.
