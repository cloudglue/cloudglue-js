import type { z } from 'zod';

// Import schemas from generated files
import { ListVideoTagsResponse, VideoTag } from '../generated/common';
import { schemas as collectionsSchemas } from '../generated/Collections';
import { schemas as chatSchemas } from '../generated/Chat';
import { schemas as transcribeSchemas } from '../generated/Transcribe';
import { schemas as extractSchemas } from '../generated/Extract';
import { schemas as searchSchemas } from '../generated/Search';
import { schemas as describeSchemas } from '../generated/Describe';
import { schemas as segmentsSchemas } from '../generated/Segments';
import {
  SegmentationUniformConfig as SegmentationUniformConfigType,
  SegmentationShotDetectorConfig as SegmentationShotDetectorConfigType,
  SegmentationConfig as SegmentationConfigType,
  NarrativeConfig as NarrativeConfigType,
  Chapter as ChapterType,
  Describe as DescribeType,
  DescribeList as DescribeListType,
  WordTimestamp as WordTimestampType,
  SpeechOutputPart as SpeechOutputPartType,
} from '../generated/common';
import { schemas as webhooksSchemas } from '../generated/Webhooks';
import { FrameExtraction } from '../generated/common';
import { schemas as faceDetectionSchemas } from '../generated/Face_Detection';
import { schemas as faceMatchSchemas } from '../generated/Face_Match';
import { FilterOperator } from './enums';
import { schemas as tagsSchemas } from '../generated/Tags';
import { schemas as shareableSchemas } from '../generated/Share';
import { schemas as dataConnectorsSchemas } from '../generated/Data_Connectors';
import { schemas as deepSearchSchemas } from '../generated/Deep_Search';
import { schemas as querySchemas } from '../generated/Query';
import { schemas as bulkImportsSchemas } from '../generated/Bulk_Imports';
import { schemas as findMomentsSchemas } from '../generated/Find_Moments';
import { schemas as collectionsMomentSchemas } from '../generated/Collections';
import { schemas as sitesSchemas } from '../generated/Sites';

/**
 * Represents a video file in the Cloudglue system
 * Contains metadata about the file including its status, size, and video information
 */
export type { File } from '../generated/common';

/**
 * Represents the status of a job
 * TODO: would be better to use a common type for all jobs
 */
export type JobStatus = z.infer<typeof transcribeSchemas.Transcribe>['status'];

/**
 * Parameters for updating an existing file
 */
export interface UpdateFileParams {
  filename?: string;
  metadata?: Record<string, any>;
  // Index signature allows additional properties to match the generated schema's .passthrough() behavior
  // [key: string]: any;
}

/**
 * Parameters for creating a new collection
 */
export type NewCollectionParams = z.infer<
  typeof collectionsSchemas.NewCollection
>;

/**
 * Represents a collection of videos
 * Contains metadata about the collection and its configuration
 */
export type Collection = z.infer<typeof collectionsSchemas.Collection>;

/**
 * Represents a video file within a collection
 * Contains metadata about the file and its processing status within the collection
 */
export type CollectionFile = z.infer<typeof collectionsSchemas.CollectionFile>;

/**
 * Represents a paginated list of files within a collection
 */
export type CollectionFileList = z.infer<
  typeof collectionsSchemas.CollectionFileList
>;

/**
 * Represents a segment of video with extracted entities
 * This is inferred from the FileEntities schema's segment_entities array type
 */
export type EntitySegment = NonNullable<
  z.infer<typeof collectionsSchemas.FileEntities>['segment_entities']
>[number];

/**
 * Represents the full entities response for a video in a collection
 */
export type CollectionVideoEntities = z.infer<
  typeof collectionsSchemas.FileEntities
>;

/**
 * Represents a message in a chat conversation
 * Used for interacting with videos through natural language
 */
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
};

/**
 * Represents the response from a chat completion request
 * Contains the model's response and any relevant citations from videos
 */
export type ChatCompletionResponse = z.infer<
  typeof chatSchemas.ChatCompletionResponse
>;

/**
 * Represents the result of a video transcription request
 * Contains detailed information about the video content including speech, text, and visual descriptions
 */
export type Transcribe = z.infer<typeof transcribeSchemas.Transcribe>;

/**
 * Represents a list of transcription jobs
 */
export type TranscribeList = z.infer<typeof transcribeSchemas.TranscribeList>;

/**
 * Represents the result of a video information extraction request
 * Contains structured data extracted from the video
 */
export type Extract = z.infer<typeof extractSchemas.Extract>;

/**
 * Represents a list of extraction jobs
 */
export type ExtractList = z.infer<typeof extractSchemas.ExtractList>;

/**
 * Represents a rich transcript for a video
 */
export type RichTranscript = z.infer<typeof collectionsSchemas.RichTranscript>;

/**
 * Represents a list of entities for files in a collection
 */
export type CollectionEntitiesList = z.infer<
  typeof collectionsSchemas.CollectionEntitiesList
>;

/**
 * Represents a list of rich transcripts for files in a collection
 */
export type CollectionRichTranscriptsList = z.infer<
  typeof collectionsSchemas.CollectionRichTranscriptsList
>;

/**
 * Segmentation config for the Uniform strategy
 */
export type SegmentationUniformConfig = z.infer<
  typeof SegmentationUniformConfigType
>;

/**
 * Segmentation config for the Shot Detector strategy
 */
export type SegmentationShotDetectorConfig = z.infer<
  typeof SegmentationShotDetectorConfigType
>;
export type SegmentationConfig = z.infer<typeof SegmentationConfigType>;

/**
 * Represents a search request for finding videos or video segments
 */
export type SearchRequest = z.infer<typeof searchSchemas.SearchRequest>;

/**
 * Represents the response from a search request
 * Contains search results with file or segment matches
 */
export type SearchResponse = z.infer<typeof searchSchemas.SearchResponse>;

/**
 * Represents a file-level search result
 */
export type FileSearchResult = z.infer<typeof searchSchemas.FileSearchResult>;

/**
 * Represents a segment-level search result
 */
export type SegmentSearchResult = z.infer<
  typeof searchSchemas.SegmentSearchResult
>;

/**
 * Represents a face-level search result
 */
export type FaceSearchResult = z.infer<typeof searchSchemas.FaceSearchResult>;

/**
 * Represents a moment-level search result (scope='moment'): the full moment
 * record plus provenance and a query-relevance search_score
 */
export type MomentSearchResult = z.infer<
  typeof searchSchemas.MomentSearchResult
>;

/**
 * Represents a grouped segment search result
 */
export type SegmentGroupResult = z.infer<
  typeof searchSchemas.SegmentGroupResult
>;

/**
 * Represents a grouped face search result
 */
export type FaceGroupResult = z.infer<typeof searchSchemas.FaceGroupResult>;

/**
 * Represents search filter criteria for filtering results
 */
export type SearchFilterCriteria = z.infer<typeof searchSchemas.SearchRequest>;

/**
 * Represents search filter options for metadata, video info, and file properties
 */
export type SearchFilter = z.infer<
  typeof searchSchemas.SearchRequest
>['filter'];

/**
 * Represents the result of a video description request
 * Contains detailed information about the video content including speech, text, and visual descriptions
 */
export type Describe = z.infer<typeof DescribeType>;

/**
 * Represents a list of description jobs
 */
export type DescribeList = z.infer<typeof DescribeListType>;

/**
 * Represents media description data for a video in a collection
 */
export type CollectionMediaDescription = z.infer<
  typeof collectionsSchemas.MediaDescription
>;

/**
 * Represents a list of media descriptions for files in a collection
 */
export type CollectionMediaDescriptionsList = z.infer<
  typeof collectionsSchemas.CollectionMediaDescriptionsList
>;

/**
 * Represents face detections for a file in a collection
 */
export type FileFaceDetections = z.infer<
  typeof collectionsSchemas.FileFaceDetections
>;

export type NarrativeConfig = z.infer<typeof NarrativeConfigType>;

/**
 * Represents a chapter within a narrative segmentation
 * Contains timing and description information for the chapter
 */
export type Chapter = z.infer<typeof ChapterType>;

export type ShotConfig = z.infer<typeof segmentsSchemas.ShotConfig>;

/**
 * Represents word-level timestamp data within a speech segment
 */
export type WordTimestamp = z.infer<typeof WordTimestampType>;

/**
 * Represents a speech output part with optional word-level timestamps
 */
export type SpeechOutputPart = z.infer<typeof SpeechOutputPartType>;

export type WebhookEvents = z.infer<(typeof webhooksSchemas)['WebhookEvents']>;

/**
 * Represents a frame extraction job
 */
export type { FrameExtraction };

/**
 * Configuration for frame extraction
 */
export type {
  FrameExtractionConfig,
  FrameExtractionUniformConfig,
  FrameExtractionThumbnailsConfig,
} from '../generated/common';

/**
 * Represents a face detection job
 */
export type FaceDetection = z.infer<typeof faceDetectionSchemas.FaceDetection>;

/**
 * Represents a face detection request
 */
export type FaceDetectionRequest = z.infer<
  typeof faceDetectionSchemas.FaceDetectionRequest
>;

/**
 * Represents a detected face
 */
export type DetectedFace = z.infer<typeof faceDetectionSchemas.DetectedFace>;

/**
 * Represents a face match job
 */
export type FaceMatch = z.infer<typeof faceMatchSchemas.FaceMatch>;

/**
 * Represents a face match request
 */
export type FaceMatchRequest = z.infer<
  typeof faceMatchSchemas.FaceMatchRequest
>;

/**
 * Represents a face match result
 */
export type FaceMatchResult = z.infer<typeof faceMatchSchemas.FaceMatchResult>;

/**
 * Represents a source image for face matching
 */
export type SourceImage = z.infer<typeof faceMatchSchemas.SourceImage>;

/**
 * Enhanced source image type that supports local file paths
 */
export type EnhancedSourceImage = {
  url?: string;
  base64_image?: string;
  file_path?: string;
};

/**
 * Configuration options for initializing the Cloudglue client
 */
export interface CloudglueConfig {
  // Cloudglue API Key
  apiKey?: string;
  baseUrl?: string;
  /**
   * Time limit in milliseconds before we timeout a request
   */
  timeout?: number;
}

// Filter type for reusable filtering across different APIs
export interface Filter {
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

export interface ListFilesParams {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  limit?: number;
  offset?: number;
  order?: 'created_at' | 'filename';
  sort?: 'asc' | 'desc';
  created_before?: string;
  created_after?: string;
  filter?: Filter;
}
export type DefaultSegmentationConfig = z.infer<
  typeof collectionsSchemas.DefaultSegmentationConfig
>;

export type WaitForReadyOptions = {
  /** Interval in milliseconds between polling attempts. Defaults to 5000ms (5 seconds). */
  pollingInterval?: number;
  /** Maximum number of polling attempts before giving up. Defaults to 36 (3 minutes total with default interval). */
  maxAttempts?: number;
};

export type ThumbnailType = 'segment' | 'keyframe' | 'file' | 'frame';

export type CreateVideoTagParams = z.infer<
  typeof tagsSchemas.CreateVideoTagRequest
>;
export type UpdateVideoTagParams = z.infer<
  typeof tagsSchemas.UpdateVideoTagRequest
>;

export type { ListVideoTagsResponse, VideoTag };

export type ShareableAsset = z.infer<typeof shareableSchemas.ShareableAsset>;
export type ShareableAssetListResponse = z.infer<
  typeof shareableSchemas.ShareableAssetListResponse
>;
export type CreateShareableAssetRequest = z.infer<
  typeof shareableSchemas.CreateShareableAssetRequest
>;
export type UpdateShareableAssetRequest = z.infer<
  typeof shareableSchemas.UpdateShareableAssetRequest
>;

export type Modalities = 'speech' | 'visual_scene_description' | 'scene_text' | 'audio_description' | 'summary' | 'segment_summary' | 'title';

/**
 * Represents a data connector configured for the account
 */
export type DataConnector = z.infer<typeof dataConnectorsSchemas.DataConnector>;

/**
 * Represents a paginated list of data connectors
 */
export type DataConnectorList = z.infer<
  typeof dataConnectorsSchemas.DataConnectorList
>;

/**
 * Represents a file available in a connected data source
 */
export type DataConnectorFile = z.infer<
  typeof dataConnectorsSchemas.DataConnectorFile
>;

/**
 * Represents a paginated list of data connector files
 */
export type DataConnectorFileList = z.infer<
  typeof dataConnectorsSchemas.DataConnectorFileList
>;

/**
 * Provider-populated source metadata attached to files synced through a data
 * connector (`file.source_metadata`) and returned by
 * `dataConnectors.getSourceMetadata()`. Discriminated union on `source_type`
 * covering all seven metadata-bearing connectors.
 */
export type {
  SourceMetadata,
  GrainSourceMetadata,
  ZoomSourceMetadata,
  RecallSourceMetadata,
  GoogleDriveSourceMetadata,
  DropboxSourceMetadata,
  GongSourceMetadata,
  IconikSourceMetadata,
} from '../generated/common';

/**
 * Response envelope for dataConnectors.getSourceMetadata()
 */
export type SourceMetadataResponse = z.infer<
  typeof dataConnectorsSchemas.SourceMetadataResponse
>;

// Response API types
import { schemas as responseSchemas } from '../generated/Response';

/**
 * Represents a Response API response object
 */
export type Response = z.infer<typeof responseSchemas.Response>;

/**
 * Represents a list of Response API responses
 */
export type ResponseList = z.infer<typeof responseSchemas.ResponseList>;

/**
 * Represents a Response API list item (without full output data)
 */
export type ResponseListItem = z.infer<typeof responseSchemas.ResponseListItem>;

/**
 * Represents a Response API input message
 */
export type ResponseInputMessage = z.infer<
  typeof responseSchemas.ResponseInputMessage
>;

/**
 * Represents a Response API output message
 */
export type ResponseOutputMessage = z.infer<
  typeof responseSchemas.ResponseOutputMessage
>;

/**
 * Represents a Response API function-call output item (type 'function_call')
 */
export type ResponseFunctionCall = z.infer<
  typeof responseSchemas.ResponseFunctionCall
>;

/**
 * Represents a Response API query-call output item
 * (type 'cloudglue_query_call') — a SQL query the model ran against the
 * knowledge base's entity collections, with row counts and truncation state
 */
export type ResponseQueryCall = z.infer<
  typeof responseSchemas.ResponseQueryCall
>;

/**
 * Represents a citation annotation in a Response API response
 */
export type ResponseAnnotation = z.infer<
  typeof responseSchemas.ResponseAnnotation
>;

/**
 * Represents usage information for a Response API response
 */
export type ResponseUsage = z.infer<typeof responseSchemas.ResponseUsage>;

/**
 * Represents knowledge base configuration for the Response API
 */
export type ResponseKnowledgeBase = z.infer<
  typeof responseSchemas.ResponseKnowledgeBase
>;

/**
 * Represents a collections-based knowledge base for the Response API
 */
export type KnowledgeBaseCollections = z.infer<
  typeof responseSchemas.KnowledgeBaseCollections
>;

/**
 * Represents a files-based knowledge base for the Response API
 */
export type KnowledgeBaseFiles = z.infer<
  typeof responseSchemas.KnowledgeBaseFiles
>;

/**
 * Represents a default index knowledge base for the Response API
 */
export type KnowledgeBaseDefault = z.infer<
  typeof responseSchemas.KnowledgeBaseDefault
>;

/**
 * Represents a tool definition for the Response API
 */
export type ResponseToolDefinition = z.infer<
  typeof responseSchemas.ResponseToolDefinition
>;

/**
 * Represents an entity collection configuration for entity-backed knowledge
 */
export type EntityCollectionConfig = z.infer<
  typeof responseSchemas.EntityCollectionConfig
>;

/**
 * Represents the entity-backed knowledge configuration
 */
export type EntityBackedKnowledgeConfig = z.infer<
  typeof responseSchemas.EntityBackedKnowledgeConfig
>;

// Re-export streaming event types and params from the response API wrapper
export type {
  CreateResponseParams,
  ListResponsesParams,
  ResponseKnowledgeBaseCollections,
  ResponseKnowledgeBaseFiles,
  ResponseKnowledgeBaseDefault,
  ResponseKnowledgeBaseParam,
  ResponseCreatedEvent,
  ResponseOutputItemAddedEvent,
  ResponseContentPartAddedEvent,
  ResponseOutputTextDeltaEvent,
  ResponseOutputTextDoneEvent,
  ResponseContentPartDoneEvent,
  ResponseOutputItemDoneEvent,
  ResponseCompletedEvent,
  ResponseErrorEvent,
  ResponseStreamEventType,
} from './api/response.api';

// Deep Search types
/**
 * Represents a deep search object
 */
export type DeepSearch = z.infer<typeof deepSearchSchemas.DeepSearch>;

/**
 * Represents a deep search result
 */
export type DeepSearchResult = z.infer<typeof deepSearchSchemas.DeepSearchResult>;

/**
 * Represents a deep search usage summary
 */
export type DeepSearchUsage = z.infer<typeof deepSearchSchemas.DeepSearchUsage>;

/**
 * Represents a paginated list of deep searches
 */
export type DeepSearchList = z.infer<typeof deepSearchSchemas.DeepSearchList>;

/**
 * Represents a deep search list item
 */
export type DeepSearchListItem = z.infer<typeof deepSearchSchemas.DeepSearchListItem>;

// Re-export Deep Search streaming event types and params from the deep-search API wrapper
export type {
  CreateDeepSearchParams,
  ListDeepSearchesParams,
  DeepSearchKnowledgeBase,
  DeepSearchCreatedEvent,
  DeepSearchTextDeltaEvent,
  DeepSearchTextDoneEvent,
  DeepSearchResultAddedEvent,
  DeepSearchCompletedEvent,
  DeepSearchErrorEvent,
  DeepSearchStreamEventType,
} from './api/deep-search.api';

// Re-export Data Connector file browsing params
export type { ListDataConnectorFilesParams } from './api/data-connectors.api';

/**
 * Parameters for running a SQL or natural-language query over collections
 */
export type RunQueryRequest = z.infer<typeof querySchemas.RunQueryRequest>;

/**
 * Represents a query run, including inline result rows or export state
 */
export type QueryResult = z.infer<typeof querySchemas.QueryResult>;

/**
 * Represents a query run list item (columns/rows omitted)
 */
export type QueryListItem = z.infer<typeof querySchemas.QueryListItem>;

/**
 * Represents a paginated list of query runs
 */
export type QueryListResponse = z.infer<typeof querySchemas.QueryListResponse>;

/**
 * Represents the queryable virtual schema for a set of collections
 */
export type QuerySchema = z.infer<typeof querySchemas.QuerySchema>;

/**
 * Represents credit usage for a query run
 */
export type QueryUsage = z.infer<typeof querySchemas.QueryUsage>;

/**
 * Represents a bulk metadata import definition, with its latest run inline
 */
export type MetadataImport = z.infer<
  typeof bulkImportsSchemas.MetadataImport
>;

/**
 * Represents a metadata import definition with one page of its run history
 */
export type MetadataImportDetail = z.infer<
  typeof bulkImportsSchemas.MetadataImportDetail
>;

/**
 * Represents a paginated list of a collection's metadata imports
 */
export type MetadataImportList = z.infer<
  typeof bulkImportsSchemas.MetadataImportList
>;

/**
 * Represents a single run of a metadata import
 */
export type MetadataImportRun = z.infer<
  typeof bulkImportsSchemas.MetadataImportRun
>;

/**
 * Represents progress counters for a metadata import run
 */
export type MetadataImportRunProgress = z.infer<
  typeof bulkImportsSchemas.MetadataImportRunProgress
>;

/**
 * Represents one listing pass of a metadata import (date window, title
 * search, and connector-specific narrowing)
 */
export type MetadataImportFilterSet = z.infer<
  typeof bulkImportsSchemas.MetadataImportFilterSet
>;

/**
 * Parameters for creating a metadata import definition
 */
export type CreateMetadataImportParams = z.infer<
  typeof bulkImportsSchemas.CreateMetadataImportRequest
>;

/**
 * Per-run overrides when triggering a metadata import run
 */
export type CreateMetadataImportRunParams = z.infer<
  typeof bulkImportsSchemas.CreateMetadataImportRunRequest
>;


/**
 * Moment-related record types, re-exported from the generated common
 * module (which `generated/index.ts` does not re-export):
 *
 * - `Moment` — a scored, bounded span discovered inside a video
 * - `MomentFinding` — the non-temporal counterpart, emitted when the
 *   criterion declares a `finding_schema`
 * - `MomentCriterion` — the inline rubric plus its typed output declarations
 * - `CriterionScore` — the rubric's judgment on its own declared scale
 * - `MomentSchemaDefinition` — the validated JSON Schema subset used by
 *   `moment_schema` / `finding_schema`
 */
export type {
  Moment,
  MomentFinding,
  MomentCriterion,
  CriterionScore,
  MomentSchemaDefinition,
} from '../generated/common';

/**
 * Represents a find-moments run, including its moments and findings when
 * completed
 */
export type FindMoments = z.infer<typeof findMomentsSchemas.FindMoments>;

/**
 * Parameters for starting a find-moments run (source url + inline criterion)
 */
export type NewFindMomentsParams = z.infer<
  typeof findMomentsSchemas.NewFindMoments
>;

/**
 * Represents a paginated list of find-moments runs
 */
export type FindMomentsList = z.infer<typeof findMomentsSchemas.FindMomentsList>;

/**
 * Represents the result of deleting a find-moments run
 */
export type DeleteFindMomentsResult = z.infer<
  typeof findMomentsSchemas.DeleteFindMomentsResult
>;

/**
 * Represents a criterion attached to a moments collection, with its
 * backfill progress
 */
export type MomentCriterionAttachment = z.infer<
  typeof collectionsMomentSchemas.MomentCriterionAttachment
>;

/**
 * Parameters for attaching a criterion to a moments collection
 */
export type NewMomentCriterionAttachment = z.infer<
  typeof collectionsMomentSchemas.NewMomentCriterionAttachment
>;

/**
 * Represents a moments collection's criteria configuration
 */
export type MomentsConfig = z.infer<
  typeof collectionsMomentSchemas.MomentsConfig
>;

/**
 * Represents a paginated list of moments across a collection's members
 */
export type CollectionMomentsList = z.infer<
  typeof collectionsMomentSchemas.CollectionMomentsList
>;

/**
 * Represents a paginated list of findings across a collection's members
 */
export type CollectionMomentFindingsList = z.infer<
  typeof collectionsMomentSchemas.CollectionMomentFindingsList
>;

/**
 * One registered (site, route) unfurl preview on a published site, as
 * stored: canonical route, card overrides, hero share, and optional clip
 * window
 */
export type SiteRoutePreview = z.infer<typeof sitesSchemas.SiteRoutePreview>;

/**
 * One entry of a route-previews replace call: a route plus its preview
 * card, hero share, and optional clip window
 */
export type SiteRoutePreviewInput = z.infer<
  typeof sitesSchemas.SiteRoutePreviewInput
>;

/**
 * Represents a site's complete set of per-route unfurl previews
 */
export type SiteRoutePreviewList = z.infer<
  typeof sitesSchemas.SiteRoutePreviewList
>;
