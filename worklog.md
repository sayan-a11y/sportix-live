---
Task ID: 1
Agent: Main Agent
Task: Fix desktop slider images not showing + HeroBanner/ContinueWatching desktop visibility + rename "Live Now" to "Live Match Popular"

Work Log:
- Diagnosed that all thumbnail files exist at `/public/thumbnails/` (JPEG images with .png extension)
- Found the root cause: CSS `backgroundImage` approach was unreliable for rendering images
- Rewrote `LiveSlider.tsx` to use `<img>` tags instead of CSS `backgroundImage`
- Rewrote `HeroBanner.tsx` to use `<img>` tags and added desktop-specific layout (removed `lg:hidden`)
- Rewrote `VideoCard.tsx` to use `<img>` tags for all thumbnails
- Fixed Continue Watching section in `page.tsx` - removed `lg:hidden` so it shows on desktop too, replaced `backgroundImage` with `<img>` tags
- Renamed "Live Now" to "Live Match Popular" in page.tsx (main slider header and SportsPage)
- Removed duplicate header from LiveSlider component
- Added window resize listener to LiveSlider scroll button visibility
- Ran ESLint - no errors
- Verified dev server - all API endpoints returning 200

Stage Summary:
- All images now use `<img>` tags instead of CSS `backgroundImage` for reliable cross-browser rendering
- HeroBanner now shows on both mobile AND desktop (with larger desktop layout at 240px/280px height)
- Continue Watching now visible on all screen sizes
- "Live Now" renamed to "Live Match Popular" everywhere
- Files modified: LiveSlider.tsx, HeroBanner.tsx, VideoCard.tsx, page.tsx
