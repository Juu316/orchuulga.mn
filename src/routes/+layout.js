/**
 * Pre-render every route at build time so each URL returns full static HTML (CDN-friendly, ideal for Google).
 *
 * Do not set `ssr = false` on the root layout: in SvelteKit that disables prerendering entirely and would
 * ship empty HTML to crawlers. Prerendered pages are served as static files at runtime (no per-request SSR).
 */
export const prerender = true;
