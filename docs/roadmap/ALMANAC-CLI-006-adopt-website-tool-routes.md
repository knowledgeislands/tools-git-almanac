---
id: ALMANAC-CLI-006
area: CLI
title: Align website releases
theme: cli
horizon: next
status: done
blocks: []
blocked_by: []
baseline_ref: 86dc0b1331c2b46bf75fada04b2aceab89026aea
created_at: 2026-09-17T21:05:58Z
updated_at: 2026-10-03T07:30:08Z
---

# ALMANAC-CLI-006: Align website releases

## Goal

Make future Git Almanac releases eligible for the shared verified Homebrew-tap-to-website update path, with accurate release guidance and an explicit receiver policy.

## Context

The website already lists Git Almanac at `/projects/git-almanac/` and redirects `/install/git-almanac` to the `v0.1.0` installer. The live page returns HTTP 200 and the installer route returns HTTP 302 to that pinned tag. The website registry, Homebrew formula, and latest Git Almanac release all currently name `v0.1.0`.

An existing website entry now receives a `tool-release-published` event after Homebrew tap validates and merges a new formula. The website independently verifies the release and opens a version-update pull request; it does not create a roadmap item or merge the pull request. First-time entries and maturity changes remain manual website decisions.

The website receiver requires GitHub to report the source release as immutable. At intake, GitHub reported release immutability disabled for `tools-git-almanac`, and its existing `v0.1.0` release is mutable. Enabling the repository setting protects only future releases, so a future version must prove the automated route end to end.

The installer already accepts positional `vX.Y.Z`, retains `GIT_ALMANAC_VERSION`, and defaults to the latest release when neither is supplied. No installer interface work remains here. At intake, the local release guide named the retired `/tooling/git-almanac/` route.

## Boundary

This item does not publish a release, change the installer interface, move artifact or formula authority, or decide whether website version-update pull requests should auto-merge. That receiver policy must be settled with the website owner before changing its automation.

Do not weaken the website's immutable-release check merely to advance a mutable release. The current `v0.1.0` advertisement needs no version change.

## Current state

The website entry, installer route, formula and latest release are aligned at `v0.1.0`. The guide and repository immutability setting are now corrected. A future published release is required to exercise the live downstream path.

## Steps

- [x] Enable and verify GitHub release immutability for this repository, without changing the existing release.
- [x] Correct the release guide's website route and describe the tap-owned, CI-gated downstream handoff accurately.
- [x] Run repository and tool gates; record the future-release integration check as a release-time check, not a simulated release.

## Files touched

- `docs/guides/developer/releasing.md`
- `docs/roadmap/ALMANAC-CLI-006-adopt-website-tool-routes.md`
- GitHub repository release-immutability setting

## Verify

- Query the repository's immutable-release setting and require `enabled: true`.
- Run `ki repo audit --repo .`, `bun run test:coverage`, `bun run build`, `bunx biome check`, and `bun run ki:tools:lint-man`.
- Confirm the guide names `/projects/git-almanac/` and does not claim a release or downstream PR was exercised.

## Dependencies / blocks

No code dependency blocks this local work. The next authorised immutable release is required for the first live end-to-end tap-to-website verification. Website auto-merge policy and tap automation are governed by their respective repositories.

## Documentation impact

### Decision Records

No new local decision record; downstream acceptance policy belongs to the receiving repositories.

### Specifications

No change to Git Almanac behaviour or contract.

### Guides

Update the release guide and carry the first live handoff check there.

### Roadmap

This item records local delivery and the unexercised live handoff explicitly.

## Review

### Delivered

The approved local release-handoff alignment is complete from baseline `86dc0b1331c2b46bf75fada04b2aceab89026aea`. GitHub now reports repository release immutability enabled. No release was published and no tap or website repository was changed.

### Change Summary

`docs/guides/developer/releasing.md` now uses the live project route, requires an immutable new release, and makes the tap-to-website handoff an explicit release-time check. This item records the setting change and evidence.

### Verification

`gh api repos/knowledgeislands/tools-git-almanac/immutable-releases --jq .enabled` returned `true`. `ki repo audit --repo .`, `bun run test:coverage`, `bun run build`, `bunx biome check`, and `bun run ki:tools:lint-man` all passed.

### Outstanding concerns

The existing `v0.1.0` release remains mutable; the setting is not retroactive. The first live downstream update awaits an authorised future immutable release. Automatic tap updates and website PR acceptance remain receiver-owned work.

### Post-change review

The local eligibility blockers are removed without changing installer behaviour or claiming an untested end-to-end event. The guide preserves repository boundaries and makes deferred integration evidence visible at release time. Ready for human acceptance of this bounded item.

### Mini recap

Enabled release immutability, corrected and clarified release guidance, and passed all local gates. Carry the live event check into the next release and the shared acceptance policy into tap and website governance.

## Done

Accepted 2026-10-03 by Kris Brown on the review packet above.

## Discussion

### Original local work

The original local work was to correct `docs/guides/developer/releasing.md`, enable GitHub release immutability, and retain the live website-update check for the next authorised release. The first two are delivered above; publication was not part of this item.

The first website update is not yet testable without a newer immutable Git Almanac release. Website pull-request merge policy is a separate cross-repository decision; the current bot leaves proposed updates open for CI and review.

### Already satisfied

The website routes and `v0.1.0` pins are live, and the positional installer argument predates this item. Neither needs duplicate implementation.

### Related

Originating repository and item: `knowledgeislands/ki-website` `KI-WEB-SITE-007`, now done. The current route and release-event contract lives at `docs/guides/developer/tool-routes.md` in that repository. Homebrew tap owns formula validation and release-event dispatch.

### Reconciliation — 2026-10-03

- **Confirmed:** the live page returns 200, the installer route redirects to the pinned `v0.1.0` installer, and the local website registry and tap formula match the latest Git Almanac release. `install.sh` already accepts a positional version; commit `b22400e` predates this item.
- **At intake:** the release guide named the retired route, repository release immutability was disabled, a future release had not exercised the verified tap-to-website update, and website PR acceptance policy remained separate from this repository's authority.
- **Lifecycle:** adopted into Next and approved for the bounded local plan above. This does not authorise publication or a downstream receiver change.
