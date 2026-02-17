# Secrets and Prerequisites

This guide covers what you need before running the scan demo.

## JFrog prerequisites

- JFrog Platform URL (example: `https://acme.jfrog.io`)
- Access token with permissions to query Xray/Advanced Security findings
- Xray enabled on the JFrog platform
- Advanced Security enabled (for SAST, secrets, IaC, contextual analysis)

## GitHub prerequisites

- A GitHub repository to scan
- Actions enabled in that repository
- Permission to add repository secrets

## Local demo path prerequisites

Install:

- `git`
- JFrog CLI (`jf`)

Verify:

```bash
git --version
jf --version
```

Set environment variables:

```bash
export JF_URL="https://<your-jfrog-domain>.jfrog.io"
export JF_ACCESS_TOKEN="<your-access-token>"
```

Alternative:

- Configure `jf` using `jf c add` and use a named server profile.

## GitHub Actions (Frogbot) required secrets

Add these repository secrets in the target GitHub repo:

- `FROGBOT_URL` - your JFrog Platform URL
- `FROGBOT_ACCESS_TOKEN` - JFrog access token

`GITHUB_TOKEN` is provided automatically by GitHub Actions and used as `JF_GIT_TOKEN`.

## Recommended token guidance

- Use short-lived tokens for demos whenever possible.
- Limit token scopes to least privilege required for scans.
- Do not commit credentials to files; only use environment variables and GitHub secrets.

## Optional variables

You can optionally set:

- `JF_DEPS_REPO` if you want dependency resolution through Artifactory repositories instead of public registries.
- `JF_GIT_BASE_BRANCH` to control which base branch repository scans evaluate.

## Quick validation checklist

Before demo:

- `JF_URL` and `JF_ACCESS_TOKEN` are valid.
- You can reach JFrog from your demo environment.
- Workflows can read repository contents and write PR comments.
- Target repo has dependency manifests or code patterns that will produce findings.
