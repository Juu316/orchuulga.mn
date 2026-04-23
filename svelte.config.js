import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Relative ./_app/... links break CSS on nested routes (e.g. /foo/bar → foo/_app/... 404).
		paths: {
			relative: false
		},
		prerender: {
			crawl: false,
			entries: ['*'],
			concurrency: 2,
			handleMissingId: 'ignore',
			/** Safety net if crawl is enabled later: legacy HTML references WordPress oEmbed URLs. */
			handleHttpError: ({ status, path }) => {
				if (status === 404 && (path === '/wp-json' || path.includes('/wp-json/'))) return;
			}
		},
	
		adapter: adapter()
	}
};

export default config;
