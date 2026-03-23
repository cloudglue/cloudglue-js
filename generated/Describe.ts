import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { Describe } from './common';
import { DescribeOutput } from './common';
import { DescribeOutputPart } from './common';
import { SpeechOutputPart } from './common';
import { WordTimestamp } from './common';
import { ThumbnailsConfig } from './common';
import { FileSegmentationConfig } from './common';
import { SegmentationConfig } from './common';
import { SegmentationUniformConfig } from './common';
import { SegmentationShotDetectorConfig } from './common';
import { SegmentationManualConfig } from './common';
import { NarrativeConfig } from './common';
import { KeyframeConfig } from './common';
import { DescribeList } from './common';

type NewDescribe = {
  url: string;
  enable_summary?: boolean | undefined;
  enable_speech?: boolean | undefined;
  enable_visual_scene_description?: boolean | undefined;
  enable_scene_text?: boolean | undefined;
  enable_audio_description?: boolean | undefined;
  thumbnails_config?: ThumbnailsConfig | undefined;
  include_chapters?: boolean | undefined;
  include_shots?: boolean | undefined;
  use_in_default_index?: boolean | undefined;
} & FileSegmentationConfig;

const NewDescribe: z.ZodType<NewDescribe> = z
  .object({
    url: z.string(),
    enable_summary: z.boolean().optional(),
    enable_speech: z.boolean().optional(),
    enable_visual_scene_description: z.boolean().optional(),
    enable_scene_text: z.boolean().optional(),
    enable_audio_description: z.boolean().optional(),
    thumbnails_config: ThumbnailsConfig.optional(),
    include_chapters: z.boolean().optional(),
    include_shots: z.boolean().optional(),
    use_in_default_index: z.boolean().optional(),
  })
  .strict()
  .passthrough()
  .and(FileSegmentationConfig);

export const schemas = {
  NewDescribe,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/describe',
    alias: 'createDescribe',
    description: `Get a comprehensive multimodal description of a video`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Media description job parameters`,
        type: 'Body',
        schema: NewDescribe,
      },
    ],
    response: Describe,
    errors: [
      {
        status: 400,
        description: `Invalid request or missing required url/file_id`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Chat completion limits reached (monthly or daily)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 509,
        description: `Monthly description jobs limit reached`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/describe',
    alias: 'listDescribes',
    description: `List all media description jobs with optional filtering`,
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
        name: 'created_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'created_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'url',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z.enum(['json', 'markdown']).optional(),
      },
      {
        name: 'include_data',
        type: 'Query',
        schema: z.boolean().optional(),
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
    ],
    response: DescribeList,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
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
    path: '/describe/:job_id',
    alias: 'getDescribe',
    description: `Retrieve the current state of a media description job`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'response_format',
        type: 'Query',
        schema: z
          .enum([
            'json',
            'markdown',
            'speech_srt',
            'speech_vtt',
            'speech_markdown',
            'speech_text',
          ])
          .optional(),
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
    ],
    response: Describe,
    errors: [
      {
        status: 404,
        description: `Job not found`,
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
    path: '/describe/:job_id',
    alias: 'deleteDescribe',
    description: `Delete a media description job`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.object({ id: z.string() }).strict().passthrough(),
    errors: [
      {
        status: 404,
        description: `Job not found`,
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
    method: 'patch',
    path: '/describe/:job_id',
    alias: 'updateDescribe',
    description: `Toggle the &#x60;use_in_default_index&#x60; flag on an existing describe job. Enabling this makes the file searchable by default in the deep search and response APIs.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z
          .object({ use_in_default_index: z.boolean() })
          .strict()
          .passthrough(),
      },
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Describe,
    errors: [
      {
        status: 404,
        description: `Job not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const DescribeApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
