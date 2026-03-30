# Responses API

OpenAI Responses-compatible API for chat completions with video knowledge bases. Supports streaming, background jobs, and entity-backed knowledge. This is the recommended API for querying video content (preferred over the Chat API).

## Models

| Model | Description |
|-------|-------------|
| `nimbus-001` | Fast Q&A over video content |
| `nimbus-002-preview` | Advanced reasoning, entity-backed knowledge |

## Create a Response

```typescript
const response = await client.responses.createResponse({
  model: 'nimbus-001',
  input: 'What are the main topics discussed?',
  knowledge_base: {
    source: 'collections',
    collections: ['collection_id'],
  },
  instructions: 'Be concise and cite sources.',
  temperature: 0.7,
  max_output_tokens: 4096,
});
```

## Knowledge Base Sources

### Collections (default)
```typescript
knowledge_base: {
  source: 'collections',  // optional, defaults to 'collections'
  collections: ['col_id_1', 'col_id_2'],
  filter: { /* SearchFilter */ },
}
```

### Individual Files
```typescript
knowledge_base: {
  source: 'files',
  files: ['file_id_1', 'file_id_2'],
}
```

### Default Index
Includes files with `use_in_default_index: true` in their describe jobs, as well as videos that have been added to any collection.
```typescript
knowledge_base: {
  source: 'default',
}
```

### Entity-Backed Knowledge (nimbus-002-preview)
```typescript
knowledge_base: {
  source: 'collections',
  type: 'entity_backed_knowledge',
  collections: ['col_id'],
  entity_backed_knowledge_config: {
    description: 'Product catalog from video reviews',
    entity_collections: [
      {
        name: 'Products',
        description: 'Extracted product entities',
        collection_id: 'entities_col_id',
      },
    ],
  },
}
```

## Streaming

```typescript
const stream = await client.responses.createStreamingResponse({
  model: 'nimbus-001',
  input: 'Summarize the key points.',
  knowledge_base: { source: 'collections', collections: ['col_id'] },
});

for await (const event of stream) {
  switch (event.type) {
    case 'response.output_text.delta':
      process.stdout.write(event.delta);
      break;
    case 'response.completed':
      console.log('\nDone!');
      break;
  }
}
```

### Streaming Event Types

| Event | Description |
|-------|-------------|
| `response.created` | Response object created |
| `response.output_item.added` | New output item started |
| `response.content_part.added` | New content part started |
| `response.output_text.delta` | Text chunk (has `delta` field) |
| `response.output_text.done` | Full text complete (has `text` field) |
| `response.content_part.done` | Content part complete |
| `response.output_item.done` | Output item complete |
| `response.completed` | Full response complete |
| `error` | Error occurred |

## Structured Input

```typescript
const response = await client.responses.createResponse({
  model: 'nimbus-001',
  input: [
    {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text: 'What happened in the meeting?' }],
    },
  ],
  knowledge_base: { source: 'collections', collections: ['col_id'] },
});
```

## Background Jobs

```typescript
const bg = await client.responses.createResponse({
  model: 'nimbus-001',
  input: 'Detailed analysis of all videos.',
  knowledge_base: { source: 'collections', collections: ['col_id'] },
  background: true,
});

const result = await client.responses.waitForReady(bg.id);
```

## List, Get, Delete, Cancel

```typescript
const list = await client.responses.listResponses({ limit: 10, status: 'completed' });
const resp = await client.responses.getResponse(responseId);
await client.responses.deleteResponse(responseId);
await client.responses.cancelResponse(responseId);  // cancel in-progress background job
```

## Include Citations

```typescript
const response = await client.responses.createResponse({
  model: 'nimbus-001',
  input: 'What was said about pricing?',
  knowledge_base: { source: 'collections', collections: ['col_id'] },
  include: ['cloudglue_citations.media_descriptions'],
});
```
