# Search API

Semantic search across video collections.

## Search

```typescript
import { FilterOperator } from '@cloudglue/cloudglue-js';

const results = await client.search.searchContent({
  query: 'product demo pricing discussion',
  collections: ['col_id_1'],
  scope: 'segment',      // 'segment' (timestamp-level), 'file' (whole video), or 'face'
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
| `moment` | Moments discovered by a rubric in a `moments` collection, each carrying its `criterion_name` | Retrieving against a standing standard — see [Find Moments](./find-moments.md) |
| `file` | Whole-video relevance scores | Finding which videos are relevant |
| `face` | Face matches (use with `source_image`) | Finding a person across videos |

## Search Modalities

Pass `search_modalities` (up to 5) to control what is searched; multiple modalities run as a hybrid search that combines results from each:

| Modality | Matches against |
|----------|-----------------|
| `general_content` | Baseline semantic match on visual/spoken content similarity to the query |
| `speech_lexical` | Keyword/exact match on speech transcripts |
| `ocr_lexical` | Keyword/exact match on on-screen text |
| `tag_semantic` | Semantic similarity on tag values |
| `tag_lexical` | Keyword/exact match on tag values |
| `doc_lexical` | Keyword/exact match on file-level documents — generated summaries, metadata-collection docs, and entity-collection docs. `scope: 'file'` only. |

`doc_lexical` is how you search `metadata` and `entities` collections (see [Collections](./collections.md)).

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
