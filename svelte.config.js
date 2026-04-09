import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Relative ./_app/... links break CSS on nested routes (e.g. /foo/bar → foo/_app/... 404).
		paths: {
			relative: false
		},
		adapter: adapter({
			// see below for options that can be set here
		})
	}
};

export default config;
