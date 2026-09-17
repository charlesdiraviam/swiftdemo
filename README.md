# SWIFT — Emergency & Urgent Care demo

A static, no-build client demo for the SWIFT clinic. Two shipped files
(`index.html`, `mock/`), with a GitHub Actions workflow that deploys to
**Azure Static Web Apps** (free tier).

```
index.html                        — markup, styles, JSON-LD
mock/data.js                      — clinic data (services, doctors, wait times, FAQs…)
mock/app.js                       — UI logic (tabs, triage, AI concierge, jump bar)
mock/img/                         — images referenced by the page
.github/workflows/azure-swa.yml   — GH Actions → SWA deploy (hand-maintained)
.gitignore                        — excludes .claude/, plans/, *.zip, OS junk
```

No backend. No build step. No environment variables.

Everything else in the repo root (`tokens/`, `components/`, `workflows/`,
`accessibility/`, …) is design-system documentation and tooling. It is **not
deployed** — the workflow publishes only `index.html` and `mock/`.

## Environments

| Branch                   | SWA environment          | URL |
|--------------------------|--------------------------|-----|
| `main`                   | production (`default`)   | https://proud-rock-09fc6d700.2.azurestaticapps.net |
| `feature/refactor-heltro`| `staging`                | https://proud-rock-09fc6d700-staging.eastasia.2.azurestaticapps.net |

Both are driven by the single workflow `.github/workflows/azure-swa.yml`,
which triggers on `push` to those two branches (and manual
`workflow_dispatch`). Two inputs decide where a deploy lands, and getting
either wrong can send feature-branch code to production:

- `production_branch: "main"` — marks `main` as production. Without it, a push
  from *any* tracked branch deploys to production.
- `deployment_environment` — names the environment, and takes precedence over
  `production_branch`. Blank means production.

The staging environment name is the literal string `"staging"` and **never**
the branch name. Environment names must match `[0-9a-zA-Z]` and be at most 16
characters; `feature/refactor-heltro` is 23 characters and contains a slash. An
invalid name is not reliably rejected — [Azure/static-web-apps#1062][1062]
shows a deploy print the name error and then land on production anyway.

[1062]: https://github.com/Azure/static-web-apps/issues/1062

The smoke test guards against exactly that: any non-`main` deploy must report a
`-staging.*` host, or the job fails. A passing test can therefore never hide
production being overwritten.

### PR previews

Not currently configured. The workflow is push-only, and
`deployment_environment` is ignored on `pull_request` events anyway — SWA
replaces it with the PR number. To add previews, add a `pull_request` trigger
and a job that deploys without `deployment_environment`.

## Local development

```bash
# from the repo root
python3 -m http.server 5175
# open http://localhost:5175
```

Or any other static file server:

```bash
npx serve .
# or
ruby -run -e httpd . -p 5175
```

For syntax checks:

```bash
node -c mock/app.js
node -c mock/data.js
```

There is no build step — the workflow stages the site itself. Confirm the two
things the page needs are present and committed:

```bash
ls index.html mock/    # expect: index.html, app.js, data.js, img/
```

## Deploy

Push to `main`:

```bash
git checkout main
git merge --no-ff feature/refactor-heltro
git push origin main
```

The workflow (`.github/workflows/azure-swa.yml`) runs and:

1. Checks out the repo.
2. Stages `index.html` and `mock/` into `_site/`.
3. Uploads `_site/` to the SWA edge (`app_location: "/_site"`,
   `output_location: ""`, `skip_app_build: true`).
4. Runs a smoke test and fails the job unless the deployed page serves real
   content.

The deploy step prints its own URL, so no hostname is hardcoded in the
workflow.

## Post-deploy verification

```bash
URL="https://proud-rock-09fc6d700.2.azurestaticapps.net"

# 1. Root responds 200
curl -sI "$URL/" | head -1

# 2. Mock JS is served
curl -s -o /dev/null -w '%{http_code}\n' "$URL/mock/app.js"

# 3. Index references the mock scripts
curl -s "$URL/" | grep -c '<script src="mock/'
# expect 2
```

**An HTTP 200 does not mean the site deployed.** A never-deployed SWA serves a
placeholder page that also returns 200, with an empty `<title>` and a
stylesheet on `appservice.azureedge.net`. Assert on content, not status — which
is what the workflow's smoke test does:

| Check                     | Marker            |
|---------------------------|-------------------|
| `/`                       | `Think SWIFT` (rendered body markup, hero `<h1>`) |
| `/mock/data.js`           | `window.SWIFT_DATA` |
| `/mock/app.js`            | `SWIFT_DATA`      |

A `<head>`-only marker would be satisfied by a page that renders nothing, so the
test deliberately asserts on body markup and on both mock assets.

Then a manual in-browser walkthrough at desktop + 375 px:

- Hero AI symptom check → outcome card.
- Tab strip on `#checkin` and `#beforeYouVisit` open cleanly.
- Jump bar: 4 pills centered on mobile, 9 pills left-aligned on desktop.
- Zero console errors.

## Repository setup

```bash
# 1. Push to GitHub
gh repo create swiftdemo --public --source=. --remote=origin --push
# or, if a repo already exists:
git remote add origin git@github.com:OWNER/swiftdemo.git
git push -u origin main
```

## Pre-deploy — Azure resources

### 1. Create a resource group

```bash
az group create \
  --name swift-demo-rg \
  --location eastasia
```

### 2. Create the Static Web App (free tier)

**Do not pass `--source` or `--login-with-github`.** Those flags couple the SWA
to GitHub: Azure writes its own workflow file
(`.github/workflows/azure-static-web-apps-<id>.yml`) and installs a secret named
after the resource. That generated workflow then competes with the
hand-maintained `azure-swa.yml` — two workflows deploying the same site, and the
generated one fails with `deployment_token was not provided` the moment the
resource is recreated or moved. Create the resource alone and wire the secret
yourself.

```bash
az staticwebapp create \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --location eastasia \
  --sku Free
```

### 3. Install the deployment token as a repo secret

```bash
# The token. NOTE: this prints a live credential — don't paste it into a
# terminal that's being logged or shared.
api_key=$(az staticwebapp secrets list \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --query "properties.apiKey" -o tsv)

gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_SWIFT_DEMO \
  --repo OWNER/swiftdemo \
  --body "$api_key"

# Confirm
gh secret list --repo OWNER/swiftdemo
```

The secret name here is **our choice**, because we created the resource without
`--source`. The workflow in this repo references exactly
`AZURE_STATIC_WEB_APPS_API_TOKEN_SWIFT_DEMO`:

```
secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_SWIFT_DEMO
```

If you let Azure create the resource from a repo, it instead names the secret
after the SWA resource (e.g. `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_STONE_055862900`)
and the workflow's reference won't resolve — that mismatch is the single most
common cause of `deployment_token was not provided`. Whatever you name the
secret, the workflow must reference the same string.

**A deployment token is bound to its resource.** Moving or recreating the SWA
invalidates it. After any recreate, repeat this step.

### 4. (Optional) Custom domain + free SSL

```bash
az staticwebapp hostname set \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --hostname demo.swiftclinic.example.com
```

The command prints a CNAME target. Add it to your DNS provider.
SWA provisions a free managed SSL certificate within ~15 minutes.

## Cleanup

```bash
# Remove the SWA + resource group when no longer needed
az group delete --name swift-demo-rg --yes --no-wait
```

## Known limits (free tier)

- 100 GB bandwidth / month.
- 2 custom domains max.
- Free managed SSL per custom domain.
- No SLA, no AlwaysOn, but the cold-start is much milder than App Service F1
  because SWA's edge keeps the static assets warm globally.
- API linked-function containers (Node, .NET, Python) are limited to 512 MB RAM.

## Troubleshooting

| Symptom                                       | Cause / Fix                                                                 |
|-----------------------------------------------|------------------------------------------------------------------------------|
| `deployment_token was not provided`           | The workflow references a secret name that doesn't exist. `gh secret list`, then make the workflow reference that exact string. The repo's workflow expects `AZURE_STATIC_WEB_APPS_API_TOKEN_SWIFT_DEMO`. |
| Push to the feature branch redeployed production | `deployment_environment` is missing or invalid, so the deploy fell through to the default environment. Keep `production_branch: "main"` and `deployment_environment: "staging"` on the staging step. |
| Deploy prints an environment-name error but still succeeds | [Azure/static-web-apps#1062][1062] — the invalid name is reported and then ignored. Environment names must be `[0-9a-zA-Z]` and ≤ 16 chars; use a literal like `staging`, never a branch name. |
| `Unexpected input(s) 'production_branch', 'deployment_environment'` | Cosmetic. `Azure/static-web-apps-deploy@v1` resolves to a tag whose `action.yml` declares a shorter input list than the v1 branch tip. GitHub still forwards undeclared `with:` keys as `INPUT_*` env vars, and the action honours them — confirmed by staging deploys landing on the staging host. |
| Workflow fails at `Deploy` with 403           | SWA token revoked, or the resource was moved/recreated. Re-run step 3 to reinstall the token. |
| Site returns 200 but shows a blank/placeholder page | A never-deployed SWA serves a placeholder that also returns 200 (empty `<title>`, stylesheet on `appservice.azureedge.net`). Check the smoke test output — it asserts on real content for this reason. |
| Smoke test fails: `'Think SWIFT' absent`      | The upload didn't include `index.html`, or the wrong branch deployed. Confirm `_site/index.html` is listed in the "Build static site" step. |
| Smoke test fails: `'window.SWIFT_DATA' absent`| `mock/` didn't make it into `_site/`. Check that `mock/data.js` is committed and the staging step copies `mock/`. |
| `404 — index.html not found`                  | `app_location` must point at the staged directory (`/_site`) and that directory must contain `index.html`. |
| `az staticwebapp create --source …` returns 403 "Resource not accessible by personal access token" | You're on the `--source` path this repo deliberately avoids. Use the manual path in step 2 instead — it writes nothing to GitHub. |
| `gh auth login` fails on macOS with keychain error | `export GITHUB_TOKEN="ghp_…"` and use `GH_TOKEN` env var instead.            |
