# Proof: Scanning Without Uploading Artifacts

This demo is intentionally scan-only.

## Commands used in this project

### Local script (`scripts/local-scan.sh`)

The script executes only:

- `jf audit --format=json`
- `jf scan . --format=json`

These commands scan source/dependencies and do not publish build artifacts.

### GitHub Actions workflows

Workflows run:

- `jfrog/frogbot@v2`

Frogbot performs repository security scanning and reporting. This setup does not include artifact upload commands.

## Commands explicitly not used

This demo does not use:

- `jf rt upload`
- `jf rt u`
- `jf rt bp`
- `jf rt bce`
- `jf rt build-publish`
- any `jf mvn`, `jf gradle`, or `jf npm` build-and-publish flow

## How to verify in your demo

From the project root, run:

```bash
rg "jf rt (upload|u|bp|bce|build-publish)" .
```

Expected result:

- No matches.

Also run:

```bash
rg "jf audit|jf scan|frogbot" .
```

Expected result:

- Matches only for scan-related commands and workflows.

## Runtime evidence checklist

During local demo execution:

1. Show the `summary.txt` created by `scripts/local-scan.sh`.
2. Show `audit.json` and `scan.json` were generated locally.
3. Confirm no upload command appears in `run.log`.

During GitHub Actions demo:

1. Open workflow run logs.
2. Show Frogbot scan execution and PR/repository findings output.
3. Confirm no step invokes `jf rt upload` or build publish commands.

## Key message for stakeholders

"We are scanning source code and dependency graphs directly from GitHub and local checkout. Findings are sent to JFrog security services for analysis, but build artifacts are not uploaded as part of this demo flow."
