# SWIFT — Emergency & Urgent Care demo

A static, no-build client demo for the SWIFT clinic. Three shipped files
(`index.html`, `mock/data.js`, `mock/app.js`), with a GitHub Actions
workflow that deploys to **Azure Static Web Apps** (free tier).

```
index.html       — markup, styles, JSON-LD
mock/data.js     — clinic data (services, doctors, wait times, FAQs…)
mock/app.js      — UI logic (tabs, triage, AI concierge, jump bar)
.github/workflows/azure-swa.yml   — GH Actions → SWA deploy
.gitignore       — excludes .claude/, plans/, *.zip, OS junk
```

No backend. No build step. No environment variables.

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

For the production build layout:

```bash
mkdir -p _site && cp index.html _site/ && cp -r mock _site/
ls _site            # expect: index.html, mock/
```

## Repository setup

```bash
# 1. Push to GitHub
gh repo create swiftdemo --public --source=. --remote=origin --push
# or, if a repo already exists:
git remote add origin git@github.com:OWNER/swiftdemo.git
git push -u origin feature/github-azure-swa

# 2. Merge feature/github-azure-swa → main so the workflow runs on push to main.
#    The workflow (.github/workflows/azure-swa.yml) triggers on push to main.
```

## Pre-deploy — Azure resources

### 1. Create a resource group

```bash
az group create \
  --name swift-demo-rg \
  --location eastasia
```

### 2. Create the Static Web App (free tier)

This step does two things at once — creates the Azure SWA resource **and**
installs the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in your GitHub repo.

**Prerequisites** (run these once before the create command):

```bash
# 2a. Install the GitHub CLI (macOS)
brew install gh
# or: https://cli.github.com/manual/installation

# 2b. Authenticate to GitHub
gh auth login
#   → choose: GitHub.com
#   → choose: HTTPS or SSH (match what you used to clone the repo)
#   → choose: Login with a web browser (easiest) or paste a PAT
#   → required PAT scopes: repo, workflow
#
# If using a PAT directly:
#   echo "ghp_xxxxxxxxxxxx" | gh auth login --with-token
#   export GH_TOKEN="ghp_xxxxxxxxxxxx"

# 2c. Confirm GitHub auth is working
gh auth status
# Expect: "Logged in to github.com as <you>"

# 2d. Confirm Azure auth is working
az login         # opens browser; first-time only
az account show  # shows the subscription you'll deploy into
```

**Create the SWA:**

```bash
az staticwebapp create \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --source https://github.com/OWNER/swiftdemo \
  --branch main \
  --location eastasia \
  --sku Free \
  --login-with-github    # <-- without this, the GH secret is NOT installed
```

`--login-with-github` is what lets Azure install
`AZURE_STATIC_WEB_APPS_API_TOKEN` into your repo's secrets. **Without it,
the SWA gets created but the workflow fails with a 401.**

Internally `--login-with-github` uses GitHub OAuth (or a PAT with
`workflow` scope + `Contents: read & write`) to **write a workflow file**
into `.github/workflows/azure-static-web-apps-<id>.yml`. If your PAT only
has `Contents` and not `Workflows`, you'll see:

```
(BadRequest) Request to GitHub (PUT …/.github/workflows/azure-static-web-apps-…yml)
failed with status code: 403 (Forbidden).
… "Resource not accessible by personal access token"
```

If that happens, skip `--source` entirely and use the recovery section
below — it doesn't write anything to GitHub.

**What gets created automatically:**

- The Azure SWA resource (free tier).
- A webhook on your GitHub repo pointing at the SWA.
- A `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in the repo's secrets.
- A default workflow file at `.github/workflows/azure-static-web-apps.yml`
  which we **override** with our own `azure-swa.yml`. Delete the
  auto-generated one once our custom workflow is in place to avoid
  duplicate runs.

**Verify the GH secret landed:**

```bash
gh secret list --repo OWNER/swiftdemo
# Expect a row containing: AZURE_STATIC_WEB_APPS_API_TOKEN, updated <timestamp>
```

If the secret isn't there, see the recovery section below.

### 2½. Recovery — when `--login-with-github` fails or the secret is missing

If step 2 returned a 403 ("Resource not accessible by personal access
token"), the SWA was created but the GitHub-side wiring didn't happen.
**Don't bother re-running with another PAT — use the manual path:**

```bash
# 1. Get the SWA deployment API key
api_key=$(az staticwebapp secrets list \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --query "properties.apiKey" -o tsv)

# 2. Add it to GitHub via the gh CLI
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN \
  --repo OWNER/swiftdemo \
  --body "$api_key"

# 3. Confirm
gh secret list --repo OWNER/swiftdemo
```

This avoids the workflow-file write entirely. The `gh` CLI's OAuth
permissions are scoped to your user, so it can install repo secrets
even when a manually-supplied PAT can't write `.github/workflows/`.

**If the SWA itself never got created** (i.e. step 2 errored before
returning a resource), recreate it without `--source` and then run
the secret-install step above:

```bash
az staticwebapp create \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --location eastasia \
  --sku Free
# No --source flag — no GitHub coupling; you'll wire secrets manually.
```

### 3. (Optional) Confirm / re-add the GH secret

If the secret wasn't auto-added:

```bash
az staticwebapp secrets list \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --query "properties.apiKey" -o tsv
```

Copy the value, then in GitHub go to
**Settings → Secrets and variables → Actions → New repository secret** and add:

| Name                              | Value (from the command above)         |
|-----------------------------------|----------------------------------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | the API key                            |

### 4. (Optional) Custom domain + free SSL

```bash
az staticwebapp hostname set \
  --name swift-demo-swa \
  --resource-group swift-demo-rg \
  --hostname demo.swiftclinic.example.com
```

The command prints a CNAME target. Add it to your DNS provider.
SWA provisions a free managed SSL certificate within ~15 minutes.

## Deploy

Push to `main`:

```bash
git checkout main
git merge --no-ff feature/github-azure-swa
git push origin main
```

The GH Actions workflow (`Azure/static-web-apps-deploy@v1`) runs and:

1. Builds `_site/` from `index.html` + `mock/`.
2. Uploads to the SWA edge.
3. Smoke-tests the URL with `curl` (HTTP 200 within 60 s).

The default SWA hostname is `https://<env-name>-<id>.azurestaticapps.net`
and is printed in the Actions run log.

## Post-deploy verification

```bash
URL="https://<env-name>-<id>.azurestaticapps.net"

# 1. Root responds 200
curl -sI "$URL/" | head -1

# 2. Mock JS is served
curl -s  "$URL/mock/app.js" | head -1

# 3. Index references the mock scripts
curl -s  "$URL/" | grep -c '<script src="mock/'
# expect 2
```

Then a manual in-browser walkthrough at desktop + 375 px:

- Hero AI symptom check → outcome card.
- Tab strip on `#checkin` and `#beforeYouVisit` open cleanly.
- Jump bar: 4 pills centered on mobile, 9 pills left-aligned on desktop.
- Zero console errors.

## PR preview environments

Every PR against `main` automatically gets a preview URL
(`https://<pr-number>.<env>.azurestaticapps.net`). SWA posts the URL
as a comment on the PR. Use this for client review before merging.

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
| `az staticwebapp create --source …` returns "AADSTS / 401 / authentication failed" | The CLI couldn't talk to GitHub at all. Re-run with `--login-with-github` after `gh auth login`. |
| `az staticwebapp create --source …` returns 403 with "Resource not accessible by personal access token" pointing at `.github/workflows/azure-static-web-apps-…yml` | Your PAT can read the repo but can't write to `.github/workflows/`. Fine-grained tokens need `Workflows: Read and write` in addition to `Contents: Read and write`. Don't re-run with another PAT — use the manual recovery path in section 2½. |
| SWA created but `gh secret list` doesn't show `AZURE_STATIC_WEB_APPS_API_TOKEN` | The SWA was created but the GitHub-side install failed (silent). Use section 2½ — `az staticwebapp secrets list` + `gh secret set`. |
| Workflow fails at `Azure Login`               | `AZURE_STATIC_WEB_APPS_API_TOKEN` missing or stale. Re-run step 3 above.    |
| Workflow fails at `Deploy` with 403           | SWA token revoked or repo moved. Re-link with `az staticwebapp update`.      |
| `curl` smoke test times out                   | SWA propagation takes ~30 s on first deploy. Re-run the workflow.            |
| Site loads but scripts 404                   | `_site/` build step skipped. Confirm `app_location: "/_site"` is in the YAML.|
| `404 — index.html not found`                  | `_site/index.html` missing or not at the zip root. Run the manual build.    |
| PR preview URL never appears                  | Auto-generated Azure workflow still present and conflicts. Delete the auto-generated workflow file in the PR branch. |
| `gh auth login` fails on macOS with keychain error | `export GITHUB_TOKEN="ghp_…"` and use `GH_TOKEN` env var instead.            |