<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="facebook-domain-verification" content="49ot0otpppvhc9r39ca4f8fq8ihveh" />
</svelte:head>

{@render children()}
