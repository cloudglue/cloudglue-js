# AGENTS.md

## Cursor Cloud specific instructions

This repo is the TypeScript SDK for the hosted CloudGlue API (`https://api.cloudglue.dev/v1`). There is no local backend to run — the SDK is a client library.

- Package manager: **npm** (`package-lock.json` is committed). `.npmrc` sets `ignore-scripts=true`. Dependencies are installed automatically by the environment update script.
- Build/test/run commands are documented in `README.md` and `CLAUDE.md`. Common ones: `npm run build`, `npm run test` (node:test via `tsx`), `npm run watch`.
- The generated Zodios clients in `generated/` are **committed**, so `npm run generate` and the `spec/` git submodule (`make submodule-init`) are **not** required to build or test. Only run `npm run generate` when intentionally regenerating from an updated spec.
- Tests are pure unit tests (URL classification, mocked file API, connector grammar). They run **fully offline** and need no `CLOUDGLUE_API_KEY`.
- No lint script is defined. `npx prettier --check "src/**/*.ts"` reports pre-existing style diffs and warns about an unknown `importOrder` option (a prettier plugin referenced in `.prettierrc.json` is not installed); these warnings are benign — do not reformat committed code as part of unrelated work.
- Exercising real API calls (upload/describe/chat) requires a valid `CLOUDGLUE_API_KEY` (keys start with `cg-`) and network access to `api.cloudglue.dev`. Without a key, live calls fail fast with `CloudglueError: API key is not valid`, which confirms transport wiring works.
