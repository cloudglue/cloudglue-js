# Chat API

Chat completions over video collections using the `nimbus-001` model.

## Create a Chat Completion

```typescript
const response = await client.chat.createCompletion({
  model: 'nimbus-001',
  messages: [
    { role: 'system', content: 'You are a helpful video analyst.' },
    { role: 'user', content: 'What topics are discussed in these videos?' },
  ],
  collections: ['collection_id'],  // nimbus-001 supports one collection at a time
  include_citations: true,
  force_search: true,
});

console.log(response.choices[0].message.content);
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | `string` | Must be `'nimbus-001'` |
| `messages` | `ChatMessage[]` | Array of `{ role, content }` messages |
| `collections` | `string[]` | Collection IDs to query (one collection at a time) |
| `include_citations` | `boolean` | Include source citations in response |
| `force_search` | `boolean` | Force search even if query seems general |

## Get & List

```typescript
const completion = await client.chat.getCompletion(completionId);

const completions = await client.chat.listCompletions({
  limit: 10,
  created_after: '2025-01-01',  // YYYY-MM-DD format
});
```

## Chat API is being phased out

The Chat API is being replaced by the **Responses API** (`client.responses`). Use the Responses API for all new projects — it supports streaming, background jobs, function calling, entity-backed knowledge, file-level knowledge bases, and an OpenAI-compatible format.

The Chat API remains available for existing integrations but should not be used for new development.
