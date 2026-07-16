import { z } from 'zod';

export type SearchFilter = Partial<{
  metadata: Array<
    SearchFilterCriteria &
      Partial<{
        scope: 'file' | 'segment';
      }>
  >;
  video_info: Array<
    SearchFilterCriteria &
      Partial<{
        path: 'duration_seconds' | 'has_audio';
        scope: 'file' | 'segment';
      }>
  >;
  file: Array<
    SearchFilterCriteria &
      Partial<{
        path: 'bytes' | 'filename' | 'uri' | 'created_at' | 'id';
      }>
  >;
}>;
export type SearchFilterCriteria = {
  path: string;
  operator:
    | 'NotEqual'
    | 'Equal'
    | 'LessThan'
    | 'GreaterThan'
    | 'ContainsAny'
    | 'ContainsAll'
    | 'In'
    | 'Like';
  valueText?: string | undefined;
  valueTextArray?: Array<string> | undefined;
};
export type SpeechOutputPart = Partial<{
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
  words: Array<WordTimestamp>;
}>;
export type WordTimestamp = {
  word: string;
  start_time: number;
  end_time: number;
};
export type DescribeOutput = Partial<{
  visual_scene_description: Array<DescribeOutputPart>;
  scene_text: Array<DescribeOutputPart>;
  speech: Array<SpeechOutputPart>;
  audio_description: Array<DescribeOutputPart>;
}>;
export type DescribeOutputPart = Partial<{
  text: string;
  start_time: number;
  end_time: number;
}>;
export type ThumbnailsConfig = {
  enable_segment_thumbnails: boolean;
};
export type FileSegmentationConfig = Partial<{
  segmentation_id: string;
  segmentation_config: SegmentationConfig;
}>;
export type SegmentationConfig = {
  strategy: 'uniform' | 'shot-detector' | 'manual' | 'narrative';
  uniform_config?: SegmentationUniformConfig | undefined;
  shot_detector_config?: SegmentationShotDetectorConfig | undefined;
  manual_config?: SegmentationManualConfig | undefined;
  narrative_config?: NarrativeConfig | undefined;
  keyframe_config?: KeyframeConfig | undefined;
  start_time_seconds?: number | undefined;
  end_time_seconds?: number | undefined;
};
export type SegmentationUniformConfig = {
  window_seconds: number;
  hop_seconds?: number | undefined;
};
export type SegmentationShotDetectorConfig = {
  threshold?: (number | null) | undefined;
  min_seconds?: (number | null) | undefined;
  max_seconds?: (number | null) | undefined;
  detector: 'adaptive' | 'content';
  fill_gaps?: boolean | undefined;
};
export type SegmentationManualConfig = {
  segments: Array<
    Partial<{
      start_time: number;
      end_time: number;
    }>
  >;
};
export type NarrativeConfig = Partial<{
  prompt: string;
  strategy: 'comprehensive' | 'balanced' | 'transcript';
  number_of_chapters: number;
  min_chapters: number;
  max_chapters: number;
}>;
export type KeyframeConfig = {
  frames_per_segment: number;
  max_width?: number | undefined;
};
export type File = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  bytes?: (number | null) | undefined;
  created_at?: number | undefined;
  filename?: string | undefined;
  uri: string;
  metadata?: ({} | null) | undefined;
  media_type?: ('video' | 'audio' | 'image') | undefined;
  media_info?:
    | Partial<{
        duration_seconds: number | null;
        width: number | null;
        height: number | null;
        sample_rate: number | null;
        channels: number | null;
        bitrate: number | null;
        format: string | null;
        has_audio: boolean | null;
      }>
    | undefined;
  video_info?:
    | Partial<{
        duration_seconds: number | null;
        height: number | null;
        width: number | null;
        format: string | null;
        has_audio: boolean | null;
      }>
    | undefined;
  thumbnail_url?: string | undefined;
  source?:
    | (
        | 'video'
        | 'youtube'
        | 's3'
        | 'dropbox'
        | 'http'
        | 'upload'
        | 'google-drive'
        | 'zoom'
        | 'gong'
        | 'recall'
        | 'gcs'
        | 'grain'
        | 'loom'
      )
    | null
    | undefined;
  source_metadata?: (SourceMetadata | null) | undefined;
};
export type SourceMetadata =
  | GrainSourceMetadata
  | ZoomSourceMetadata
  | RecallSourceMetadata
  | GoogleDriveSourceMetadata
  | DropboxSourceMetadata
  | GongSourceMetadata;
export type GrainSourceMetadata = {
  source_type: 'grain';
  grain_recording_id: string;
  title?: (string | null) | undefined;
  start_datetime?: (string | null) | undefined;
  end_datetime?: (string | null) | undefined;
  duration_ms?: (number | null) | undefined;
  media_type?: ('audio' | 'transcript' | 'video' | null) | undefined;
  upstream_source?:
    | (
        | 'aircall'
        | 'local_capture'
        | 'meet'
        | 'teams'
        | 'upload'
        | 'webex'
        | 'zoom'
        | 'other'
        | null
      )
    | null
    | undefined;
  grain_url?: (string | null) | undefined;
  thumbnail_url?: (string | null) | undefined;
  tags?: (Array<string> | null) | undefined;
  teams?:
    | (Array<
        Partial<{
          id: string;
          name: string;
        }>
      > | null)
    | undefined;
  meeting_type?:
    | Partial<{
        id: string;
        name: string;
        scope: string;
      }>
    | null
    | undefined;
  participants?:
    | (Array<
        Partial<{
          id: string;
          name: string;
          email: string | null;
          scope: 'internal' | 'external' | 'unknown';
          confirmed_attendee: boolean;
          hs_contact_id: string | null;
        }>
      > | null)
    | undefined;
  highlights?: (Array<{}> | null) | undefined;
  ai_summary?:
    | Partial<{
        text: string;
      }>
    | null
    | undefined;
  ai_action_items?:
    | (Array<
        Partial<{
          status: 'pending' | 'completed';
          timestamp_ms: number;
          text: string;
          assignee: Partial<{
            id: string;
            name: string;
            user_id: string | null;
          }> | null;
        }>
      > | null)
    | undefined;
  ai_template_sections?: (Array<{}> | null) | undefined;
  calendar_event?:
    | Partial<{
        ical_uid: string;
      }>
    | null
    | undefined;
  hubspot?:
    | Partial<{
        hubspot_company_ids: Array<string>;
        hubspot_deal_ids: Array<string>;
      }>
    | null
    | undefined;
};
export type ZoomSourceMetadata = {
  source_type: 'zoom';
  zoom_meeting_uuid: string;
  zoom_meeting_id?: (number | null) | undefined;
  topic?: (string | null) | undefined;
  start_time?: (string | null) | undefined;
  host_id?: (string | null) | undefined;
  host_email?: (string | null) | undefined;
  account_id?: (string | null) | undefined;
  timezone?: (string | null) | undefined;
  duration_minutes?: (number | null) | undefined;
  total_size?: (number | null) | undefined;
  recording_count?: (number | null) | undefined;
  meeting_type?: (number | null) | undefined;
  recording_files?:
    | (Array<
        Partial<{
          id: string | null;
          recording_type: string | null;
          file_type: string | null;
          file_extension: string | null;
          file_size: number | null;
          recording_start: string | null;
          recording_end: string | null;
          status: string | null;
        }>
      > | null)
    | undefined;
};
export type RecallSourceMetadata = {
  source_type: 'recall';
  recall_recording_id: string;
  created_at?: (string | null) | undefined;
  started_at?: (string | null) | undefined;
  completed_at?: (string | null) | undefined;
  expires_at?: (string | null) | undefined;
  status_code?: (string | null) | undefined;
  meeting_title?: (string | null) | undefined;
  meeting_platform?: (string | null) | undefined;
  has_transcript?: (boolean | null) | undefined;
  has_audio?: (boolean | null) | undefined;
  has_participant_events?: (boolean | null) | undefined;
  bot_id?: (string | null) | undefined;
  recall_metadata?: ({} | null) | undefined;
};
export type GoogleDriveSourceMetadata = {
  source_type: 'google-drive';
  gdrive_file_id: string;
  name?: (string | null) | undefined;
  mime_type?: (string | null) | undefined;
  size_bytes?: (number | null) | undefined;
  created_time?: (string | null) | undefined;
  modified_time?: (string | null) | undefined;
  web_view_link?: (string | null) | undefined;
  owners?:
    | (Array<
        Partial<{
          display_name: string | null;
          email_address: string | null;
        }>
      > | null)
    | undefined;
  last_modifying_user?:
    | Partial<{
        display_name: string | null;
        email_address: string | null;
      }>
    | null
    | undefined;
  parents?: (Array<string> | null) | undefined;
  shared?: (boolean | null) | undefined;
  file_extension?: (string | null) | undefined;
  md5_checksum?: (string | null) | undefined;
  video_media_metadata?:
    | Partial<{
        duration_millis: number | null;
        width: number | null;
        height: number | null;
      }>
    | null
    | undefined;
};
export type DropboxSourceMetadata = {
  source_type: 'dropbox';
  dropbox_id: string;
  name?: (string | null) | undefined;
  path_lower?: (string | null) | undefined;
  path_display?: (string | null) | undefined;
  size_bytes?: (number | null) | undefined;
  client_modified?: (string | null) | undefined;
  server_modified?: (string | null) | undefined;
  rev?: (string | null) | undefined;
  content_hash?: (string | null) | undefined;
  is_downloadable?: (boolean | null) | undefined;
  media_info?:
    | Partial<{
        duration_ms: number | null;
        width: number | null;
        height: number | null;
      }>
    | null
    | undefined;
};
export type GongSourceMetadata = {
  source_type: 'gong';
  gong_call_id: string;
  title?: (string | null) | undefined;
  started?: (string | null) | undefined;
  scheduled?: (string | null) | undefined;
  duration?: (number | null) | undefined;
  gong_url?: (string | null) | undefined;
  meeting_url?: (string | null) | undefined;
  is_private?: (boolean | null) | undefined;
  purpose?: (string | null) | undefined;
  primary_user_id?: (string | null) | undefined;
  direction?: (string | null) | undefined;
  system?: (string | null) | undefined;
  scope?: (string | null) | undefined;
  language?: (string | null) | undefined;
  workspace_id?: (string | null) | undefined;
  call_media_type?: (string | null) | undefined;
  parties?:
    | (Array<
        Partial<{
          id: string | null;
          name: string | null;
          email: string | null;
          affiliation: string | null;
          speaker_id: string | null;
          user_id: string | null;
        }>
      > | null)
    | undefined;
  topics?:
    | (Array<
        Partial<{
          name: string | null;
          duration: number | null;
        }>
      > | null)
    | undefined;
  trackers?:
    | (Array<
        Partial<{
          name: string | null;
          count: number | null;
        }>
      > | null)
    | undefined;
  brief?: (string | null) | undefined;
  key_points?: (Array<string> | null) | undefined;
};
export type Describe = {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  url?: string | undefined;
  duration_seconds?: number | undefined;
  thumbnail_url?: string | undefined;
  created_at?: number | undefined;
  describe_config?:
    | Partial<{
        enable_summary: boolean;
        enable_speech: boolean;
        enable_visual_scene_description: boolean;
        enable_scene_text: boolean;
        enable_audio_description: boolean;
        participants: Array<{
          name: string;
          scope?: string | undefined;
        }>;
      }>
    | undefined;
  use_in_default_index?: boolean | undefined;
  data?:
    | (Partial<{
        content: string;
        title: string;
        summary: string;
        segment_summary: Array<
          Partial<{
            title: string;
            summary: string;
            start_time: number;
            end_time: number;
            thumbnail_url: string;
          }>
        >;
      }> &
        DescribeOutput)
    | undefined;
  error?: string | undefined;
  segmentation_id?: string | undefined;
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
};
export type DescribeList = {
  object: 'list';
  data: Array<Describe>;
  total: number;
  limit: number;
  offset: number;
};
export type Segmentation = {
  segmentation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  created_at: number;
  file_id: string;
  segmentation_config: SegmentationConfig;
  thumbnails_config: ThumbnailsConfig;
  total_segments?: number | undefined;
  total_shots?: number | undefined;
  total_chapters?: number | undefined;
  data?:
    | {
        object: 'list';
        segments?:
          | Array<{
              id: string;
              start_time: number;
              end_time: number;
              thumbnail_url?: string | undefined;
            }>
          | undefined;
        shots?: Array<Shot> | undefined;
        chapters?: Array<Chapter> | undefined;
        total: number;
        limit: number;
        offset: number;
      }
    | undefined;
};
export type Shot = {
  index: number;
  start_time: number;
  end_time: number;
};
export type Chapter = {
  index: number;
  start_time: number;
  end_time: number;
  description: string;
};
export type FrameExtractionConfig = {
  strategy: 'uniform';
  uniform_config?: FrameExtractionUniformConfig | undefined;
  thumbnails_config?: FrameExtractionThumbnailsConfig | undefined;
  start_time_seconds?: number | undefined;
  end_time_seconds?: number | undefined;
};
export type FrameExtractionUniformConfig = Partial<{
  frames_per_second: number;
  max_width: number;
}>;
export type FrameExtractionThumbnailsConfig = Partial<{
  enable_frame_thumbnails: boolean;
}>;
export type FrameExtraction = {
  frame_extraction_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: number;
  file_id: string;
  frame_extraction_config: FrameExtractionConfig;
  frame_count?: number | undefined;
  data?:
    | {
        object: 'list';
        frames?:
          | Array<{
              id: string;
              timestamp: number;
              thumbnail_url?: string | undefined;
            }>
          | undefined;
        total: number;
        limit: number;
        offset: number;
      }
    | undefined;
};
export type ThumbnailList = {
  object: 'list';
  total: number;
  limit: number;
  offset: number;
  data: Array<Thumbnail>;
};
export type Thumbnail = {
  id: string;
  url: string;
  time: number;
  segmentation_id?: string | undefined;
  type?: ThumbnailType | undefined;
  segment_id?: string | undefined;
};
export type ThumbnailType = string;
export type FaceBoundingBox = {
  height: number;
  width: number;
  top: number;
  left: number;
};
export type ListVideoTagsResponse = PaginationResponse &
  Partial<{
    data: Array<VideoTag>;
  }>;
export type PaginationResponse = {
  object: 'list';
  total: number;
  limit: number;
  offset: number;
};
export type VideoTag = {
  id: string;
  label: string;
  value: string;
  type: 'file' | 'segment';
  file_id: string;
  segment_id?: string | undefined;
};

export const VideoTag = z
  .object({
    id: z.string().uuid(),
    label: z.string(),
    value: z.string(),
    type: z.enum(['file', 'segment']),
    file_id: z.string().uuid(),
    segment_id: z.string().uuid().optional(),
  })
  .strict()
  .passthrough();
export const PaginationResponse = z
  .object({
    object: z.literal('list'),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
export const ListVideoTagsResponse = PaginationResponse.and(
  z
    .object({ data: z.array(VideoTag) })
    .partial()
    .strict()
    .passthrough()
);
export const ThumbnailsConfig = z
  .object({ enable_segment_thumbnails: z.boolean() })
  .strict()
  .passthrough();
export const SegmentationUniformConfig = z
  .object({
    window_seconds: z.number().gte(1).lte(120),
    hop_seconds: z.number().gte(1).lte(120).optional(),
  })
  .strict()
  .passthrough();
export const SegmentationShotDetectorConfig = z
  .object({
    threshold: z.number().nullish(),
    min_seconds: z.number().gte(0.6).lte(600).nullish(),
    max_seconds: z.number().gte(1).lte(600).nullish(),
    detector: z.enum(['adaptive', 'content']),
    fill_gaps: z.boolean().optional(),
  })
  .strict()
  .passthrough();
export const SegmentationManualConfig = z
  .object({
    segments: z.array(
      z
        .object({ start_time: z.number(), end_time: z.number() })
        .partial()
        .strict()
        .passthrough()
    ),
  })
  .strict()
  .passthrough();
export const NarrativeConfig = z
  .object({
    prompt: z.string(),
    strategy: z.enum(['comprehensive', 'balanced', 'transcript']),
    number_of_chapters: z.number().int().gte(1),
    min_chapters: z.number().int().gte(1),
    max_chapters: z.number().int().gte(1),
  })
  .partial()
  .strict()
  .passthrough();
export const KeyframeConfig = z
  .object({
    frames_per_segment: z.number().gte(0).lte(8),
    max_width: z.number().gte(144).lte(4320).optional(),
  })
  .strict()
  .passthrough();
export const SegmentationConfig = z
  .object({
    strategy: z.enum(['uniform', 'shot-detector', 'manual', 'narrative']),
    uniform_config: SegmentationUniformConfig.optional(),
    shot_detector_config: SegmentationShotDetectorConfig.optional(),
    manual_config: SegmentationManualConfig.optional(),
    narrative_config: NarrativeConfig.optional(),
    keyframe_config: KeyframeConfig.optional(),
    start_time_seconds: z.number().gte(0).optional(),
    end_time_seconds: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
export const FileSegmentationConfig = z
  .object({
    segmentation_id: z.string().uuid(),
    segmentation_config: SegmentationConfig,
  })
  .partial()
  .strict()
  .passthrough();
export const GrainSourceMetadata = z
  .object({
    source_type: z.literal('grain'),
    grain_recording_id: z.string(),
    title: z.string().nullish(),
    start_datetime: z.string().datetime({ offset: true }).nullish(),
    end_datetime: z.string().datetime({ offset: true }).nullish(),
    duration_ms: z.number().int().nullish(),
    media_type: z.enum(['audio', 'transcript', 'video']).nullish(),
    upstream_source: z
      .enum([
        'aircall',
        'local_capture',
        'meet',
        'teams',
        'upload',
        'webex',
        'zoom',
        'other',
      ])
      .nullish(),
    grain_url: z.string().nullish(),
    thumbnail_url: z.string().nullish(),
    tags: z.array(z.string()).nullish(),
    teams: z
      .array(
        z
          .object({ id: z.string(), name: z.string() })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    meeting_type: z
      .object({ id: z.string(), name: z.string(), scope: z.string() })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
    participants: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            email: z.string().nullable(),
            scope: z.enum(['internal', 'external', 'unknown']),
            confirmed_attendee: z.boolean(),
            hs_contact_id: z.string().nullable(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    highlights: z
      .array(z.object({}).partial().strict().passthrough())
      .nullish(),
    ai_summary: z
      .object({ text: z.string() })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
    ai_action_items: z
      .array(
        z
          .object({
            status: z.enum(['pending', 'completed']),
            timestamp_ms: z.number().int(),
            text: z.string(),
            assignee: z
              .object({
                id: z.string(),
                name: z.string(),
                user_id: z.string().nullable(),
              })
              .partial()
              .strict()
              .passthrough()
              .nullable(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    ai_template_sections: z
      .array(z.object({}).partial().strict().passthrough())
      .nullish(),
    calendar_event: z
      .object({ ical_uid: z.string() })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
    hubspot: z
      .object({
        hubspot_company_ids: z.array(z.string()),
        hubspot_deal_ids: z.array(z.string()),
      })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
  })
  .strict()
  .passthrough();
export const ZoomSourceMetadata = z
  .object({
    source_type: z.literal('zoom'),
    zoom_meeting_uuid: z.string(),
    zoom_meeting_id: z.number().int().nullish(),
    topic: z.string().nullish(),
    start_time: z.string().datetime({ offset: true }).nullish(),
    host_id: z.string().nullish(),
    host_email: z.string().nullish(),
    account_id: z.string().nullish(),
    timezone: z.string().nullish(),
    duration_minutes: z.number().nullish(),
    total_size: z.number().nullish(),
    recording_count: z.number().nullish(),
    meeting_type: z.number().nullish(),
    recording_files: z
      .array(
        z
          .object({
            id: z.string().nullable(),
            recording_type: z.string().nullable(),
            file_type: z.string().nullable(),
            file_extension: z.string().nullable(),
            file_size: z.number().nullable(),
            recording_start: z.string().nullable(),
            recording_end: z.string().nullable(),
            status: z.string().nullable(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
  })
  .strict()
  .passthrough();
export const RecallSourceMetadata = z
  .object({
    source_type: z.literal('recall'),
    recall_recording_id: z.string(),
    created_at: z.string().nullish(),
    started_at: z.string().nullish(),
    completed_at: z.string().nullish(),
    expires_at: z.string().nullish(),
    status_code: z.string().nullish(),
    meeting_title: z.string().nullish(),
    meeting_platform: z.string().nullish(),
    has_transcript: z.boolean().nullish(),
    has_audio: z.boolean().nullish(),
    has_participant_events: z.boolean().nullish(),
    bot_id: z.string().nullish(),
    recall_metadata: z.object({}).partial().strict().passthrough().nullish(),
  })
  .strict()
  .passthrough();
export const GoogleDriveSourceMetadata = z
  .object({
    source_type: z.literal('google-drive'),
    gdrive_file_id: z.string(),
    name: z.string().nullish(),
    mime_type: z.string().nullish(),
    size_bytes: z.number().nullish(),
    created_time: z.string().nullish(),
    modified_time: z.string().nullish(),
    web_view_link: z.string().nullish(),
    owners: z
      .array(
        z
          .object({
            display_name: z.string().nullable(),
            email_address: z.string().nullable(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    last_modifying_user: z
      .object({
        display_name: z.string().nullable(),
        email_address: z.string().nullable(),
      })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
    parents: z.array(z.string()).nullish(),
    shared: z.boolean().nullish(),
    file_extension: z.string().nullish(),
    md5_checksum: z.string().nullish(),
    video_media_metadata: z
      .object({
        duration_millis: z.number().nullable(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
  })
  .strict()
  .passthrough();
export const DropboxSourceMetadata = z
  .object({
    source_type: z.literal('dropbox'),
    dropbox_id: z.string(),
    name: z.string().nullish(),
    path_lower: z.string().nullish(),
    path_display: z.string().nullish(),
    size_bytes: z.number().nullish(),
    client_modified: z.string().nullish(),
    server_modified: z.string().nullish(),
    rev: z.string().nullish(),
    content_hash: z.string().nullish(),
    is_downloadable: z.boolean().nullish(),
    media_info: z
      .object({
        duration_ms: z.number().nullable(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      })
      .partial()
      .strict()
      .passthrough()
      .nullish(),
  })
  .strict()
  .passthrough();
export const GongSourceMetadata = z
  .object({
    source_type: z.literal('gong'),
    gong_call_id: z.string(),
    title: z.string().nullish(),
    started: z.string().nullish(),
    scheduled: z.string().nullish(),
    duration: z.number().nullish(),
    gong_url: z.string().nullish(),
    meeting_url: z.string().nullish(),
    is_private: z.boolean().nullish(),
    purpose: z.string().nullish(),
    primary_user_id: z.string().nullish(),
    direction: z.string().nullish(),
    system: z.string().nullish(),
    scope: z.string().nullish(),
    language: z.string().nullish(),
    workspace_id: z.string().nullish(),
    call_media_type: z.string().nullish(),
    parties: z
      .array(
        z
          .object({
            id: z.string().nullable(),
            name: z.string().nullable(),
            email: z.string().nullable(),
            affiliation: z.string().nullable(),
            speaker_id: z.string().nullable(),
            user_id: z.string().nullable(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    topics: z
      .array(
        z
          .object({
            name: z.string().nullable(),
            duration: z.number().nullable(),
          })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    trackers: z
      .array(
        z
          .object({ name: z.string().nullable(), count: z.number().nullable() })
          .partial()
          .strict()
          .passthrough()
      )
      .nullish(),
    brief: z.string().nullish(),
    key_points: z.array(z.string()).nullish(),
  })
  .strict()
  .passthrough();
export const SourceMetadata = z.discriminatedUnion('source_type', [
  GrainSourceMetadata,
  ZoomSourceMetadata,
  RecallSourceMetadata,
  GoogleDriveSourceMetadata,
  DropboxSourceMetadata,
  GongSourceMetadata,
]);
export const File = z
  .object({
    id: z.string(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    bytes: z.number().int().nullish(),
    created_at: z.number().int().optional(),
    filename: z.string().optional(),
    uri: z.string(),
    metadata: z.object({}).partial().strict().passthrough().nullish(),
    media_type: z.enum(['video', 'audio', 'image']).optional(),
    media_info: z
      .object({
        duration_seconds: z.number().nullable(),
        width: z.number().int().nullable(),
        height: z.number().int().nullable(),
        sample_rate: z.number().int().nullable(),
        channels: z.number().int().nullable(),
        bitrate: z.number().int().nullable(),
        format: z.string().nullable(),
        has_audio: z.boolean().nullable(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    video_info: z
      .object({
        duration_seconds: z.number().nullable(),
        height: z.number().int().nullable(),
        width: z.number().int().nullable(),
        format: z.string().nullable(),
        has_audio: z.boolean().nullable(),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    thumbnail_url: z.string().optional(),
    source: z
      .enum([
        'video',
        'youtube',
        's3',
        'dropbox',
        'http',
        'upload',
        'google-drive',
        'zoom',
        'gong',
        'recall',
        'gcs',
        'grain',
        'loom',
      ])
      .optional(),
    source_metadata: SourceMetadata.nullish(),
  })
  .strict()
  .passthrough();
export const Shot = z
  .object({
    index: z.number().int(),
    start_time: z.number().gte(0),
    end_time: z.number().gte(0),
  })
  .strict()
  .passthrough();
export const Chapter = z
  .object({
    index: z.number().int(),
    start_time: z.number().gte(0),
    end_time: z.number().gte(0),
    description: z.string(),
  })
  .strict()
  .passthrough();
export const Segmentation = z
  .object({
    segmentation_id: z.string().uuid(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    created_at: z.number().gte(0),
    file_id: z.string().uuid(),
    segmentation_config: SegmentationConfig,
    thumbnails_config: ThumbnailsConfig,
    total_segments: z.number().gte(0).optional(),
    total_shots: z.number().gte(0).optional(),
    total_chapters: z.number().gte(0).optional(),
    data: z
      .object({
        object: z.literal('list'),
        segments: z
          .array(
            z
              .object({
                id: z.string().uuid(),
                start_time: z.number(),
                end_time: z.number(),
                thumbnail_url: z.string().optional(),
              })
              .strict()
              .passthrough()
          )
          .optional(),
        shots: z.array(Shot).optional(),
        chapters: z.array(Chapter).optional(),
        total: z.number().int(),
        limit: z.number().int(),
        offset: z.number().int(),
      })
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
export const ThumbnailType = z.string();
export const Thumbnail = z
  .object({
    id: z.string().uuid(),
    url: z.string(),
    time: z.number(),
    segmentation_id: z.string().uuid().optional(),
    type: ThumbnailType.optional(),
    segment_id: z.string().uuid().optional(),
  })
  .strict()
  .passthrough();
export const ThumbnailList = z
  .object({
    object: z.literal('list'),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
    data: z.array(Thumbnail),
  })
  .strict()
  .passthrough();
export const DescribeOutputPart = z
  .object({ text: z.string(), start_time: z.number(), end_time: z.number() })
  .partial()
  .strict()
  .passthrough();
export const WordTimestamp = z
  .object({ word: z.string(), start_time: z.number(), end_time: z.number() })
  .strict()
  .passthrough();
export const SpeechOutputPart = z
  .object({
    speaker: z.string(),
    text: z.string(),
    start_time: z.number(),
    end_time: z.number(),
    words: z.array(WordTimestamp),
  })
  .partial()
  .strict()
  .passthrough();
export const DescribeOutput = z
  .object({
    visual_scene_description: z.array(DescribeOutputPart),
    scene_text: z.array(DescribeOutputPart),
    speech: z.array(SpeechOutputPart),
    audio_description: z.array(DescribeOutputPart),
  })
  .partial()
  .strict()
  .passthrough();
export const SearchFilterCriteria = z
  .object({
    path: z.string(),
    operator: z.enum([
      'NotEqual',
      'Equal',
      'LessThan',
      'GreaterThan',
      'ContainsAny',
      'ContainsAll',
      'In',
      'Like',
    ]),
    valueText: z.string().optional(),
    valueTextArray: z.array(z.string()).optional(),
  })
  .strict()
  .passthrough();
export const SearchFilter = z
  .object({
    metadata: z.array(
      SearchFilterCriteria.and(
        z
          .object({ scope: z.enum(['file', 'segment']) })
          .partial()
          .strict()
          .passthrough()
      )
    ),
    video_info: z.array(
      SearchFilterCriteria.and(
        z
          .object({
            path: z.enum(['duration_seconds', 'has_audio']),
            scope: z.enum(['file', 'segment']),
          })
          .partial()
          .strict()
          .passthrough()
      )
    ),
    file: z.array(
      SearchFilterCriteria.and(
        z
          .object({
            path: z.enum(['bytes', 'filename', 'uri', 'created_at', 'id']),
          })
          .partial()
          .strict()
          .passthrough()
      )
    ),
  })
  .partial()
  .strict()
  .passthrough();
export const Describe = z
  .object({
    job_id: z.string(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'not_applicable',
    ]),
    url: z.string().optional(),
    duration_seconds: z.number().optional(),
    thumbnail_url: z.string().url().optional(),
    created_at: z.number().int().optional(),
    describe_config: z
      .object({
        enable_summary: z.boolean(),
        enable_speech: z.boolean(),
        enable_visual_scene_description: z.boolean(),
        enable_scene_text: z.boolean(),
        enable_audio_description: z.boolean(),
        participants: z
          .array(
            z
              .object({ name: z.string(), scope: z.string().optional() })
              .strict()
              .passthrough()
          )
          .max(50),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    use_in_default_index: z.boolean().optional(),
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
              thumbnail_url: z.string().url(),
            })
            .partial()
            .strict()
            .passthrough()
        ),
      })
      .partial()
      .strict()
      .passthrough()
      .and(DescribeOutput)
      .optional(),
    error: z.string().optional(),
    segmentation_id: z.string().uuid().optional(),
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
export const DescribeList = z
  .object({
    object: z.literal('list'),
    data: z.array(Describe),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
export const FrameExtractionUniformConfig = z
  .object({
    frames_per_second: z.number().gte(0.1).lte(30),
    max_width: z.number().gte(64).lte(4096),
  })
  .partial()
  .strict()
  .passthrough();
export const FrameExtractionThumbnailsConfig = z
  .object({ enable_frame_thumbnails: z.boolean() })
  .partial()
  .strict()
  .passthrough();
export const FrameExtractionConfig = z
  .object({
    strategy: z.literal('uniform'),
    uniform_config: FrameExtractionUniformConfig.optional(),
    thumbnails_config: FrameExtractionThumbnailsConfig.optional(),
    start_time_seconds: z.number().gte(0).optional(),
    end_time_seconds: z.number().gte(0).optional(),
  })
  .strict()
  .passthrough();
export const FrameExtraction = z
  .object({
    frame_extraction_id: z.string().uuid(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    created_at: z.number().gte(0),
    file_id: z.string().uuid(),
    frame_extraction_config: FrameExtractionConfig,
    frame_count: z.number().gte(0).optional(),
    data: z
      .object({
        object: z.literal('list'),
        frames: z
          .array(
            z
              .object({
                id: z.string().uuid(),
                timestamp: z.number(),
                thumbnail_url: z.string().optional(),
              })
              .strict()
              .passthrough()
          )
          .optional(),
        total: z.number().int(),
        limit: z.number().int(),
        offset: z.number().int(),
      })
      .strict()
      .passthrough()
      .optional(),
  })
  .strict()
  .passthrough();
export const FaceBoundingBox = z
  .object({
    height: z.number().gte(0).lte(1),
    width: z.number().gte(0).lte(1),
    top: z.number().gte(0).lte(1),
    left: z.number().gte(0).lte(1),
  })
  .strict()
  .passthrough();
