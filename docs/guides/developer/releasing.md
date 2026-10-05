# Release Git Almanac

Use this guide after completing the [definition of done](definition-of-done.md).

Apply the `ki-repo-tools` release-readiness checklist for shared candidate, changelog, documentation, immutability and downstream requirements, and `ki-git` for commit and publication authority. This guide supplies Almanac's version sources, artifact and publication procedure.

## Prepare the version

1. Set the exact release version in `package.json`, the manual heading, and version tests.
2. Run the complete gate from the [definition of done](definition-of-done.md).
3. Prepare the reviewed release commit before creating its tag.

## Publish the immutable asset

Publish by creating and pushing the candidate's `vX.Y.Z` tag. The tag-triggered release workflow:

1. reruns coverage, build, and manual gates;
2. builds the platform-independent Node executable;
3. packages the executable and manual as `git-almanac-vX.Y.Z.tar.gz`;
4. publishes `SHA256SUMS`; and
5. creates the GitHub release.

The exact-version installer accepts `GIT_ALMANAC_INSTALL_DIR` and `GIT_ALMANAC_MAN_INSTALL_DIR` for the disposable executable and manual destinations required by the shared release checklist.

## Complete downstream distribution

The downstream handoff identifies `knowledgeislands/homebrew-tap`, `Formula/git-almanac.rb`, the exact released tag, the `git-almanac-vX.Y.Z.tar.gz` asset URL and checksum, its Node runtime dependency, and the `/projects/git-almanac/` and `/install/git-almanac` website routes. Follow the shared checklist through the actual formula and consumer outcome.

After publication, the release workflow's `Notify Homebrew tap` job sends a `tool-release-published` dispatch to `knowledgeislands/homebrew-tap` through the `ki-tools-release-bot` GitHub App; the tap then opens the exact formula pull request and squash-merges it automatically once its required checks pass. The job is skipped until the `KI_TOOLS_RELEASE_BOT_APP_ID` variable and `KI_TOOLS_RELEASE_BOT_PRIVATE_KEY` secret are available to this repository at organisation or repository level (not as `release`-environment secrets); the tap's daily scheduled intake still picks up a published immutable release without the dispatch.

## Recover from a failed release

Correct the source on `main`, update the package, manual heading and version tests for the next patch, then repeat this procedure under the shared release-recovery policy.
