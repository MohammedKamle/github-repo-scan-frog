# JFrog GitHub Scan Demo (Without Uploading Artifacts)

This demo kit shows how to scan an existing GitHub repository with JFrog for:

- SCA (dependency vulnerability and license checks)
- SAST/Advanced Security findings (secrets, IaC, source security context)

All scans are run directly from source and dependency metadata. No build artifacts are uploaded to Artifactory.

## What this proves

- You can run `jf audit` and `jf scan` against source code locally.
- You can run Frogbot in GitHub Actions to scan pull requests and repository branches.
- The workflow does not use `jf rt upload`, `jf rt bp`, or `jf rt bce`.

See `docs/no-upload-proof.md` for verification details.

## Repository layout

- `package.json` - intentionally vulnerable Node.js dependency set for SCA demo
- `src/server.js` - intentionally insecure API routes for SAST demo
- `scripts/local-scan.sh` - local CLI demo automation
- `.github/workflows/frogbot-pr-scan.yml` - PR scan workflow
- `.github/workflows/frogbot-repo-scan.yml` - repository scan workflow
- `docs/secrets-and-prereqs.md` - prerequisites and secrets
- `docs/no-upload-proof.md` - how to verify scan-only behavior
- `docs/demo-flow.md` - 5-10 minute live demo narrative

## Built-in Node.js demo project (this repo)

This repository now contains a demo Node.js app with intentionally vulnerable dependencies and insecure code paths so you can demo SCA/SAST directly from this repo.

```bash
npm install
npm start
```

Main file: `src/server.js`

## Prerequisites

1. JFrog Platform URL and access token with Xray/Advanced Security access.
2. A GitHub repository to scan (you can use this repository).
3. Local tools for CLI path:
   - `git`
   - `jf` (JFrog CLI)
4. For GitHub Actions path:
   - ability to add repository secrets
   - workflows enabled on the repository

Detailed setup: `docs/secrets-and-prereqs.md`.

## Path A: Local CLI demo (scan existing GitHub repo)

### 1) Export credentials

```bash
export JF_URL="https://<your-jfrog-domain>.jfrog.io"
export JF_ACCESS_TOKEN="<your-access-token>"
```

### 2) Run local scan script

```bash
chmod +x scripts/local-scan.sh
./scripts/local-scan.sh "https://github.com/<org-or-user>/<repo>.git"
```

Optional arguments:

```bash
./scripts/local-scan.sh "https://github.com/<org-or-user>/<repo>.git" --branch main --output ./demo-output
```

### 3) Review local evidence files

The script writes results under `./scan-output/<repo>-<timestamp>/`:

- `audit.json` - SCA results from `jf audit`
- `scan.json` - source/filesystem scan from `jf scan .`
- `run.log` - execution log

## Path B: GitHub Actions demo (Frogbot)

1. Use this repo as target, or copy `.github/workflows/` into another target repo.
2. Add required secrets in the target repo:
   - `FROGBOT_URL`
   - `FROGBOT_ACCESS_TOKEN`
3. Open a PR to trigger PR scan workflow.
4. Trigger the repository scan via manual dispatch (on-demand).

Frogbot setup details: `docs/secrets-and-prereqs.md`.

## Demo order (recommended)

1. Run local scan script to show immediate scan without upload.
2. Show scan JSON outputs generated locally.
3. Open/refresh a PR to show Frogbot comments and findings.
4. Show JFrog findings UI and explain policy/severity.
5. Close by proving no artifact upload commands are used.

Step-by-step speaking script: `docs/demo-flow.md`.

## Notes

- SCA works with supported package managers and dependency manifests.
- SAST/secrets/IaC findings require JFrog Advanced Security entitlement.
- If the target repo has no supported dependencies or no vulnerable code patterns, findings may be minimal. For live demos, choose a repo known to produce findings.
