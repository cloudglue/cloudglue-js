# CloudGlue JS SDK

CloudGlue turns video into LLM-ready data. This SDK (`@cloudglue/cloudglue-js`) provides type-safe TypeScript clients for uploading, analyzing, searching, and querying video content.

## Mental Model

```text
Files (upload video/audio)
  → Processing (describe, extract, face detection)
    → Collections (group processed files)
      → Querying (chat, search, deep search, responses API)
```

1. **Upload** a video file or provide a URL
2. **Process** it with describe (multimodal descriptions) or extract (structured data)
3. **Organize** files into collections
4. **Query** collections via chat, search, deep search, or the Responses API

## SDK Architecture

The main entry point is the `Cloudglue` class which exposes all API namespaces:

```typescript
import { Cloudglue } from '@cloudglue/cloudglue-js';
const client = new Cloudglue({ apiKey: process.env.CLOUDGLUE_API_KEY });
```

Internally, the SDK uses:
- **Zodios** (`@zodios/core`) for type-safe HTTP with Zod schema validation
- **Axios** for HTTP transport (file uploads use axios directly for multipart/form-data)
- Server-side validation only (`validate: false`)

## API Namespace Reference

| Namespace | Purpose | Key Methods |
|-----------|---------|-------------|
| `client.files` | Upload & manage video files | `uploadFile`, `listFiles`, `getFile`, `deleteFile`, `waitForReady` |
| `client.collections` | Organize videos into groups | `createCollection`, `addMedia`, `listVideos`, `waitForReady` |
| `client.describe` | Multimodal video descriptions | `createDescribe`, `getDescribe`, `waitForReady` |
| `client.extract` | Structured data extraction | `createExtract`, `getExtract`, `waitForReady` |
| `client.chat` | Chat over video collections | `createCompletion`, `getCompletion` |
| `client.responses` | OpenAI-compatible Responses API | `createResponse`, `createStreamingResponse`, `waitForReady` |
| `client.search` | Semantic search | `searchContent` |
| `client.deepSearch` | Agentic retrieval with LLM summary | `createDeepSearch`, `createStreamingDeepSearch`, `waitForReady` |
| `client.segmentations` | Video segmentation | `getSegmentation`, `deleteSegmentation` |
| `client.segments` | Manage video segments | CRUD operations on segments |
| `client.frames` | Frame extraction | Frame management |
| `client.faceDetection` | Detect faces in video | `createFaceDetection`, `waitForReady` |
| `client.faceMatch` | Match faces across videos | `createFaceMatch`, `waitForReady` |
| `client.dataConnectors` | Browse connected data sources | `list`, `listFiles` |
| `client.webhooks` | Event notifications | CRUD operations |
| `client.tags` | Video tagging | CRUD operations |
| `client.shareable` | Public sharing links | CRUD operations |

## Documentation Hierarchy

When looking for information about this SDK:

1. **Embedded docs** (this directory) — version-locked API reference
2. **Source code** (`src/api/*.api.ts`) — Enhanced API wrapper classes with full type info
3. **Remote docs** (`https://docs.cloudglue.dev/llms.txt`) — conceptual guides and deep dives
