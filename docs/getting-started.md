# Getting Started

## Installation

```bash
npm install @cloudglue/cloudglue-js
```

## Client Setup

```typescript
import { Cloudglue } from '@cloudglue/cloudglue-js';

const client = new Cloudglue({
  apiKey: process.env.CLOUDGLUE_API_KEY,  // or pass directly: 'cg-...'
  baseUrl: 'https://api.cloudglue.dev/v1', // default, optional
  timeout: undefined,                       // optional request timeout in ms
});
```

The client reads `CLOUDGLUE_API_KEY` from the environment if `apiKey` is not provided. API keys start with `cg-`.

## Imports

```typescript
// Main client
import { Cloudglue } from '@cloudglue/cloudglue-js';

// Type imports
import type {
  Collection,
  CollectionFile,
  ChatMessage,
  ChatCompletionResponse,
  SearchRequest,
  SearchResponse,
  Filter,
  Modalities,
  WaitForReadyOptions,
} from '@cloudglue/cloudglue-js';

// Enum imports
import { FilterOperator } from '@cloudglue/cloudglue-js';
```

## Async Job Pattern

Most processing operations (describe, extract, file upload) are asynchronous. Use `waitForReady()` to poll until completion:

```typescript
// Upload and wait for processing
const uploaded = await client.files.uploadFile({ file: myFile });
const ready = await client.files.waitForReady(uploaded.data.id, {
  pollingInterval: 5000,  // ms between polls (default: 5000)
  maxAttempts: 36,        // max polls before timeout (default: 36 = 3 min)
});
```

## Error Handling

```typescript
import { CloudglueError } from '@cloudglue/cloudglue-js';

try {
  await client.files.getFile('nonexistent');
} catch (error) {
  if (error instanceof CloudglueError) {
    console.error(error.message);       // Error message
    console.error(error.statusCode);    // HTTP status (404, 401, etc.)
    console.error(error.responseData);  // Full response body
  }
}
```
