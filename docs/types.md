# Key Types

## Configuration

```typescript
interface CloudglueConfig {
  apiKey?: string;      // API key (or use CLOUDGLUE_API_KEY env var). Keys start with 'cg-'.
  baseUrl?: string;     // Default: 'https://api.cloudglue.dev/v1'
  timeout?: number;     // Request timeout in milliseconds
}
```

## Polling

```typescript
type WaitForReadyOptions = {
  pollingInterval?: number;  // ms between polls. Default: 5000 (5s)
  maxAttempts?: number;      // max polls. Default: 36 (= 3 min total)
};
```

## Filters

```typescript
import { FilterOperator } from '@cloudglue/cloudglue-js';

interface Filter {
  metadata?: Array<{
    path: string;
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

enum FilterOperator {
  NotEqual = 'NotEqual',
  Equal = 'Equal',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  ContainsAny = 'ContainsAny',
  ContainsAll = 'ContainsAll',
  In = 'In',
  Like = 'Like',
}
```

## Modalities

```typescript
type Modalities =
  | 'speech'
  | 'visual_scene_description'
  | 'scene_text'
  | 'audio_description'
  | 'summary'
  | 'segment_summary'
  | 'title';
```

## Segmentation Config

```typescript
// Simplified — see src/types.ts for full type-specific fields
type SegmentationConfig =
  | { type: 'uniform'; segment_duration?: number }
  | { type: 'shot_detector' }
  | { type: 'narrative' };
```

## Thumbnail Types

```typescript
type ThumbnailType = 'segment' | 'keyframe' | 'file' | 'frame';
```

## Knowledge Base (Responses API & Deep Search)

```typescript
// Collection-based
type ResponseKnowledgeBaseCollections = {
  source?: 'collections';
  type?: 'general_question_answering' | 'entity_backed_knowledge';
  collections: string[];
  filter?: SearchFilter;  // SearchFilter is from generated/common.ts; Filter (from src/types.ts) is used for list/search queries
  entity_backed_knowledge_config?: {
    description?: string;
    entity_collections: Array<{
      name: string;
      description: string;
      collection_id: string;
    }>;
  };
};

// File-based
type ResponseKnowledgeBaseFiles = {
  source: 'files';
  files: string[];
};

// Default index
type ResponseKnowledgeBaseDefault = {
  source: 'default';
};
```

## Response Stream Events

```typescript
type ResponseStreamEventType =
  | ResponseCreatedEvent
  | ResponseOutputItemAddedEvent
  | ResponseContentPartAddedEvent
  | ResponseOutputTextDeltaEvent      // { type, delta: string }
  | ResponseOutputTextDoneEvent       // { type, text: string }
  | ResponseContentPartDoneEvent
  | ResponseOutputItemDoneEvent
  | ResponseCompletedEvent
  | ResponseErrorEvent;
```

## Deep Search Stream Events

```typescript
type DeepSearchStreamEventType =
  | DeepSearchCreatedEvent
  | DeepSearchTextDeltaEvent         // { type, delta: string }
  | DeepSearchTextDoneEvent          // { type, text: string }
  | DeepSearchResultAddedEvent       // { type, result: ... }
  | DeepSearchCompletedEvent
  | DeepSearchErrorEvent;
```

## Common Response Types

All available via `import type { ... } from '@cloudglue/cloudglue-js'`:

- `Collection`, `CollectionFile`, `CollectionFileList`
- `ChatMessage`, `ChatCompletionResponse`
- `SearchRequest`, `SearchResponse`, `FileSearchResult`, `SegmentSearchResult`
- `Describe`, `DescribeList`
- `EntitySegment`, `CollectionVideoEntities`
- `DataConnector`, `DataConnectorList`
- `ShareableAsset`
- `CloudglueError`
