# Deep Search API

Agentic retrieval with LLM-powered summarization. Deep Search uses multiple search passes and reasoning to find specific moments across your video data, returning a synthesized summary with citations.

## Create a Deep Search

```typescript
const result = await client.deepSearch.createDeepSearch({
  knowledge_base: {
    source: 'collections',
    collections: ['col_id'],
  },
  query: 'What pricing strategies were discussed?',
  scope: 'segment',          // 'segment' or 'file'
  limit: 50,                 // max results (1-500)
  exclude_weak_results: true,
  include: ['search_queries'], // include the intermediate search queries used
});
```

## Knowledge Base Sources

Same as the Responses API:

```typescript
// Collections
{ source: 'collections', collections: ['col_id'], filter: { /* optional */ } }

// Individual files
{ source: 'files', files: ['file_id_1', 'file_id_2'] }

// Default index
{ source: 'default' }
```

## Streaming

```typescript
const stream = await client.deepSearch.createStreamingDeepSearch({
  knowledge_base: { source: 'collections', collections: ['col_id'] },
  query: 'Find all mentions of competitor products.',
});

for await (const event of stream) {
  switch (event.type) {
    case 'deep_search.text.delta':
      process.stdout.write(event.delta);
      break;
    case 'deep_search.result.added':
      console.log('Result:', event.result);
      break;
    case 'deep_search.completed':
      console.log('\nSearch complete');
      break;
  }
}
```

### Streaming Event Types

| Event | Description |
|-------|-------------|
| `deep_search.created` | Search initiated |
| `deep_search.text.delta` | Summary text chunk |
| `deep_search.text.done` | Full summary text |
| `deep_search.result.added` | Individual search result found |
| `deep_search.completed` | Search finished |
| `error` | Error occurred |

## Background Jobs

```typescript
const bg = await client.deepSearch.createDeepSearch({
  knowledge_base: { source: 'collections', collections: ['col_id'] },
  query: 'Comprehensive analysis of all discussions.',
  background: true,
});

const result = await client.deepSearch.waitForReady(bg.id);
```

## List, Get, Delete, Cancel

```typescript
const list = await client.deepSearch.listDeepSearches({ limit: 10, status: 'completed' });
const ds = await client.deepSearch.getDeepSearch(deepSearchId);
await client.deepSearch.deleteDeepSearch(deepSearchId);
await client.deepSearch.cancelDeepSearch(deepSearchId);  // cancel in-progress search
```
