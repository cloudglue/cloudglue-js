# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloudglue JavaScript SDK - TypeScript SDK for the Cloudglue API, which turns video into LLM-ready data. The SDK provides type-safe clients for file management, video description, extraction, chat completions, semantic search, and more.

## Embedded Docs

The `docs/` directory contains agent-friendly documentation that ships with the npm package. These are the primary reference for SDK usage — see `docs/overview.md` for the full file listing and mental model. When making changes to the SDK API surface, update the corresponding doc in `docs/`.

## Commands

```bash
# Development setup (after cloning)
make submodule-init          # Initialize OpenAPI spec submodule
pnpm install                 # Install dependencies
npm run generate             # Generate API clients from OpenAPI spec
npm run build                # Compile TypeScript

# During development
npm run watch                # Watch mode - rebuild on changes
npm run clean                # Clean build artifacts

# Update API spec
make submodule-update        # Pull latest OpenAPI spec
npm run generate             # Regenerate clients
```

## Architecture

**Layered SDK Pattern:**
- `/generated/` - Auto-generated Zodios API clients from OpenAPI spec (do not edit manually)
- `/src/api/` - Enhanced wrapper classes providing user-friendly interfaces over generated clients
- `/src/client.ts` - Main `Cloudglue` class that orchestrates all 15 API clients
- `/src/index.ts` - Public exports

**Code Generation Pipeline:**
1. OpenAPI spec lives in `spec/` submodule (from cloudglue-api-spec repo)
2. `npm run generate` uses `openapi-zod-client` to generate Zodios clients with Zod schemas
3. `generate.js` applies post-generation transforms (File→CloudglueFile aliasing, nullish type fixes)
4. `scripts/build.js` replaces `__SDK_VERSION__` placeholder during build

**Key Technologies:**
- Zodios (`@zodios/core`) for type-safe HTTP client with Zod validation
- Axios for HTTP transport with file upload support
- Server-side validation only (`validate: false` in client options)

## API Surface

The `Cloudglue` client exposes these API namespaces:
- `files` - Upload, list, delete video files; manage segmentation
- `collections` - Group videos for chat/search
- `chat` - LLM chat completions over video collections (model: nimbus-001)
- `describe` - Rich video descriptions (visual, speech, text, audio modalities)
- `extract` - Structured data extraction from videos
- `search` - Semantic search across collections
- `segments`, `segmentations` - Video segment management
- `frames` - Frame extraction
- `faceDetection`, `faceMatch` - Face recognition features
- `webhooks`, `tags`, `shareable` - Supporting features

Note: `transcribe` is deprecated in favor of `describe`.

## Patterns

**Async Job Polling:** Long-running operations use `waitForReady()` methods with configurable polling:
```typescript
const result = await client.files.waitForReady(fileId, {
  pollingInterval: 5000,  // ms between checks
  maxAttempts: 36         // max poll attempts
});
```

**File Uploads:** Direct Axios calls bypass Zodios for multipart form-data (see `files.api.ts`).

**Error Handling:** Custom `CloudglueError` class wraps API errors with response metadata.
