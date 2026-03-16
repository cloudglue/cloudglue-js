import { Deep_SearchApi } from '../../generated';
import type { SearchFilter } from '../../generated/common';
import { WaitForReadyOptions } from '../types';
import { CloudglueError } from '../error';

type DeepSearchStatus = 'in_progress' | 'completed' | 'failed' | 'cancelled';

export type DeepSearchKnowledgeBase =
  | { source: 'collections'; collections: string[]; filter?: SearchFilter | null }
  | { source: 'files'; files: string[] }
  | { source: 'default' };

export interface CreateDeepSearchParams {
  /** Knowledge base configuration specifying what content to search */
  knowledge_base: DeepSearchKnowledgeBase;
  /** The search query */
  query: string;
  /** Search scope - segment-level or file-level */
  scope?: 'segment' | 'file';
  /** Maximum number of results to return (1-500) */
  limit?: number;
  /** Whether to exclude weak results */
  exclude_weak_results?: boolean;
  /** Include additional data in results */
  include?: Array<'search_queries'>;
  /** Enable server-sent events streaming */
  stream?: boolean;
  /** Run the deep search in background (async) */
  background?: boolean;
}

export interface ListDeepSearchesParams {
  limit?: number;
  offset?: number;
  status?: DeepSearchStatus;
  created_before?: string;
  created_after?: string;
}

// --- Streaming event types ---

export interface DeepSearchCreatedEvent {
  type: 'deep_search.created';
  deep_search: Record<string, any>;
}

export interface DeepSearchTextDeltaEvent {
  type: 'deep_search.text.delta';
  delta: string;
}

export interface DeepSearchTextDoneEvent {
  type: 'deep_search.text.done';
  text: string;
}

export interface DeepSearchResultAddedEvent {
  type: 'deep_search.result.added';
  result: Record<string, any>;
}

export interface DeepSearchCompletedEvent {
  type: 'deep_search.completed';
  deep_search: Record<string, any>;
}

export interface DeepSearchErrorEvent {
  type: 'error';
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

export interface DeepSearchGenericEvent {
  type: string;
  [key: string]: any;
}

export type DeepSearchStreamEventType =
  | DeepSearchCreatedEvent
  | DeepSearchTextDeltaEvent
  | DeepSearchTextDoneEvent
  | DeepSearchResultAddedEvent
  | DeepSearchCompletedEvent
  | DeepSearchErrorEvent
  | DeepSearchGenericEvent;

/**
 * Process buffered lines, yielding parsed SSE events.
 * Returns true if a [DONE] sentinel was encountered.
 */
function* processLines(
  buffer: { value: string },
): Generator<DeepSearchStreamEventType | 'DONE'> {
  let newlineIdx: number;
  while ((newlineIdx = buffer.value.indexOf('\n')) !== -1) {
    const line = buffer.value.slice(0, newlineIdx).trimEnd();
    buffer.value = buffer.value.slice(newlineIdx + 1);

    if (!line || line.startsWith('event:')) {
      continue;
    }

    if (line.startsWith('data: ')) {
      const jsonStr = line.slice(6);
      if (jsonStr === '[DONE]') {
        yield 'DONE';
        return;
      }
      try {
        yield JSON.parse(jsonStr) as DeepSearchStreamEventType;
      } catch {
        // Skip malformed JSON lines
      }
    }
  }
}

/**
 * Parse an SSE stream into an async iterable of typed events.
 */
async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<DeepSearchStreamEventType> {
  const decoder = new TextDecoder('utf-8');
  const buffer = { value: '' };
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer.value += decoder.decode(value, { stream: true });

      for (const event of processLines(buffer)) {
        if (event === 'DONE') return;
        yield event;
      }
    }

    buffer.value += decoder.decode();
    if (buffer.value) {
      for (const event of processLines(buffer)) {
        if (event === 'DONE') return;
        yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export class EnhancedDeepSearchApi {
  constructor(private readonly api: typeof Deep_SearchApi) {}

  /**
   * Create a new deep search. Deep search uses agentic retrieval and LLM summarization
   * to find specific moments across your video data.
   *
   * @param params - Deep search creation parameters
   * @returns The created deep search
   */
  async createDeepSearch(params: CreateDeepSearchParams) {
    return this.api.createDeepSearch(params);
  }

  /**
   * Create a streaming deep search using server-sent events.
   * Returns an async iterable that yields events as they arrive from the server.
   *
   * @param params - Deep search creation parameters (stream and background are set automatically)
   * @returns Async iterable of streaming events
   */
  async createStreamingDeepSearch(
    params: Omit<CreateDeepSearchParams, 'stream' | 'background'>,
  ): Promise<AsyncIterable<DeepSearchStreamEventType>> {
    const body = {
      ...params,
      stream: true,
      background: false,
    };

    const baseURL = this.api.axios.defaults.baseURL;
    const url = `${baseURL}/deepSearch`;

    const h = this.api.axios.defaults.headers as Record<string, any>;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };
    if (h['Authorization']) headers['Authorization'] = h['Authorization'];
    if (h['x-sdk-client']) headers['x-sdk-client'] = h['x-sdk-client'];
    if (h['x-sdk-version']) headers['x-sdk-version'] = h['x-sdk-version'];

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let responseData: any;
      try {
        responseData = await response.json();
        if (typeof responseData?.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData?.error?.message) {
          errorMessage = responseData.error.message;
        }
      } catch {
        // Could not parse error body
      }
      throw new CloudglueError(
        errorMessage,
        response.status,
        JSON.stringify(body),
        Object.fromEntries(response.headers.entries()),
        responseData,
      );
    }

    if (!response.body) {
      throw new CloudglueError('Response body is empty — streaming not supported in this environment');
    }

    return parseSSEStream(response.body);
  }

  /**
   * List all deep searches with pagination and filtering options.
   *
   * @param params - Optional pagination and filtering parameters
   * @returns Paginated list of deep searches
   */
  async listDeepSearches(params: ListDeepSearchesParams = {}) {
    return this.api.listDeepSearches({ queries: params });
  }

  /**
   * Retrieve a specific deep search by its ID.
   *
   * @param deepSearchId - The ID of the deep search to retrieve
   * @returns The deep search object
   */
  async getDeepSearch(deepSearchId: string) {
    return this.api.getDeepSearch({ params: { id: deepSearchId } });
  }

  /**
   * Delete a deep search by ID.
   * This operation is idempotent - deleting a non-existent deep search returns success.
   *
   * @param deepSearchId - The ID of the deep search to delete
   * @returns Deletion confirmation
   */
  async deleteDeepSearch(deepSearchId: string) {
    return this.api.deleteDeepSearch(undefined, { params: { id: deepSearchId } });
  }

  /**
   * Cancel a background deep search that is in progress.
   * If the deep search is already completed, failed, or cancelled, this returns the deep search as-is.
   *
   * @param deepSearchId - The ID of the deep search to cancel
   * @returns The deep search object
   */
  async cancelDeepSearch(deepSearchId: string) {
    return this.api.cancelDeepSearch(undefined, { params: { id: deepSearchId } });
  }

  /**
   * Waits for a background deep search to complete by polling until it reaches
   * a terminal state (completed, failed, or cancelled) or until maxAttempts is reached.
   *
   * @param deepSearchId - The ID of the deep search to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final deep search object
   * @throws {CloudglueError} If the deep search fails or maxAttempts is reached
   */
  async waitForReady(deepSearchId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const deepSearch = await this.getDeepSearch(deepSearchId);
      const status = deepSearch.status;

      if (!status) {
        throw new CloudglueError(
          `Deep search ${deepSearchId} returned without status`,
        );
      }

      if (['completed', 'failed', 'cancelled'].includes(status)) {
        if (status === 'failed') {
          throw new CloudglueError(
            `Deep search failed: ${deepSearch.error?.message || deepSearchId}`,
          );
        }
        return deepSearch;
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudglueError(
      `Timeout waiting for deep search ${deepSearchId} to complete after ${maxAttempts} attempts`,
    );
  }
}
