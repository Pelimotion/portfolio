# TECHNICAL SPECIFICATIONS | PELIMOTION ENGINE

## 1. DATABASE SCHEMA (SUPABASE)
Table: `blog_posts`
- `id`: UUID (Primary Key)
- `slug`: TEXT (Unique Index) - The core identifier.
- `title`: TEXT - Display title.
- `content`: TEXT - Main article body (Markdown).
- `status`: TEXT - 'draft' | 'published'.
- `category`: TEXT - Categorization for filtering.
- `meta_description`: TEXT - SEO snippet.
- `data`: JSONB - Stores complex objects:
    - `images`: `Array<{id, prompt, url}>`
    - `keywords`: `Array<string>`
    - `date`: `ISO String`
- `updated_at`: TIMESTAMPTZ - Auto-updated for sorting.

## 2. API ENDPOINTS (SERVERLESS)
- `POST /api/blog/posts`: Handles Upsert logic (Merge on Conflict).
- `POST /api/blog/generate-text`: Proxies to Vertex AI (Gemini).
- `POST /api/blog/generate-image`: Proxies to Imagen 3.0, uploads to Bunny.net.
- `POST /api/blog/upload-image`: Direct Base64 to Bunny.net upload.
- `GET /api/blog/gallery`: Scans Bunny.net storage folders to return available assets.
- `GET /api/blog/guidelines`: Fetches active AI presets from Supabase.

## 3. BUILD ENGINE (`index.js`)
- Runs during `npm run build` on Vercel.
- **Process:**
  1. Fetches all `published` posts from Supabase.
  2. Parses Markdown using `marked`.
  3. Injects content into a performance-optimized HTML template.
  4. **Dynamic Image Injection:** Replaces `[slot-id]` or `id.jpg` placeholders with CDN URLs from the `data.images` array.
  5. Generates `index.html` (List view) and individual post pages.

## 4. DEPLOYMENT PIPELINE
- **CI/CD:** GitHub Actions / Vercel.
- **Trigger:** Vercel Deploy Hook (triggered by CMS "Publicar" button).
- **Artifacts:** Static HTML files served from edge locations.
