# Git Almanac developer guides

These guides are for anyone changing this repository: adding behaviour, fixing a defect, or publishing a release. They assume you have a checkout rather than an installed build, and they describe this repository's own working practice rather than general Git or TypeScript advice.

The working conventions themselves — engineering boundaries, commit style, and documentation split — live in root `AGENTS.md`; these guides cover the procedures those conventions imply. Behaviour you must not break while changing the tool is in the Git Almanac Specification at `docs/specs/git-almanac.md`.

## Set up and iterate

[Local development](local-development.md) prepares a checkout with the declared toolchain, runs the source executable directly without a build step, links it onto `PATH` for realistic use, exercises the repository behaviour safely in disposable repositories, and runs the complete verification gate.

## Finish a change

[Definition of done](definition-of-done.md) is the boundary a change satisfies before it is presented for review: what must remain true of the code, which documents must stay aligned, the exact gate commands, and what may not be done without separate authority.

## Publish a release

[Release Git Almanac](releasing.md) covers preparing the version, publishing the immutable tagged asset, handing the release to the Homebrew tap that independently verifies it, and what to do instead of moving a tag when a release goes wrong.
