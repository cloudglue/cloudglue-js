# Releasing

Releases are automated by [`.github/workflows/release.yml`](.github/workflows/release.yml).
Pushing a version tag (`v*.*.*`) builds the package, publishes it to npm using
**OIDC trusted publishing** (no long-lived `NPM_TOKEN`), and creates a GitHub
Release with the built artifacts attached.

## One-time setup (npmjs.com)

Trusted publishing must be enabled once per package on npm:

1. Sign in to [npmjs.com](https://www.npmjs.com) as an account with publish rights
   to `@cloudglue/cloudglue-js`.
2. Go to the package page → **Settings** → **Trusted Publisher**.
3. Choose **GitHub Actions** and fill in:
   - **Organization or user:** `cloudglue`
   - **Repository:** `cloudglue-js`
   - **Workflow filename:** `release.yml`
   - **Environment:** *(leave blank — the workflow does not use a GitHub Environment)*
4. Save.

That's it — no secret is stored in GitHub. The workflow already declares the
required `id-token: write` permission so GitHub can mint the OIDC token npm
exchanges at publish time.

> First publish ever for a brand-new package name may need a one-time manual
> `npm publish` to create the package before trusted publishing can be attached.
> `@cloudglue/cloudglue-js` already exists, so this does not apply here.

## Cutting a release

From an up-to-date `main`:

```bash
# 1. Bump the version — this updates package.json and creates a matching git tag.
npm version patch     # or: minor / major / 0.8.0

# 2. Push the commit and the tag together.
git push --follow-tags
```

Pushing the `v*.*.*` tag triggers the workflow, which:

1. Checks out the repo (the committed `generated/` clients mean the `spec/`
   submodule is **not** needed to build).
2. Installs deps with `npm ci` and upgrades npm to a version that supports
   trusted publishing (≥ 11.5.1).
3. Verifies the tag matches `package.json` `version` (fails fast on a mismatch).
4. Builds (`npm run build`) and runs tests (`npm test`).

   > Note: `.npmrc` sets `ignore-scripts=true`, so `prepublishOnly`/`prepare`
   > do **not** run automatically during `npm publish` — the workflow builds
   > explicitly before publishing.
5. Packages artifacts: the publishable `npm pack` tarball plus convenience
   `*-dist.tar.gz` and `*-dist.zip` archives of the compiled output.
6. Publishes to npm via OIDC (provenance is attached automatically).
7. Creates a GitHub Release for the tag with auto-generated notes and all three
   artifacts attached.

## Manual / fallback publish

If you ever need to publish from your machine (e.g. the workflow is unavailable):

```bash
npm ci
npm run build
npm publish --access public   # requires npm login / 2FA
```

## Troubleshooting

- **`npm error need auth` / OIDC not used** — the Trusted Publisher on npmjs.com
  doesn't match `cloudglue/cloudglue-js` + `release.yml` exactly, or the runner's
  npm is older than 11.5.1. The workflow upgrades npm; double-check the npm config.
- **Publish uses token auth instead of OIDC** — never set `NODE_AUTH_TOKEN` for the
  publish step (no `env:` block, no `${{ secrets.* }}` that could be empty). Any
  value — including an empty string from a missing secret — disables OIDC and forces
  token auth. The workflow intentionally leaves it unset; `registry-url` on
  `setup-node` is fine on its own and is the npm-documented setup.
- **Version mismatch failure** — the pushed tag (`vX.Y.Z`) must equal
  `package.json` `version`. Use `npm version` so they stay in sync.
- **Release created but npm publish skipped** — publish runs *before* the GitHub
  Release step, so if a release appears, the publish succeeded. Check the
  workflow logs for the publish step output.
- **Hardening (optional)** — for a sensitive publish workflow you may want to pin
  the actions to commit SHAs instead of `@v4`/`@v2`.
