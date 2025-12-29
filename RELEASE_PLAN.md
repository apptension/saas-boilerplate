# Release Plan: Version 4.2.0

## Overview
This document outlines the step-by-step plan to create a release branch with updated changelog and version bump for all changes since the last master branch commit.

**Current State:**
- Current version: `4.1.1`
- Current branch: `feat/dynamic-translations`
- Commits since master: ~49 commits
- Last master commit: `3c7cf6e1` (fix: Mute InvalidToken error in Sentry)

**Proposed Version:** `4.2.0` (minor version bump due to significant new features)

## Major Features Included

1. **Dynamic Translations System** - Complete i18n infrastructure with remote loading
2. **Enterprise SSO, Passkeys & Active Sessions** - Enterprise authentication features
3. **UI/UX Improvements** - Dashboard redesign, security settings cards
4. **Documentation Overhaul** - Complete docs restructure and styling
5. **PLOP Code Generation** - Enhanced code generation system
6. **Various Bug Fixes & Improvements** - Multiple fixes and enhancements

## Step-by-Step Release Process

### Phase 1: Preparation & Analysis

#### Step 1.1: Ensure Clean Working Directory
```bash
# Check current status
git status

# Commit any uncommitted changes if needed
# (Currently there are many modified files - these should be committed first)
```

#### Step 1.2: Verify Master Branch State
```bash
# Fetch latest from origin
git fetch origin master

# Verify we're comparing against the right commit
git log origin/master --oneline -5
```

#### Step 1.3: Install Dependencies (if needed)
```bash
# Check if standard-version is available
pnpm list standard-version || pnpm add -D standard-version

# Or use npx if it's not installed
# npx standard-version --help
```

### Phase 2: Create Release Branch

#### Step 2.1: Create Release Branch from Current Branch
```bash
# Create release branch from current feature branch
git checkout -b release/4.2.0

# Or if you prefer to branch from master first:
# git checkout master
# git pull origin master
# git checkout -b release/4.2.0
# git merge feat/dynamic-translations
```

**Recommendation:** Create release branch from `feat/dynamic-translations` since all changes are there.

#### Step 2.2: Ensure All Changes Are Committed
```bash
# Review uncommitted changes
git status

# If there are uncommitted changes, commit them first
# git add .
# git commit -m "chore: finalize changes for release"
```

### Phase 3: Generate Changelog

#### Step 3.1: Generate Changelog Using standard-version
```bash
# Using standard-version (recommended - auto-generates changelog from commits)
npx standard-version --release-as 4.2.0

# This will:
# - Bump version in all package.json files (as configured in .versionrc.js)
# - Generate CHANGELOG.md entries from commit messages
# - Create a git tag (4.2.0)
# - Create a commit with version bump and changelog
```

#### Step 3.2: Manual Changelog Generation (Alternative)
If standard-version doesn't work or you prefer manual control:

```bash
# 1. Manually update CHANGELOG.md with entries grouped by type:
#    - Features
#    - Bug Fixes
#    - Documentation
#    - Style/Refactor

# 2. Update version in package.json files:
#    - Root package.json: "version": "4.2.0"
#    - All package.json files listed in .versionrc.js

# 3. Commit changes:
git add CHANGELOG.md package.json packages/*/package.json
git commit -m "chore: bump version to 4.2.0 and update changelog"
```

### Phase 4: Review & Verify

#### Step 4.1: Review Generated Changelog
```bash
# Review the changelog entries
cat CHANGELOG.md | head -100

# Verify all major features are included:
# - Dynamic translations system
# - Enterprise SSO, Passkeys, Active Sessions
# - UI/UX improvements
# - Documentation overhaul
```

#### Step 4.2: Verify Version Bumps
```bash
# Check root package.json
grep '"version"' package.json

# Check a few package.json files
grep '"version"' packages/webapp/package.json
grep '"version"' packages/backend/package.json
```

#### Step 4.3: Run Tests (Optional but Recommended)
```bash
# Run type checking
pnpm tsc --noEmit -p packages/webapp/tsconfig.app.json

# Run affected tests (if you have time)
# pnpm nx run-many --target=test --all
```

### Phase 5: Finalize Release Branch

#### Step 5.1: Push Release Branch
```bash
# Push release branch to remote
git push origin release/4.2.0

# If tag was created, push it too
git push origin 4.2.0
# Or push all tags:
git push origin --tags
```

#### Step 5.2: Create Pull Request (Optional)
```bash
# Create a PR from release/4.2.0 to master
# This allows for review before merging
```

### Phase 6: Post-Release (After Merge to Master)

#### Step 6.1: After Merging to Master
```bash
# Once merged to master:
git checkout master
git pull origin master

# Verify the release tag exists
git tag --list | grep 4.2.0

# Verify changelog is updated
head -50 CHANGELOG.md
```

#### Step 6.2: Create GitHub Release (Optional)
- Go to GitHub repository
- Navigate to Releases
- Click "Draft a new release"
- Select tag: `4.2.0`
- Copy changelog entries from CHANGELOG.md
- Publish release

## Changelog Structure (Expected)

Based on commits, the changelog should include:

### Features
- Dynamic translations system with remote loading
- Enterprise SSO (OIDC/SAML) support
- Passkeys (WebAuthn) authentication
- Active Sessions management
- Enhanced PLOP code generation system
- Data-driven dashboard with charts and statistics
- Redesigned Documents page with Card-based UI
- Redesigned Contentful demo pages
- Enhanced toast notification system with semantic variants
- Resend invitation button for pending tenant members
- Pixel-art styled 404 Not Found page
- Sidebar collapse functionality
- Enhanced admin panel with RBAC documentation

### Bug Fixes
- Fix 401 errors in audit logs
- Fix horizontal overflow on docs HTML element
- Fix initialData syntax in component tests
- Fix RelativeDate error handling
- Various UI/UX consistency improvements

### Documentation
- Complete documentation overhaul with improved structure
- Enhanced documentation with new components and styling
- Improved email and Mailcatcher documentation
- Added comprehensive Enterprise SSO documentation
- Updated authentication features documentation

### Style/Refactor
- Improve dashboard Quick Actions and 2FA modal UX
- Add brand gradient to badges and chart tooltips
- Update stat cards with colored icon backgrounds
- Improve UI/UX consistency across security settings cards
- Refactor sidebar with organized menu sections

## Risk Mitigation

1. **Uncommitted Changes**: Ensure all changes are committed before creating release branch
2. **Version Conflicts**: Verify all package.json files are updated consistently
3. **Changelog Accuracy**: Review generated changelog to ensure all features are captured
4. **Test Failures**: Run tests before finalizing release
5. **Merge Conflicts**: If creating release from master, resolve any merge conflicts

## Rollback Plan

If issues are found after release:

```bash
# Delete the release branch
git branch -D release/4.2.0
git push origin --delete release/4.2.0

# Delete the tag (if created)
git tag -d 4.2.0
git push origin --delete 4.2.0

# Revert version commits if already merged
git revert <commit-hash>
```

## Notes

- The release branch should remain separate until ready to merge
- All version bumps will be handled automatically by standard-version
- The changelog follows conventional commits format (configured in .versionrc.js)
- Consider creating a GitHub Release after merging to master for better visibility

## Next Steps

1. Review this plan
2. Execute Phase 1 (Preparation)
3. Execute Phase 2 (Create Release Branch)
4. Execute Phase 3 (Generate Changelog)
5. Review and verify (Phase 4)
6. Push and create PR (Phase 5)

---

**Estimated Time:** 30-60 minutes
**Complexity:** Medium
**Risk Level:** Low (can be rolled back easily)
