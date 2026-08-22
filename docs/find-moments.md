# Find Moments API

Exhaustive, rubric-driven discovery of moments inside a video. You supply a **criterion** — a rubric in plain language, plus optional typed output declarations — and a run returns every moment in the video that satisfies it, each with a reason, a rank score, and whatever structured properties the criterion declared.

Where [Search](./search.md) retrieves what already matches a query and [Extract](./extract.md) pulls structured fields, Find Moments *sweeps the whole video against a standard* and persists everything that qualifies.

Two ways to use it:

- **One video, one criterion** — `client.findMoments`, below.
- **A whole collection, on an ongoing basis** — a `moments` collection runs its criteria over every current and future member. See [Moments Collections](#moments-collections).

## Run Find Moments on One Video

```typescript
const run = await client.findMoments.createFindMoments({
  url: 'https://example.com/earnings-call.mp4',
  criterion: {
    name: 'guidance_changes',
    instructions:
      'A moment where the speaker revises forward-looking guidance — raising, lowering, or withdrawing a previously stated number.',
  },
});

const done = await client.findMoments.waitForReady(run.job_id);
console.log(done.total_moments, done.moments);
```

Runs reuse a compatible existing describe or create one internally, so a video with no describe yet is never an error. Pass `describe_job_id` to pin a specific one.

### Create options

| Option | Meaning |
|---|---|
| `url` | The video to sweep (required) |
| `criterion` | The rubric (required) — see [Criteria](#criteria) |
| `describe_job_id` | Pin a specific describe instead of reusing/creating one |
| `signals_required` | Evidence signals a moment must rest on before it is accepted. Defaults to `['speech']` — widen it for rubrics that should key off visual or audio evidence |
| `boundary_policy` | How generously moment edges are drawn: `sentence` (default), `tight`, or `loose` |
| `speaker_filter` | Restrict discovery to particular speakers |
| `min_duration_seconds` / `max_duration_seconds` | Duration bounds on accepted moments |
| `cache_policy` | `reuse` (default) or `refresh` |

## Criteria

A criterion is a name plus instructions, and optionally a declaration of what each moment should carry:

```typescript
criterion: {
  name: 'objection_handling',
  instructions:
    'A moment where the prospect raises an objection and the rep responds to it.',

  // Optional: typed fields on every accepted moment
  moment_schema: { /* JSON-schema-shaped declaration */ },

  // Optional: typed fields on non-temporal findings
  finding_schema: { /* … */ },

  // Optional: named time anchors the model should attach
  anchors: { /* … */ },

  // Optional: exactly one scoring key
  scoring: {
    key: 'severity',
    min: 0,
    max: 5,
    higher_is_better: true,
    description: 'How strongly the objection was pressed',
  },
}
```

The criterion is **snapshotted and hashed** onto the run as `criterion_hash`. Editing the rubric later produces a different hash and therefore a different run — prior results are never silently reinterpreted.

## Read a Run

```typescript
const run = await client.findMoments.getFindMoments(jobId, {
  limit: 20,           // read-time only
  min_score: 3,        // drop moments below this criterion score
  sort: 'start_time',  // 'rank_score' (API default) | 'start_time'
});
```

**`limit`, `min_score`, and `sort` are read-time shaping, not selection.** Every accepted moment is persisted, and `total_moments` always reports the full accepted count regardless of what a given read returns. Narrowing a read never destroys results — widen it again and they are still there.

### What a moment carries

| Field | Meaning |
|---|---|
| `moment_id` | Stable id |
| `start_time` / `end_time` | Bounds, in seconds |
| `title` / `reason` | What it is, and why it qualified under the rubric |
| `rank_score` | Ordering score across the run |
| `criterion_score` | `{ key, value, min, max }` when the criterion declared `scoring` |
| `properties` | The fields declared by `moment_schema` |
| `anchors` | Named time anchors, when declared |
| `speakers` | Speakers present, when applicable |
| `evidence.signals` | The signals that supported acceptance |

**Findings** are the non-temporal counterpart: `{ finding_id, kind, properties }` where `kind` is `absence` or `observation`. Use them for things a rubric establishes about the video as a whole — including that something expected never happened.

## List & Delete Runs

```typescript
// Newest first, cursor pagination
const runs = await client.findMoments.listFindMoments({
  limit: 25,
  status: 'completed',
  url: 'https://example.com/earnings-call.mp4',
});

// Delete a run along with its moments and findings
await client.findMoments.deleteFindMoments(jobId);
```

Deleting an **in-flight** run cancels and refunds it. Deleting a **completed** run is not refunded — the work was already done.

### Polling

`waitForReady(jobId, options)` merges read-time shaping into the same options object as the polling controls:

```typescript
const done = await client.findMoments.waitForReady(jobId, {
  pollingInterval: 5000,
  maxAttempts: 60,
  sort: 'start_time',
});
```

Note the attempt cap defaults to **60**, not the SDK-wide 36: moment discovery reads the whole video and routinely runs past three minutes.

## Moments Collections

A `moments` collection applies its criteria to every current **and future** member, so adding a video runs the standing rubrics over it automatically.

```typescript
const collection = await client.collections.createCollection({
  name: 'Sales calls — objections',
  collection_type: 'moments',
  moments_config: {
    criteria: [
      { name: 'objection_handling', instructions: 'A moment where the prospect raises an objection and the rep responds.' },
    ],
  },
});
```

### Attach a criterion later

Attaching backfills existing members:

```typescript
const attachment = await client.collections.createCollectionMomentCriterion(
  collectionId,
  {
    criterion: { name: 'pricing_pushback', instructions: '…' },
    boundary_policy: 'tight',        // per-attachment run options
  },
);
```

**Billing:** attaching charges nothing. Per-file runs charge as they execute, and a matching prior run (same criterion hash, same file) satisfies a pair at no extra execution.

Track progress through the attachment's `backfill_status` and its `files_total` / `files_completed` / `files_failed` counters, read back from `getCollection`'s `moments_config`.

### Enumerate moments and findings

```typescript
const moments = await client.collections.listCollectionMoments(collectionId, {
  criterion_name: 'objection_handling',
  min_score: 3,
  sort: 'criterion_score',
  limit: 50,
});

const findings = await client.collections.listCollectionMomentFindings(collectionId, {
  kind: 'absence',
});
```

`sort` defaults to `position` (by `file_id`, then `start_time`). **`criterion_score` and `rank_score` require a single-criterion filter** — pass `criterion_name` or `attachment_id`, or the request is rejected with a 400. Scores are only comparable within one rubric.

### Detaching and removing files

```typescript
await client.collections.deleteCollectionMomentCriterion(collectionId, attachmentId);
```

Detaching a criterion — or removing a file from the collection — drops the affected moments from collection enumeration. **The underlying find-moments runs persist as job history** and remain readable through `client.findMoments`. Collection membership governs enumeration, not the existence of results.

## Searching Moments

Moments are searchable with `scope: 'moment'`:

```typescript
const results = await client.search.searchContent({
  query: 'pushback on annual pricing',
  collections: [collectionId],
  scope: 'moment',
  criterion_name: 'pricing_pushback',   // optional: one rubric
});
```

Each hit is a moment plus its `criterion_name`, so a result carries both the timestamped content and the standard it was found under. See [Search](./search.md).

## Webhooks

Three events track run lifecycle — `find_moments.job.processing`, `find_moments.job.completed`, `find_moments.job.failed`. See [Advanced](./advanced.md).
