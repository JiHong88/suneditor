#!/usr/bin/env bash
#
# release-archive.sh — snapshot the current `master` state onto the `release`
# branch as a SINGLE squashed version commit (mirrors a GitHub squash-merge PR).
#
# Run this AFTER the master-side release work is done and pushed:
#   1. bump version in package.json   2. npm i (sync package-lock)
#   3. generate release note          4. commit + push master
#
# Then:  bash scripts/release-archive.sh            # message = package.json "version"
#    or:  bash scripts/release-archive.sh 3.2.0     # explicit message
#
# Tags are NOT created here — do that when publishing the GitHub Release.
set -euo pipefail

SOURCE_BRANCH="master"
RELEASE_BRANCH="release"

# Version = first arg, else package.json "version" (already bumped before this step).
VERSION="${1:-$(node -p "require('./package.json').version")}"

# --- safety: no uncommitted TRACKED changes (untracked files are fine — e.g. this script) ---
if ! git diff --quiet || ! git diff --cached --quiet; then
	echo "✗ Uncommitted changes present. Commit or stash them first." >&2
	exit 1
fi

START_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
# Always return to where we started, even on failure.
cleanup() { git checkout --quiet "$START_BRANCH" 2>/dev/null || true; }
trap cleanup EXIT

echo "→ Archiving $SOURCE_BRANCH → $RELEASE_BRANCH as \"$VERSION\""

# --- sync source, then release ---
git checkout --quiet "$SOURCE_BRANCH"
git pull --ff-only
git checkout --quiet "$RELEASE_BRANCH"
git pull --ff-only

# --- nothing new? (release tree already identical to master's) bail cleanly ---
if [ "$(git rev-parse "$SOURCE_BRANCH^{tree}")" = "$(git rev-parse 'HEAD^{tree}')" ]; then
	echo "✓ $RELEASE_BRANCH already matches $SOURCE_BRANCH — nothing to archive."
	exit 0
fi

# --- snapshot master's tree as ONE commit on top of release ---
# This is NOT a 3-way content merge: the new commit's tree IS master's tree, so it can
# never conflict — no matter how many versions release has diverged. It records no master
# parent (like a squash-merge), so release stays one clean commit per version.
NEW_COMMIT="$(git commit-tree "$SOURCE_BRANCH^{tree}" -p HEAD -m "$VERSION")"
git merge --ff-only "$NEW_COMMIT"   # fast-forward release onto the snapshot (updates worktree)
git push origin "$RELEASE_BRANCH"

echo "✓ Pushed $RELEASE_BRANCH commit \"$VERSION\""
echo "  Next: create the GitHub Release (tag v$VERSION) from the $RELEASE_BRANCH branch."
