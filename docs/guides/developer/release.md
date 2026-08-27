# Release and Homebrew

Use this guide only after the current roadmap item is accepted and publication is explicitly authorised.

## Prepare the version

1. Confirm every required gate passes on a clean checkout.
2. Move the relevant `CHANGELOG.md` entries from Unreleased to a dated semantic version.
3. Set the same version in `package.json` and the manual heading.
4. Commit the release candidate with an atomic Conventional Commit.

## Publish the immutable asset

Create and push the exact `vX.Y.Z` tag only with explicit publication authority. The Release workflow:

1. reruns coverage, build, and manual gates;
2. bundles one platform-independent Node executable;
3. packages the executable and manual as `git-almanac-vX.Y.Z.tar.gz`;
4. publishes `SHA256SUMS`;
5. creates the immutable GitHub release.

Verify a clean installation against the exact tag before treating the release as complete.

## Complete the Homebrew handoff

The outbound trade to `knowledgeislands/homebrew-tap` requests a `Formula/git-almanac.rb` formula only after the immutable asset exists. The receiver independently verifies:

- the release URL and SHA-256 value;
- the Node runtime dependency;
- installation of the bundled executable and manual;
- `git-almanac --version` in the formula test;
- tap CI and audit.

The tools-git-almanac repository does not write or decide the tap's formula. Observe the receiver decision through the trade lifecycle, then release the outbound record only when its decision policy is satisfied.

## Recovery

Do not move or recreate an immutable tag. If publication verification fails, correct the source on `main`, choose the next patch version, and publish a new release candidate.
