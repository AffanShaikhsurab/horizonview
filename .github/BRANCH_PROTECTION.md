# Branch Protection Setup Guide

This document explains how to set up branch protection rules for this repository on GitHub.

## Setting Up Branch Protection for `main`

As the repository owner (@affanshaikhsurab), you should configure the following branch protection rules:

### Step-by-Step Instructions

1. Go to your repository on GitHub: `https://github.com/affanshaikhsurab/horizonview`
2. Click on **Settings** (top navigation)
3. In the left sidebar, click **Branches** under "Code and automation"
4. Click **Add branch protection rule**

### Recommended Protection Rules

Configure the following settings:

#### Branch name pattern
```
main
```

#### Protection Settings (Check these boxes)

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Add these required status checks:
    - `🔍 Lint`
    - `🧪 Test`

- ✅ **Require conversation resolution before merging** (optional but recommended)

- ✅ **Do not allow bypassing the above settings**
  - ❌ Leave this **unchecked** if you want to bypass as owner
  - ✅ Check this if you want strict enforcement for everyone

- ✅ **Restrict who can push to matching branches** (optional)
  - Add yourself as the only direct push allowed (for emergencies)

#### For Repository Owner Bypass

If you want to bypass these rules as the owner:
- Uncheck "Do not allow bypassing the above settings"
- You'll be able to merge without reviews or passing checks when needed

### After Setup

Once configured, any PR to `main` will require:
1. ✅ All CI checks to pass (`npm run lint` and `npm test`)
2. ✅ At least 1 approving review
3. ✅ Branch to be up to date with `main`

### Workflow Summary

```
feature-branch → PR → CI Checks → Code Review → Merge to main
```

## Quick GitHub CLI Setup (Alternative)

If you have GitHub CLI installed, you can run:

```bash
gh api repos/affanshaikhsurab/horizonview/branches/main/protection -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[checks][][context]=🔍 Lint" \
  -f "required_status_checks[checks][][context]=🧪 Test" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "enforce_admins=false"
```

## Troubleshooting

### Status checks not appearing
If the status checks don't appear in the dropdown:
1. Make sure the CI workflow has run at least once
2. Push a commit to trigger the workflow
3. The check names will then be available to select

### Can't merge my own PR
If you're the repository owner and can't merge:
- Make sure "Do not allow bypassing the above settings" is unchecked
- Or temporarily disable branch protection for emergency fixes

## Related Files

- [.github/workflows/ci.yml](.github/workflows/ci.yml) - CI configuration
- [.github/workflows/pr-check.yml](.github/workflows/pr-check.yml) - PR validation
- [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) - PR template
