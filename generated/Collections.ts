import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { MomentCriterion } from './common';
import { MomentSchemaDefinition } from './common';
import { SegmentationConfig } from './common';
import { SegmentationUniformConfig } from './common';
import { SegmentationShotDetectorConfig } from './common';
import { SegmentationManualConfig } from './common';
import { NarrativeConfig } from './common';
import { KeyframeConfig } from './common';
import { ThumbnailsConfig } from './common';
import { File } from './common';
import { SourceMetadata } from './common';
import { GrainSourceMetadata } from './common';
import { ZoomSourceMetadata } from './common';
import { RecallSourceMetadata } from './common';
import { GoogleDriveSourceMetadata } from './common';
import { DropboxSourceMetadata } from './common';
import { GongSourceMetadata } from './common';
import { IconikSourceMetadata } from './common';
import { DescribeOutput } from './common';
import { DescribeOutputPart } from './common';
import { SpeechOutputPart } from './common';
import { WordTimestamp } from './common';
import { FileSegmentationConfig } from './common';
import { Moment } from './common';
import { CriterionScore } from './common';
import { MomentFinding } from './common';

type Collection = {
  id: string;
  object: 'collection';
  name: string;
  description?: (string | null) | undefined;
  collection_type:
    | 'media-descriptions'
    | 'entities'
    | 'rich-transcripts'
    | 'face-analysis'
    | 'metadata'
    | 'moments';
  moments_config?:
    | Partial<{
        criteria: Array<MomentCriterionAttachment>;
      }>
    | undefined;
  extract_config?:
    | Partial<{
        prompt: string;
        schema: {};
        enable_video_level_entities: boolean;
        enable_segment_level_entities: boolean;
        enable_transcript_mode: boolean;
        enable_metadata_mode: boolean;
      }>
    | undefined;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  describe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  default_segmentation_config?: SegmentationConfig | undefined;
  default_thumbnails_config?: ThumbnailsConfig | undefined;
  face_detection_config?:
    | Partial<{
        frame_extraction_config: {
          strategy: 'uniform';
          uniform_config?:
            | Partial<{
                frames_per_second: number;
                max_width: number;
              }>
            | undefined;
        };
        thumbnails_config: Partial<{
          enable_frame_thumbnails: boolean;
        }>;
      }>
    | null
    | undefined;
  created_at: number;
  file_count: number;
};
type NewCollection = {
  collection_type:
    | 'media-descriptions'
    | 'entities'
    | 'rich-transcripts'
    | 'face-analysis'
    | 'metadata'
    | 'moments';
  moments_config?: MomentsConfig | undefined;
  name: string;
  description?: (string | null) | undefined;
  describe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  extract_config?:
    | Partial<{
        prompt: string;
        schema: {};
        enable_video_level_entities: boolean;
        enable_segment_level_entities: boolean;
        enable_transcript_mode: boolean;
        enable_metadata_mode: boolean;
      }>
    | undefined;
  transcribe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_scene_text: boolean;
        enable_visual_scene_description: boolean;
        enable_audio_description: boolean;
      }>
    | undefined;
  default_segmentation_config?: DefaultSegmentationConfig | undefined;
  default_thumbnails_config?: ThumbnailsConfig | undefined;
  face_detection_config?:
    | Partial<{
        frame_extraction_config: {
          strategy: 'uniform';
          uniform_config?:
            | Partial<{
                frames_per_second: number;
                max_width: number;
              }>
            | undefined;
        };
        thumbnails_config: Partial<{
          enable_frame_thumbnails: boolean;
        }>;
      }>
    | undefined;
};
type MomentCriterionAttachment = {
  attachment_id: string;
  criterion_name: string;
  criterion_hash: string;
  criterion?: MomentCriterion | undefined;
  options?:
    | Partial<{
        signals_required: Array<string>;
        boundary_policy: 'sentence' | 'tight' | 'loose';
        speaker_filter: {};
        min_duration_seconds: number;
        max_duration_seconds: number;
      }>
    | undefined;
  backfill_status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'completed_with_failures';
  files_total?: number | undefined;
  files_completed?: number | undefined;
  files_failed?: number | undefined;
  created_at?: number | undefined;
};
type MomentsConfig = {
  criteria: Array<NewMomentCriterionAttachment>;
};
type NewMomentCriterionAttachment = {
  criterion: MomentCriterion;
  signals_required?:
    | Array<
        | 'speech'
        | 'visual_scene_description'
        | 'scene_text'
        | 'audio_description'
      >
    | undefined;
  boundary_policy?: ('sentence' | 'tight' | 'loose') | undefined;
  speaker_filter?:
    | Partial<{
        include: Array<string>;
        exclude: Array<string>;
        match: 'any' | 'all';
      }>
    | undefined;
  min_duration_seconds?: number | undefined;
  max_duration_seconds?: number | undefined;
};
type DefaultSegmentationConfig = {
  strategy: 'uniform' | 'shot-detector' | 'narrative';
  uniform_config?: SegmentationUniformConfig | undefined;
  shot_detector_config?: SegmentationShotDetectorConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
  keyframe_config?: KeyframeConfig | undefined;
  start_time_seconds?: number | undefined;
  end_time_seconds?: number | undefined;
};
type CollectionList = {
  object: 'list';
  data: Array<Collection>;
  total: number;
  limit: number;
  offset: number;
};
type CollectionFileList = {
  object: 'list';
  data: Array<CollectionFile>;
  total: number;
  limit: number;
  offset: number;
};
type CollectionFile = {
  collection_id: string;
  file_id: string;
  object: 'collection_file';
  added_at: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  searchable_status?:
    | ('pending' | 'processing' | 'completed' | 'failed')
    | undefined;
  file?: File | undefined;
  segmentation?:
    | {
        id: string;
        status:
          | 'pending'
          | 'processing'
          | 'completed'
          | 'failed'
          | 'not_applicable';
        file_id: string;
        segmentation_config: SegmentationConfig;
      }
    | undefined;
};
type RichTranscript = {
  collection_id: string;
  file_id: string;
  content?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  duration_seconds?: number | undefined;
  segment_summary?:
    | Array<
        Partial<{
          title: string;
          summary: string;
          start_time: number;
          end_time: number;
        }>
      >
    | undefined;
  file?: File | undefined;
} & DescribeOutput;
type CollectionRichTranscriptsList = {
  object: 'list';
  data: Array<{
    file_id: string;
    duration_seconds?: number | undefined;
    data: Partial<{
      content: string;
      title: string;
      summary: string;
      segment_summary: Array<
        Partial<{
          title: string;
          summary: string;
          start_time: number;
          end_time: number;
        }>
      >;
    }> &
      DescribeOutput;
    file?: File | undefined;
  }>;
  total: number;
  limit: number;
  offset: number;
};
type CollectionMediaDescriptionsList = {
  object: 'list';
  data: Array<{
    file_id: string;
    added_at: number;
    object: 'collection_file';
    duration_seconds?: number | undefined;
    data: Partial<{
      content: string;
      title: string;
      summary: string;
      segment_summary: Array<
        Partial<{
          title: string;
          summary: string;
          start_time: number;
          end_time: number;
        }>
      >;
    }> &
      DescribeOutput;
    file?: File | undefined;
  }>;
  total: number;
  limit: number;
  offset: number;
};
type MediaDescription = {
  collection_id: string;
  file_id: string;
  thumbnail_url?: string | undefined;
  content?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  duration_seconds?: number | undefined;
  segment_summary?:
    | Array<
        Partial<{
          title: string;
          summary: string;
          start_time: number;
          end_time: number;
          thumbnail_url: string;
        }>
      >
    | undefined;
  chapters?:
    | Array<{
        index: number;
        start_time: number;
        end_time: number;
        description: string;
      }>
    | undefined;
  shots?:
    | Array<{
        index: number;
        start_time: number;
        end_time: number;
      }>
    | undefined;
  total_chapters?: number | undefined;
  total_shots?: number | undefined;
  file?: File | undefined;
} & DescribeOutput;
type AddCollectionFile = (
  | {
      file_id: string;
    }
  | {
      url: string;
    }
) &
  FileSegmentationConfig &
  Partial<{
    thumbnails_config: ThumbnailsConfig;
    metadata: {};
  }>;
type CollectionMomentsList = {
  moments: Array<
    Moment & {
      file_id: string;
      job_id: string;
      criterion_name: string;
    }
  >;
  total: number;
  next_cursor?: string | undefined;
};
type CollectionMomentFindingsList = {
  findings: Array<
    MomentFinding & {
      file_id: string;
      job_id: string;
      criterion_name: string;
    }
  >;
  total: number;
  next_cursor?: string | undefined;
};

const MomentCriterionAttachment: z.ZodType<MomentCriterionAttachment> = z
  .object({
    attachment_id: z.string().uuid(),
    criterion_name: z.string(),
    criterion_hash: z.string(),
    criterion: MomentCriterion.optional(),
    options: z
      .object({
        signals_required: z.array(z.string()),
        boundary_policy: z.enum(['sentence', 'tight', 'loose']),
        speaker_filter: z.object({}).partial().strict().passthrough(),
        min_duration_seconds: z.number(),
        max_duration_seconds: z.number(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    backfill_status: z.enum([
      'pending',
      'processing',
      'completed',
      'completed_with_failures',
    ]),
    files_total: z.number().int().optional(),
    files_completed: z.number().int().optional(),
    files_failed: z.number().int().optional(),
    created_at: z.number().int().optional(),
  })
  .strict()
  .passthrough();
const Collection: z.ZodType<Collection> = z
  .object({
    id: z.string(),
    object: z.literal('collection'),
    name: z.string(),
    description: z.string().nullish(),
    collection_type: z.enum([
      'media-descriptions',
      'entities',
      'rich-transcripts',
      'face-analysis',
      'metadata',
      'moments',
    ]),
    moments_config: z
      .object({ criteria: z.array(MomentCriterionAttachment) })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
        enable_video_level_entities: z.boolean(),
        enable_segment_level_entities: z.boolean(),
        enable_transcript_mode: z.boolean(),
        enable_metadata_mode: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    transcribe_config: z
      .object({
        enable_summary: z.boolean(),
        enable_speech: z.boolean(),
        enable_scene_text: z.boolean(),
        enable_visual_scene_description: z.boolean(),
        enable_audio_description: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    describe_config: z
      .object({
        enable_summary: z.boolean(),
        enable_speech: z.boolean(),
        enable_scene_text: z.boolean(),
        enable_visual_scene_description: z.boolean(),
        enable_audio_description: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    default_segmentation_config: SegmentationConfig.optional(),
    default_thumbnails_config: ThumbnailsConfig.optional(),
    face_detection_config: z
      .object({
        frame_extraction_config: z
          .object({
            strategy: z.literal('uniform'),
            uniform_config: z
              .object({
                frames_per_second: z.number().gte(0.1).lte(30),
                max_width: z.number().gte(64).lte(4096),
              })
              .partial()
              .strict()
              .passthrough()
              .optional(),
          })
          .strict()
          .passthrough(),
        thumbnails_config: z
          .object({ enable_frame_thumbnails: z.boolean() })
          .partial()
          .strict()
          .passthrough(),
      })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
    created_at: z.number().int(),
    file_count: z.number().int(),
  })
  .strict()
  .passthrough();
const NewMomentCriterionAttachment: z.ZodType<NewMomentCriterionAttachment> = z
  .object({
    criterion: MomentCriterion,
    signals_required: z
      .array(
        z.enum([
          'speech',
          'visual_scene_description',
          'scene_text',
          'audio_description',
        ])
      )
      .min(1)
      .optional()
      .optional(),
    boundary_policy: z
      .enum(['sentence', 'tight', 'loose'])
      .optional()
      .optional(),
    speaker_filter: z
      .object({
        include: z.array(z.string()),
        exclude: z.array(z.string()),
        match: z.enum(['any', 'all']),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    min_duration_seconds: z.number().gt(0).optional(),
    max_duration_seconds: z.number().gt(0).optional(),
  })
  .strict();
const MomentsConfig: z.ZodType<MomentsConfig> = z
  .object({ criteria: z.array(NewMomentCriterionAttachment).min(1) })
  .strict()
  .passthrough();
const DefaultSegmentationConfig: z.ZodType<DefaultSegmentationConfig> = z
  .object({
    strategy: z.enum(['uniform', 'shot-detector', 'narrative']),
    uniform_config: SegmentationUniformConfig.optional(),
    shot_detector_config: SegmentationShotDetectorConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
    keyframe_config: KeyframeConfig.optional(),
    start_time_seconds: z.number().gte(0).optional(),
    end_time_seconds: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
const NewCollection: z.ZodType<NewCollection> = z
  .object({
    collection_type: z.enum([
      'media-descriptions',
      'entities',
      'rich-transcripts',
      'face-analysis',
      'metadata',
      'moments',
    ]),
    moments_config: MomentsConfig.optional(),
    name: z.string(),
    description: z.string().nullish(),
    describe_config: z
      .object({
        enable_summary: z.boolean(),
        enable_speech: z.boolean(),
        enable_scene_text: z.boolean(),
        enable_visual_scene_description: z.boolean(),
        enable_audio_description: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    extract_config: z
      .object({
        prompt: z.string(),
        schema: z.object({}).partial().strict().passthrough(),
        enable_video_level_entities: z.boolean(),
        enable_segment_level_entities: z.boolean(),
        enable_transcript_mode: z.boolean(),
        enable_metadata_mode: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    transcribe_config: z
      .object({
        enable_summary: z.boolean(),
        enable_speech: z.boolean(),
        enable_scene_text: z.boolean(),
        enable_visual_scene_description: z.boolean(),
        enable_audio_description: z.boolean(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    default_segmentation_config: DefaultSegmentationConfig.optional(),
    default_thumbnails_config: ThumbnailsConfig.optional(),
    face_detection_config: z
      .object({
        frame_extraction_config: z
          .object({
            strategy: z.literal('uniform'),
            uniform_config: z
              .object({
                frames_per_second: z.number().gte(0.1).lte(30),
                max_width: z.number().gte(64).lte(4096),
              })
              .partial()
              .strict()
              .passthrough()
              .optional(),
          })
          .strict()
          .passthrough(),
        thumbnails_config: z
          .object({ enable_frame_thumbnails: z.boolean() })
          .partial()
          .strict()
          .passthrough(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
const CollectionList: z.ZodType<CollectionList> = z
  .object({
    object: z.literal('list'),
    data: z.array(Collection),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const AddCollectionFile: z.ZodType<AddCollectionFile> = z
  .union([
    z.object({ file_id: z.string() }).strict().passthrough(),
    z.object({ url: z.string() }).strict().passthrough(),
  ])
  .and(FileSegmentationConfig)
  .and(
    z
      .object({
        thumbnails_config: ThumbnailsConfig,
        metadata: z.object({}).partial().strict().passthrough(),
      })
      .partial()
      .strict()
      .passthrough()
  );
const CollectionFile: z.ZodType<CollectionFile> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    object: z.literal('collection_file'),
    added_at: z.number().int(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    searchable_status: z
      .enum(['pending', 'processing', 'completed', 'failed'])
      .optional(),
    file: File.optional(),
    segmentation: z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          'pending',
          'processing',
          'completed',
          'failed',
          'not_applicable',
        ]),
        file_id: z.string().uuid(),
        segmentation_config: SegmentationConfig,
      })
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
const CollectionFileList: z.ZodType<CollectionFileList> = z
  .object({
    object: z.literal('list'),
    data: z.array(CollectionFile),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const MediaDescription: z.ZodType<MediaDescription> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    thumbnail_url: z.string().url().optional(),
    content: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    duration_seconds: z.number().optional(),
    segment_summary: z
      .array(
        z
          .object({
            title: z.string(),
            summary: z.string(),
            start_time: z.number(),
            end_time: z.number(),
            thumbnail_url: z.string().url(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    chapters: z
      .array(
        z
          .object({
            index: z.number().int().gte(0),
            start_time: z.number().gte(0),
            end_time: z.number().gte(0),
            description: z.string(),
          })
          .strict()
          .passthrough()
      )
      .optional(),
    shots: z
      .array(
        z
          .object({
            index: z.number().int().gte(0),
            start_time: z.number().gte(0),
            end_time: z.number().gte(0),
          })
          .strict()
          .passthrough()
      )
      .optional(),
    total_chapters: z.number().int().gte(0).optional(),
    total_shots: z.number().int().gte(0).optional(),
    file: File.optional(),
  })
  .strict()
  .passthrough()
  .and(DescribeOutput);
const RichTranscript: z.ZodType<RichTranscript> = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    content: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    duration_seconds: z.number().optional(),
    segment_summary: z
      .array(
        z
          .object({
            title: z.string(),
            summary: z.string(),
            start_time: z.number(),
            end_time: z.number(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .optional(),
    file: File.optional(),
  })
  .strict()
  .passthrough()
  .and(DescribeOutput);
const CollectionRichTranscriptsList: z.ZodType<CollectionRichTranscriptsList> =
  z
    .object({
      object: z.literal('list'),
      data: z.array(
        z
          .object({
            file_id: z.string(),
            duration_seconds: z.number().optional(),
            data: z
              .object({
                content: z.string(),
                title: z.string(),
                summary: z.string(),
                segment_summary: z.array(
                  z
                    .object({
                      title: z.string(),
                      summary: z.string(),
                      start_time: z.number(),
                      end_time: z.number(),
                    })
                    .partial()
                    .strict()
                    .passthrough()
                ),
              })
              .partial()
              .strict()
              .passthrough()
              .and(DescribeOutput),
            file: File.optional(),
          })
          .strict()
          .passthrough()
      ),
      total: z.number().int(),
      limit: z.number().int(),
      offset: z.number().int(),
    })
    .strict()
    .passthrough();
const CollectionMediaDescriptionsList: z.ZodType<CollectionMediaDescriptionsList> =
  z
    .object({
      object: z.literal('list'),
      data: z.array(
        z
          .object({
            file_id: z.string(),
            added_at: z.number().int(),
            object: z.literal('collection_file'),
            duration_seconds: z.number().optional(),
            data: z
              .object({
                content: z.string(),
                title: z.string(),
                summary: z.string(),
                segment_summary: z.array(
                  z
                    .object({
                      title: z.string(),
                      summary: z.string(),
                      start_time: z.number(),
                      end_time: z.number(),
                    })
                    .partial()
                    .strict()
                    .passthrough()
                ),
              })
              .partial()
              .strict()
              .passthrough()
              .and(DescribeOutput),
            file: File.optional(),
          })
          .strict()
          .passthrough()
      ),
      total: z.number().int(),
      limit: z.number().int(),
      offset: z.number().int(),
    })
    .strict()
    .passthrough();
const CollectionMomentsList: z.ZodType<CollectionMomentsList> = z
  .object({
    moments: z.array(
      Moment.and(
        z
          .object({
            file_id: z.string().uuid(),
            job_id: z.string().uuid(),
            criterion_name: z.string(),
          })
          .strict()
          .passthrough()
      )
    ),
    total: z.number().int(),
    next_cursor: z.string().optional(),
  })
  .strict()
  .passthrough();
const CollectionMomentFindingsList: z.ZodType<CollectionMomentFindingsList> = z
  .object({
    findings: z.array(
      MomentFinding.and(
        z
          .object({
            file_id: z.string().uuid(),
            job_id: z.string().uuid(),
            criterion_name: z.string(),
          })
          .strict()
          .passthrough()
      )
    ),
    total: z.number().int(),
    next_cursor: z.string().optional(),
  })
  .strict()
  .passthrough();
const CollectionDelete = z
  .object({ id: z.string(), object: z.literal('collection') })
  .strict()
  .passthrough();
const CollectionUpdate = z
  .object({ name: z.string(), description: z.string() })
  .partial()
  .strict()
  .passthrough();
const CollectionFileDelete = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    object: z.literal('collection_file'),
  })
  .strict()
  .passthrough();
const FileEntities = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    thumbnail_url: z.string().url().optional(),
    entities: z.object({}).partial().strict().passthrough(),
    segment_entities: z.array(
      z
        .object({
          start_time: z.number(),
          end_time: z.number(),
          entities: z.object({}).partial().strict().passthrough(),
          thumbnail_url: z.string().url(),
        })
        .partial()
        .strict()
        .passthrough()
    ),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
    chapters: z
      .array(
        z
          .object({
            index: z.number().int().gte(0),
            start_time: z.number().gte(0),
            end_time: z.number().gte(0),
            description: z.string(),
          })
          .strict()
          .passthrough()
      )
      .optional(),
    shots: z
      .array(
        z
          .object({
            index: z.number().int().gte(0),
            start_time: z.number().gte(0),
            end_time: z.number().gte(0),
          })
          .strict()
          .passthrough()
      )
      .optional(),
    total_chapters: z.number().int().gte(0).optional(),
    total_shots: z.number().int().gte(0).optional(),
  })
  .strict()
  .passthrough();
const CollectionEntitiesList = z
  .object({
    object: z.literal('list'),
    data: z.array(
      z
        .object({
          file_id: z.string(),
          data: z
            .object({
              entities: z.object({}).partial().strict().passthrough(),
              segment_entities: z
                .array(
                  z
                    .object({
                      start_time: z.number(),
                      end_time: z.number(),
                      entities: z.object({}).partial().strict().passthrough(),
                    })
                    .partial()
                    .strict()
                    .passthrough()
                )
                .optional(),
            })
            .strict()
            .passthrough(),
        })
        .strict()
        .passthrough()
    ),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const FileFaceDetections = z
  .object({
    collection_id: z.string(),
    file_id: z.string(),
    faces: z.array(
      z
        .object({
          id: z.string().uuid(),
          face_bounding_box: z
            .object({
              height: z.number().gte(0).lte(1),
              width: z.number().gte(0).lte(1),
              top: z.number().gte(0).lte(1),
              left: z.number().gte(0).lte(1),
            })
            .strict()
            .passthrough(),
          frame_id: z.string().uuid(),
          timestamp: z.number().gte(0),
          thumbnail_url: z.string().optional(),
        })
        .strict()
        .passthrough()
    ),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();

export const schemas = {
  MomentCriterionAttachment,
  Collection,
  NewMomentCriterionAttachment,
  MomentsConfig,
  DefaultSegmentationConfig,
  NewCollection,
  CollectionList,
  AddCollectionFile,
  CollectionFile,
  CollectionFileList,
  MediaDescription,
  RichTranscript,
  CollectionRichTranscriptsList,
  CollectionMediaDescriptionsList,
  CollectionMomentsList,
  CollectionMomentFindingsList,
  CollectionDelete,
  CollectionUpdate,
  CollectionFileDelete,
  FileEntities,
  CollectionEntitiesList,
  FileFaceDetections,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/collections',
    alias: 'createCollection',
    description: `Create a new collection to organize and process video files. Collections are used to group files together and process them in a consistent way.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Collection creation parameters`,
        type: 'Body',
        schema: NewCollection,
      },
    ],
    response: Collection,
    errors: [
      {
        status: 400,
        description: `Invalid request or malformed YouTube URL`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 409,
        description: `Collection name already exists for this account`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Resource limits exceeded (total collections or files per collection)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections',
    alias: 'listCollections',
    description: `List all collections`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'order',
        type: 'Query',
        schema: z.enum(['name', 'created_at']).optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional(),
      },
      {
        name: 'collection_type',
        type: 'Query',
        schema: z
          .enum([
            'media-descriptions',
            'entities',
            'rich-transcripts',
            'face-analysis',
            'metadata',
            'moments',
          ])
          .optional(),
      },
      {
        name: 'created_after',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
      {
        name: 'created_before',
        type: 'Query',
        schema: z.string().datetime({ offset: true }).optional(),
      },
    ],
    response: CollectionList,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id',
    alias: 'getCollection',
    description: `Retrieve details about a specific collection`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Collection,
    errors: [
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/collections/:collection_id',
    alias: 'deleteCollection',
    description: `Delete a collection`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: CollectionDelete,
    errors: [
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/collections/:collection_id',
    alias: 'updateCollection',
    description: `Update a collection`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Collection update parameters`,
        type: 'Body',
        schema: CollectionUpdate,
      },
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Collection,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/videos',
    alias: 'listVideos',
    description: `List all files in a collection`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'status',
        type: 'Query',
        schema: z
          .enum([
            'pending',
            'processing',
            'completed',
            'failed',
            'not_applicable',
          ])
          .optional(),
      },
      {
        name: 'added_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'added_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'order',
        type: 'Query',
        schema: z.enum(['added_at', 'filename']).optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional(),
      },
      {
        name: 'filter',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: CollectionFileList,
    errors: [
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/videos/:file_id',
    alias: 'getVideo',
    description: `Retrieve information about a specific video file in a collection`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: CollectionFile,
    errors: [
      {
        status: 404,
        description: `Collection or file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/collections/:collection_id/videos/:file_id',
    alias: 'deleteVideo',
    description: `Remove a video file from a collection`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: CollectionFileDelete,
    errors: [
      {
        status: 404,
        description: `Collection or file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/videos/:file_id/entities',
    alias: 'getEntities',
    description: `Retrieve extracted entities for a specific file in a collection. Results are paginated with a default limit of 50 segment entities per request (maximum 100). Use limit and offset parameters to paginate through all results. This API is only available when the collection is created with collection_type &#x27;entities&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional(),
      },
      {
        name: 'include_thumbnails',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_chapters',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_shots',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: FileEntities,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;entities&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection or file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/videos/:file_id/rich-transcripts',
    alias: 'getTranscripts',
    description: `Retrieve rich transcription data for a specific file in a collection. This API is only available when the a collection is created with collection_type &#x27;rich-transcripts&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional(),
      },
      {
        name: 'start_time_seconds',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'end_time_seconds',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'modalities',
        type: 'Query',
        schema: z
          .array(
            z.enum([
              'speech',
              'visual_scene_description',
              'scene_text',
              'audio_description',
              'summary',
              'segment_summary',
              'title',
            ])
          )
          .optional(),
      },
      {
        name: 'include_word_timestamps',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_metadata',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: RichTranscript,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;rich-transcripts&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection or file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/entities',
    alias: 'listCollectionEntities',
    description: `List all extracted entities for files in a collection. This API is only available when a collection is created with collection_type &#x27;entities&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'order',
        type: 'Query',
        schema: z.enum(['added_at', 'filename']).optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional(),
      },
      {
        name: 'added_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'added_after',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: CollectionEntitiesList,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;entities&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/rich-transcripts',
    alias: 'listCollectionRichTranscripts',
    description: `List all rich transcription data for files in a collection. This API is only available when a collection is created with collection_type &#x27;rich-transcripts&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'order',
        type: 'Query',
        schema: z.enum(['added_at', 'filename']).optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional(),
      },
      {
        name: 'added_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'added_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional(),
      },
      {
        name: 'modalities',
        type: 'Query',
        schema: z
          .array(
            z.enum([
              'speech',
              'visual_scene_description',
              'scene_text',
              'audio_description',
              'summary',
              'segment_summary',
              'title',
            ])
          )
          .optional(),
      },
      {
        name: 'include_metadata',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: CollectionRichTranscriptsList,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;rich-transcripts&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/media-descriptions',
    alias: 'listCollectionMediaDescriptions',
    description: `List all media description data for files in a collection. This API is only available when a collection is created with collection_type &#x27;media-descriptions&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'order',
        type: 'Query',
        schema: z.enum(['added_at', 'filename']).optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z.enum(['asc', 'desc']).optional(),
      },
      {
        name: 'added_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'added_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional(),
      },
      {
        name: 'modalities',
        type: 'Query',
        schema: z
          .array(
            z.enum([
              'speech',
              'visual_scene_description',
              'scene_text',
              'audio_description',
              'summary',
              'segment_summary',
              'title',
            ])
          )
          .optional(),
      },
      {
        name: 'include_metadata',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: CollectionMediaDescriptionsList,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;media-descriptions&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/videos/:file_id/media-descriptions',
    alias: 'getMediaDescriptions',
    description: `Retrieve media description data for a specific file in a collection. This API is only available when the collection is created with collection_type &#x27;media-descriptions&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional(),
      },
      {
        name: 'start_time_seconds',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'end_time_seconds',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'modalities',
        type: 'Query',
        schema: z
          .array(
            z.enum([
              'speech',
              'visual_scene_description',
              'scene_text',
              'audio_description',
              'summary',
              'segment_summary',
              'title',
            ])
          )
          .optional(),
      },
      {
        name: 'include_thumbnails',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_word_timestamps',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_chapters',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_shots',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'include_metadata',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: MediaDescription,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;media-descriptions&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection or file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/videos/:file_id/face-detections',
    alias: 'getFaceDetections',
    description: `Retrieve face detections for a specific file in a collection. Results are paginated with a default limit of 50 faces per request (maximum 100). Use limit and offset parameters to paginate through all results. This API is only available when the collection is created with collection_type &#x27;face-analysis&#x27;`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'file_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional(),
      },
    ],
    response: FileFaceDetections,
    errors: [
      {
        status: 400,
        description: `Collection type is not &#x27;face-analysis&#x27;`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection, file, or face detection job not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/collections/:collection_id/media',
    alias: 'addMedia',
    description: `Add a video or audio file to a collection. This is the recommended endpoint for adding media files to collections.

**Media Type Handling:**

- **Video files**: Processed with full visual analysis (scene description, text extraction, etc.)
- **Audio files**: Visual features automatically disabled; only speech and audio analysis available

**Audio File Restrictions:**

- Audio files cannot be added to face-analysis collections
- Shot-detector segmentation is not available for audio files`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `File association parameters`,
        type: 'Body',
        schema: AddCollectionFile,
      },
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: CollectionFile,
    errors: [
      {
        status: 400,
        description: `Invalid request (e.g., audio files with shot-detector segmentation, audio in face-analysis collections)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection or file not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/moments',
    alias: 'listCollectionMoments',
    description: `Moments across current collection members, with exact total. Default sort is positional (file_id, then start_time); criterion_score and rank_score sorts require a single-criterion filter. Removing a file from the collection drops its moments from this enumeration; the underlying runs persist.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'criterion_name',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'attachment_id',
        type: 'Query',
        schema: z.string().uuid().optional(),
      },
      {
        name: 'file_id',
        type: 'Query',
        schema: z.string().uuid().optional(),
      },
      {
        name: 'min_score',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z
          .enum(['position', 'criterion_score', 'rank_score'])
          .optional()
          .optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: CollectionMomentsList,
    errors: [
      {
        status: 400,
        description: `Not a moments collection, or a score sort without a single-criterion filter`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/collections/:collection_id/moments/findings',
    alias: 'listCollectionMomentFindings',
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'criterion_name',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'file_id',
        type: 'Query',
        schema: z.string().uuid().optional(),
      },
      {
        name: 'kind',
        type: 'Query',
        schema: z.enum(['absence', 'observation']).optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: CollectionMomentFindingsList,
    errors: [
      {
        status: 400,
        description: `Not a moments collection`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/collections/:collection_id/moment-criteria',
    alias: 'createCollectionMomentCriterion',
    description: `Adds a criterion attachment and backfills existing members. The attach response charges nothing (cost header 0); per-file runs charge as they execute, and a matching prior run satisfies a pair at no extra execution.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: NewMomentCriterionAttachment,
      },
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: MomentCriterionAttachment,
    errors: [
      {
        status: 400,
        description: `Invalid criterion, or not a moments collection`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 402,
        description: `Balance cannot cover the backfill precheck`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/collections/:collection_id/moment-criteria/:attachment_id',
    alias: 'deleteCollectionMomentCriterion',
    description: `Removes the attachment; its moments and findings leave collection enumeration. Underlying runs persist as job history.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'attachment_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({ attachment_id: z.string().uuid(), deleted: z.boolean() })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Not a moments collection`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Attachment not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const CollectionsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
