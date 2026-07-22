# GitHub Actions Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions workflow that tests and builds the Vite app and publishes `dist` to a dedicated `deploy` branch.

**Architecture:** A single workflow runs on pushes to `main` and manual dispatch. It installs the lockfile-defined dependencies, runs the existing test and build scripts, then creates a clean orphan `deploy` branch containing only the generated static files and pushes it with the workflow token.

**Tech Stack:** GitHub Actions, Node.js 20, npm, Vite, Vitest, Git.

---

### Task 1: Add the build-and-publish workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Define triggers, permissions, and concurrency**

Add a workflow that triggers on pushes to `main` and `workflow_dispatch`, grants `contents: write`, and allows only one deployment run at a time:

```yaml
name: Build and publish deployment branch

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: deploy-branch
  cancel-in-progress: true
```

- [ ] **Step 2: Add dependency installation, tests, and build**

Use `actions/checkout@v4`, `actions/setup-node@v4` with Node.js 20 and npm caching, then run `npm ci`, `npm test`, and `npm run build` in that order.

- [ ] **Step 3: Publish only the generated files to `deploy`**

Save `dist` to a temporary directory, switch to a fresh orphan `deploy` branch, remove tracked source files, restore the build output, add `.nojekyll`, and force-update only the intended remote branch:

```bash
set -euo pipefail

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

publish_dir="$(mktemp -d)"
cp -R dist/. "$publish_dir/"
touch "$publish_dir/.nojekyll"

git fetch origin deploy || true
git branch -D deploy 2>/dev/null || true
git switch --orphan deploy
git rm -rf . 2>/dev/null || true
cp -R "$publish_dir"/. .
git add -f dist
git add .nojekyll
git commit -m "Deploy ${GITHUB_SHA}"
git push origin deploy --force
```

- [ ] **Step 4: Validate the workflow file locally**

Run `npm test`, `npm run build`, and parse `.github/workflows/deploy.yml` with Ruby's YAML parser. Expected results: tests pass, Vite exits with status 0, and YAML parsing exits with status 0.

### Task 2: Review the resulting change

**Files:**
- Review: `.github/workflows/deploy.yml`
- Review: `git diff --check`

- [ ] **Step 1: Confirm the diff is limited to the workflow and supporting design documents**

Run `git status --short` and inspect the diff. Confirm no generated `dist` files or dependency directories are staged or modified.

- [ ] **Step 2: Check whitespace and final workflow behavior**

Run `git diff --check`, then verify that failed tests or builds occur before the publishing step and that the push target is exactly `origin deploy`.
