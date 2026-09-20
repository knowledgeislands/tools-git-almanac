# Release Git Almanac

Use this guide only after the candidate satisfies the [definition of done](definition-of-done.md) and publication is explicitly authorised.

## Prepare the version

1. Confirm every required gate passes on a clean checkout.
2. Keep relevant `CHANGELOG.md` entries under the curated V1 baseline while pre-1.0 tags remain recorded in Git history.
3. Set the exact release version in `package.json`, the manual heading, and version tests.
4. Commit the release candidate as one atomic Conventional Commit.

## Publish the immutable asset

Create and push the exact `vX.Y.Z` tag only with explicit publication authority. The tag-triggered release workflow:

1. reruns coverage, build, and manual gates;
2. builds the platform-independent Node executable;
3. packages the executable and manual as `git-almanac-vX.Y.Z.tar.gz`;
4. publishes `SHA256SUMS`; and
5. creates the GitHub release.

Verify a clean installation against the exact tag before treating the release as complete.

## Complete downstream distribution

Hand the immutable release to `knowledgeislands/homebrew-tap`. The tap owns `Formula/git-almanac.rb` and independently verifies the release URL and checksum, Node runtime dependency, executable and manual installation, version output, and tap CI. This repository neither writes nor decides the tap's formula.

After the validated formula reaches the tap's `main` branch, the tap dispatches a verified tool-release event to explicitly enrolled consumers. An existing KI Website entry advances through the website's ordinary pull-request review. This repository stores no shared release-App credentials and does not duplicate tap or website verification.

A first-time website entry, a maturity change, or a consumer not enrolled in automation remains an explicit receiver-owned handoff. Supply the exact tag, immutable asset URL, and expected `/tooling/git-almanac/` and `/install/git-almanac` routes without transferring release authority.

## Recover from a failed release

Do not move or recreate an immutable tag. Correct the source on `main`, choose the next patch version, and publish a new release candidate.
