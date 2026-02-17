# Live Demo Flow (5-10 Minutes)

Use this script to present the full story: local scan + GitHub Actions scan, without artifact upload.

## Pre-demo checklist

- JFrog credentials are valid (`JF_URL`, `JF_ACCESS_TOKEN`)
- Target GitHub repo is selected
- GitHub secrets are set (`FROGBOT_URL`, `FROGBOT_ACCESS_TOKEN`)
- Workflows are present in the target repo
- Internet access is available

## Minute-by-minute narrative

### 0:00-1:00 | Frame the objective

Say:

- "I will scan an existing GitHub repo for SCA and SAST using JFrog."
- "This flow does not upload build artifacts."
- "I will show both local CLI scanning and GitHub Actions/Frogbot scanning."

Show:

- `README.md`
- `docs/no-upload-proof.md`

### 1:00-3:30 | Local scan path (CLI)

Run:

```bash
export JF_URL="https://<your-jfrog-domain>.jfrog.io"
export JF_ACCESS_TOKEN="<your-access-token>"
chmod +x scripts/local-scan.sh
./scripts/local-scan.sh "https://github.com/<org-or-user>/<repo>.git" --branch main
```

Show:

- `scan-output/<repo>-<timestamp>/audit.json`
- `scan-output/<repo>-<timestamp>/scan.json`
- `scan-output/<repo>-<timestamp>/summary.txt`

Say:

- "`jf audit` provides dependency-based SCA results."
- "`jf scan .` adds source/filesystem scan coverage."
- "No artifact upload commands were executed."

### 3:30-6:30 | GitHub Actions path (Frogbot)

Show:

- `.github/workflows/frogbot-pr-scan.yml`
- `.github/workflows/frogbot-repo-scan.yml`

Action:

1. Open a PR (or update an existing PR) to trigger PR scan.
2. Open Actions run and show Frogbot execution.
3. Show PR findings/comments from Frogbot.
4. Trigger repository scan using workflow dispatch.

Say:

- "Frogbot scans the repo directly from GitHub context."
- "Findings include dependency and source security signals."
- "Again, this is scan-only; no artifact publishing pipeline is used."

### 6:30-8:00 | Prove no-upload behavior

Run:

```bash
rg "jf rt (upload|u|bp|bce|build-publish)" .
```

Say:

- "No upload/publish commands are present in this demo kit."
- "The workflows and local script are built exclusively for scan operations."

### 8:00-10:00 | Wrap-up and Q&A

Say:

- "We can shift left by scanning existing GitHub repos immediately."
- "SCA and SAST visibility is achieved without artifact upload."
- "If needed, we can later extend this into full CI/CD with policy gates."

## Fallbacks if something fails live

- If PR scan is delayed, show previous successful workflow run and local JSON outputs.
- If target repo has no findings, switch to a known vulnerable sample repo.
- If token expires, rotate token and rerun only the failed step.
