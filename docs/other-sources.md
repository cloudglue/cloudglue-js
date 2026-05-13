# Other Sources

Use any publicly available video URL directly with Cloudglue. Accepted by most API endpoints that operate on a video.

## Supported URLs

Video urls that point to a video file, as well as, public YouTube, TikTok, and Loom urls. 

## Using URLs with Cloudglue

```typescript
const url = `https://www.loom.com/share/12345678901234567890123456789012`

const description = await client.describe.createDescribe(url, {
  enable_summary: true,
  enable_speech: true,
  enable_scene_text: true,
  enable_visual_scene_description: true,
});
```
