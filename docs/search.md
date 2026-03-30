# Search API

Semantic search across video collections.

## Search

```typescript
import { FilterOperator } from '@cloudglue/cloudglue-js';

const results = await client.search.searchContent({
  query: 'product demo pricing discussion',
  collection_ids: ['col_id_1'],
  scope: 'segment',      // 'segment' (timestamp-level) or 'file' (whole video)
  limit: 10,
  filter: {
    metadata: [{
      path: 'category',
      operator: FilterOperator.Equal,
      valueText: 'sales',
    }],
    video_info: [{
      path: 'duration_seconds',
      operator: FilterOperator.GreaterThan,
      valueText: '60',
    }],
  },
});
```

## Search Scopes

| Scope | Returns | Use When |
|-------|---------|----------|
| `segment` | Timestamp-level matches within videos | Finding specific moments |
| `file` | Whole-video relevance scores | Finding which videos are relevant |

## Filter Structure

```typescript
interface Filter {
  metadata?: Array<{
    path: string;                  // metadata key path
    operator: FilterOperator;
    valueText?: string;
    valueTextArray?: string[];
  }>;
  video_info?: Array<{
    path: 'duration_seconds' | 'has_audio';
    operator: FilterOperator;
    scope?: 'file' | 'segment';
    valueText?: string;
    valueTextArray?: string[];
  }>;
  file?: Array<{
    path: 'bytes' | 'filename' | 'uri' | 'created_at' | 'id';
    operator: FilterOperator;
    valueText?: string;
    valueTextArray?: string[];
  }>;
}
```

## FilterOperator Values

| Operator | Description |
|----------|-------------|
| `Equal` | Exact match |
| `NotEqual` | Not equal |
| `LessThan` | Less than |
| `GreaterThan` | Greater than |
| `ContainsAny` | Array contains any of values |
| `ContainsAll` | Array contains all of values |
| `In` | Value is in list |
| `Like` | Pattern match |

## List & Get Search History

```typescript
const history = await client.search.listSearchResponses({ limit: 10 });
const search = await client.search.getSearchResponse(searchId);
```
