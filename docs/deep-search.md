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
  scope: 'segment',          // 'segment' or 'file'; omit for auto (the
                             // planner picks scopes per search plan and
                             // fuses results; responses report scope: null)
  limit: 50,                 // max results (1-500)
  exclude_weak_results: true,
  include: ['search_queries'], // include the intermediate search queries used
});
```

## Knowledge Base Sources

Same as the Responses API:

```typescript
// Collections — may be of type media-descriptions, rich-transcripts,
// metadata, or entities. With an explicit scope, every collection must be
// searchable at that scope (metadata and file-level entities collections
// require 'file'; segment-level entities collections require 'segment');
// omit scope to let the planner pick per collection.
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
